import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css"
import { useParams, Link } from "react-router-dom"
import { useCallback, useEffect, useState, useMemo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, ZoomControl } from "react-leaflet"
import { getTripById } from "../util/apiCalls"
import { formatTripData, mapItemForBackend, mapCategoryForFrontend } from "../util/tripMappers"
import L, { Icon } from "leaflet" //L is not a named export from the leaflet package
import { useTrip } from "./TripContext" //Context that is passed through TripLayout (all the trip states)
import { updateTripById } from "../util/apiCalls"
import staysIconImage from "../assets/images/house.png"
import eatDrinkIconImage from "../assets/images/drinks.png"
import exploreIconImage from "../assets/images/camera.png"
import essentialsIconImage from "../assets/images/plus.png"
import gettingAroundIconImage from "../assets/images/train.png"
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch"
import SaveButton from "./SaveButton"
import MapSuggestions from "./MapSuggestions"
import { combineMarkers, getCenterOfMarkers, getRadiusFromMarkers } from "../util/geo.js"
import suggestionsIconImage from "../assets/images/placeholder1.png"



export default function TripMap() {
    //Pulling state from Context
    const { tripName, setTripName, stays, setStays, eatDrink, setEatDrink, explore, setExplore, essentials, setEssentials, gettingAround, setGettingAround } = useTrip()

    const { tripId } = useParams() // Extract dinamic URL parameter 
    const [searchResult, setSearchResult] = useState(null) // State for the search bar result
    const [hasFitBounds, setHasFitBounds] = useState(false) // Was the FitBounds (initialMarkers) already defined? Then set this to true (I need this to only render the map zoomed in on my markers once)
    const [hasChanges, setHasChanges] = useState(false) // used to track unsaved changes to make the Save Changes button another color
    const [loading, setLoading] = useState(true)

    // States used to show markers in the LayerFilter component
    const [showStays, setShowStays] = useState(true)
    const [showEatDrink, setShowEatDrink] = useState(true)
    const [showExplore, setShowExplore] = useState(true)
    const [showEssentials, setShowEssentials] = useState(true)
    const [showGettingAround, setShowGettingAround] = useState(true)

    const [activeCategory, setActiveCategory] = useState("") // State for the dropdown inside the map (lets the user choose the category of the next marker to be added)
    const [suggestions, setSuggestions] = useState([]) // Suggestions that come from openAI
    const [selectedSuggestions, setSelectedSuggestions] = useState([]) // Suggestions the user has selected to add to their trip
    const [isSuggestionsPopupOpen, setIsSuggestionsPopupOpen] = useState(false) //State of main popup (in MapSuggestions, it's [isOpen, setIsOpen] - passed down as props)
    const [showSuggestionsOnMap, setShowSuggestionsOnMap] = useState(false) // State for showing suggestion markers   
    const [activeSuggestionCategory, setActiveSuggestionCategory] = useState(null) // State to keep track of the category of the suggestions, defined in the first popup question in MapSuggestions (as onCategorySelect)

    const mapRef = useRef(null) // ref to be used to zoom in to the new suggested marker added (in the MapSuggestions component)

    // MAP DESIGN
    // Category Dropdown component - lets the user choose the category of the next marker to be added
    function CategoryDropdown({ activeCategory, setActiveCategory, setShowStays, setShowEatDrink, setShowExplore, setShowEssentials, setShowGettingAround }) {
        const map = useMap() //gives the Leaflet map instance so it's possible to attach a control to it

        useEffect(() => {
            const controlDiv = L.DomUtil.create("div", "leaflet-bar p-2 bg-white rounded shadow") //creates the container for the dropdown
            const select = L.DomUtil.create("select", "", controlDiv) //creates a select element inside the controlDiv
            select.innerHTML = `
                <option value="" disabled selected>Add Marker</option> <!-- placeholder -->
                <option value="stay">Stays</option>
                <option value="eatDrink">Eat & Drink</option>
                <option value="explore">Explore</option>
                <option value="essentials">Essentials</option>
                <option value="gettingAround">Getting Around</option>
            `
            select.value = activeCategory //sets the selected option

            select.addEventListener("change", (e) => {
                const value = e.target.value
                setActiveCategory(e.target.value) //updates state when a new category is selected
            })

            // Stop clicks from propagating to the map
            L.DomEvent.disableClickPropagation(controlDiv)
            L.DomEvent.disableScrollPropagation(controlDiv)

            const categoryControl = L.Control.extend({ //creates a custom control class
                onAdd: () => controlDiv, //how it should be added to the map
                onRemove: () => { } //no need for removal
            })

            const instance = new categoryControl({ position: "topright" }) //creates an instance of the control
            map.addControl(instance) //adds it to the map

            return () => map.removeControl(instance) //cleanup function when useEffect re-runs or component unmounts

        }, [map, activeCategory, setActiveCategory]) //dependencies

        return null
    }


    // Category Filter component - lets the user filter the map to see different categories
    function CategoryFilter({ showStays, showEatDrink, showExplore, showEssentials, showGettingAround,
        setShowStays, setShowEatDrink, setShowExplore, setShowEssentials, setShowGettingAround }) {
        const map = useMap() //gives the Leaflet map instance so it's possible to attach a control to it

        useEffect(() => {
            const controlDiv = L.DomUtil.create("div", "leaflet-bar p-2 bg-white rounded shadow") //creates the container for the filter

            const categories = [
                { value: "stay", label: " Stays", show: showStays, setShow: setShowStays },
                { value: "eatDrink", label: " Eat & Drink", show: showEatDrink, setShow: setShowEatDrink },
                { value: "explore", label: " Explore", show: showExplore, setShow: setShowExplore },
                { value: "essentials", label: " Essentials", show: showEssentials, setShow: setShowEssentials },
                { value: "gettingAround", label: " Getting Around", show: showGettingAround, setShow: setShowGettingAround },
            ]

            categories.forEach(category => {
                const label = L.DomUtil.create("label", "block mb-1", controlDiv)
                const checkbox = L.DomUtil.create("input", "", label)
                checkbox.type = "checkbox"
                checkbox.checked = category.show

                const textNode = document.createTextNode(`${category.label}`) // add text to the lable
                label.appendChild(textNode)
                checkbox.addEventListener("change", (e) => { // Connect checkbox to the state
                    category.setShow(e.target.checked)
                })
            })

            // Stop clicks from propagating to the map
            L.DomEvent.disableClickPropagation(controlDiv)
            L.DomEvent.disableScrollPropagation(controlDiv)

            const filterControl = L.Control.extend({ //creates a custom control class
                onAdd: () => controlDiv, //how it should be added to the map
                onRemove: () => { } //no need for removal
            })

            const instance = new filterControl({ position: "topleft" }) //creates an instance of the control
            map.addControl(instance) //adds it to the map

            return () => map.removeControl(instance) //cleanup function when useEffect re-runs or component unmounts

        }, [map, showStays, showEatDrink, showExplore, showEssentials, showGettingAround,
            setShowStays, setShowEatDrink, setShowExplore, setShowEssentials, setShowGettingAround]) //dependencies

        return null
    }


    // Get a list of unique days from existing markers (To be used in Day Filter)
    const [showDays, setShowDays] = useState({})
    useEffect(() => {
        const allMarkers = [...stays, ...eatDrink, ...explore, ...essentials, ...gettingAround]
        const uniqueDays = Array.from(new Set(allMarkers.map(m => m.day)))

        setShowDays(prev => {
            const updated = { ...prev }
            uniqueDays.forEach(day => {
                if (!(day in updated)) {
                    updated[day] = true
                }
            })
            return updated
        })

    }, [stays, eatDrink, explore, essentials, gettingAround])


    // Day Filter component - lets the user filter the map to see points of interest for different days of the trip
    function DayFilter({ showDays, setShowDays }) {
        const map = useMap() //gives the Leaflet map instance so it's possible to attach a control to it

        useEffect(() => {
            const controlDiv = L.DomUtil.create("div", "leaflet-bar p-2 bg-white rounded shadow") //creates the container for filter
            const days = Object.keys(showDays).sort((a, b) => a - b);

            days.forEach(day => {
                const label = L.DomUtil.create("label", "block mb-1", controlDiv)
                const checkbox = L.DomUtil.create("input", "", label)
                checkbox.type = "checkbox"
                checkbox.checked = showDays[day]

                label.appendChild(document.createTextNode(` Day ${day}`))

                checkbox.addEventListener("change", (e) => {
                    setShowDays(prev => ({ ...prev, [day]: e.target.checked }))
                })
            })

            // Stop clicks from propagating to the map
            L.DomEvent.disableClickPropagation(controlDiv)
            L.DomEvent.disableScrollPropagation(controlDiv)

            const filterControl = L.Control.extend({ //creates a custom control class
                onAdd: () => controlDiv, //how it should be added to the map
                onRemove: () => { } //no need for removal
            })

            const instance = new filterControl({ position: "topleft" }) //creates an instance of the control
            map.addControl(instance) //adds it to the map

            return () => map.removeControl(instance) //cleanup function when useEffect re-runs or component unmounts

        }, [map, showDays, setShowDays]) //dependencies

        return null
    }

    // Search Control component - lets the user search for places, like in Google Maps
    function SearchControl() {
        const map = useMap() //gives the Leaflet map instance so it's possible to attach a control to it

        useEffect(() => {
            const provider = new OpenStreetMapProvider() //geocode provider

            const searchControl = new GeoSearchControl({ //create the search bar
                provider,
                style: "bar",
                showMarker: false, // don't show the marker so this can be handled in the SearchResultHandler component
                showPopup: true,
                zoomToResult: true,
                marker: {
                    icon: new L.Icon.Default(),
                    draggable: false
                }
            })

            map.addControl(searchControl) //add the search bar to the map

            map.on('geosearch/showlocation', (e) => { //add an event listener to the search bar
                setSearchResult((e.location ? { location: e.location, label: e.location.label } : null))
            })
            return () => map.removeControl(searchControl) //clean up after unmount or re-render
        }, [map])

        return null
    }


    // MAP DATA 
    // Get data from backend (getTripById comes from util/apiCalls.js, formatTripData comes from util/formatTripData)
    useEffect(() => {
        getTripById(tripId).then(data => {
            const {
                tripName, stays, eatDrink, explore, essentials, gettingAround
            } = formatTripData(data)

            setTripName(tripName)
            setStays(stays)
            setEatDrink(eatDrink)
            setExplore(explore)
            setEssentials(essentials)
            setGettingAround(gettingAround)

            setLoading(false)
        })
    }, [tripId])


    // Create new marker icons
    const createIcon = (iconUrl) => new Icon({ iconUrl, iconSize: [65, 65] })

    const staysIcon = createIcon(staysIconImage)
    const eatDrinkIcon = createIcon(eatDrinkIconImage)
    const exploreIcon = createIcon(exploreIconImage)
    const essentialsIcon = createIcon(essentialsIconImage)
    const gettingAroundIcon = createIcon(gettingAroundIconImage)
    const suggestionsIcon = createIcon(suggestionsIconImage)


    // Helper function that checks it a marker is temporary or not, and makes it black & white if it is
    const getMarkerIcon = (marker, baseIcon) => {
        const isTemp = String(marker?.id || "").startsWith("temp-")

        // Return a new icon with the same image but adjusted class
        return new Icon({
            ...baseIcon.options,
            className: isTemp ? "grayscale" : "",
        })
    }

    // Suggestion Marker: when it's just a suggestion, use general icon. When it's a selected suggestion (added to my trip), then change to the category's item (grayscale)
    const getSuggestionMarkerIcon = (s) => {
        const selected = selectedSuggestions.find(sel => sel.originalId === s.id)
        const isAdded = !!selected
        const category = selected?.category || activeSuggestionCategory
        if (isAdded) {
          // find category icon and make it grayscale
          switch (category) {
            case "stays": return getMarkerIcon({ id: "temp-" }, staysIcon)
            case "eatDrink": return getMarkerIcon({ id: "temp-" }, eatDrinkIcon)
            case "explore": return getMarkerIcon({ id: "temp-" }, exploreIcon)
            case "essentials": return getMarkerIcon({ id: "temp-" }, essentialsIcon)
            case "gettingAround": return getMarkerIcon({ id: "temp-" }, gettingAroundIcon)
            default: return suggestionsIcon
          }
        }
        return suggestionsIcon
      }


    // Create and add a new marker to state when there is a map click

    // Callback: Because the TripMap component (parent component) re-renders every time there is a change in any state, 
    // React could create a new function object for addMarker, which makes AddMarkerOnClick see it as a new function and run again.
    // With useCallback, when the component re-renders, this function is being kept as the same object in memory, not triggering AddMarkerOnClick
    const addMarkerCallback = useCallback((event) => {
        const lat = event.latlng.lat
        const lng = event.latlng.lng // gets lat and long from the map and turns it into latLong

        // checks if there's already a marker with the same coordinates.
        const exists = [...stays, ...eatDrink, ...explore, ...essentials, ...gettingAround].some(
            marker => marker.latLong && marker.latLong.length === 2 && marker.latLong[0] === lat && marker.latLong[1] === lng)
        if (exists) return

        const latLong = [lat, lng]
        let newMarker = {
            id: `temp-${Date.now()}`, // Temporary id, just until the data is sent to the backend
            latLong,
            address: "",
            day: 1,
            comments: "",
            deleted: false
        }
        //add the new marker to the state
        switch (activeCategory) {
            case "stay":
                setShowStays(true)
                newMarker = { ...newMarker, name: event.label || "New stay item", status: "planned", price: "unknown" }
                setStays([...stays, newMarker])
                break
            case "eatDrink":
                setShowEatDrink(true)
                newMarker = { ...newMarker, name: event.label || "New eat & drink item" }
                setEatDrink([...eatDrink, newMarker])
                break
            case "explore":
                setShowExplore(true)
                newMarker = { ...newMarker, name: event.label || "New explore item" }
                setExplore([...explore, newMarker])
                break
            case "essentials":
                setShowEssentials(true)
                newMarker = { ...newMarker, name: event.label || "New essentials item" }
                setEssentials([...essentials, newMarker])
                break
            case "gettingAround":
                setGettingAround(true)
                newMarker = { ...newMarker, name: event.label || "New getting around item" }
                setGettingAround([...gettingAround, newMarker])
                break
            default:
                break
        }
    }, [activeCategory, stays, eatDrink, explore, essentials, gettingAround])

    // Component that helps the click event happen (wrapper for addMarker that listens to click events - component)
    function AddMarkerOnClick({ activeCategory, onClick }) { //onClick = addMarker
        const map = useMap() //get map instance

        useMapEvent("click", (e) => {
            if (!activeCategory) {
                const tempTooltip = L.tooltip({
                    permanent: false,
                    direction: "top",
                    className: "bg-red-200 text-red-800 p-1 rounded shadow"
                })
                    .setLatLng(e.latlng)
                    .setContent("Please select a category first")

                tempTooltip.addTo(map)
                setTimeout(() => map.removeLayer(tempTooltip), 2000) //remove tooltip after 2 seconds
                return
            }
            onClick(e)
            setHasChanges(true)
        })
        return null
    }

    // Update Trip Name Change
    const handleTripNameChange = (newName) => {
        setTripName(newName)
        setHasChanges(true)
    }

    // Update info inside the popups
    function handleMarkerFieldChange(category, id, field, value) {
        const categoryMap = {
            stay: [stays, setStays],
            eatDrink: [eatDrink, setEatDrink],
            explore: [explore, setExplore],
            essentials: [essentials, setEssentials],
            gettingAround: [gettingAround, setGettingAround]
        }
        const [markers, setMarkers] = categoryMap[category] || []

        if (!markers || !setMarkers) return

        setMarkers(markers.map(marker =>
            marker.id === id ? { ...marker, [field]: value } : marker
        ))
        setHasChanges(true)
    }

    // Change marker's location by dragging it (and reusing handleMarkerFieldChange)
    function handleMarkerDragEnd(category, id, newLatLong) {
        handleMarkerFieldChange(category, id, "latLong", newLatLong)
        setHasChanges(true)
    }

    // Delete a marker
    function handleDeleteMarker(category, id) {
        const isTemp = id.toString().startsWith("temp")

        const updateMarkers = (markers) =>
            isTemp
                ? markers.filter(marker => marker.id !== id)  // remove temp marker
                : markers.map(marker =>
                    marker.id === id ? { ...marker, deleted: true } : marker
                ) // mark non-temp as deleted

        if (category === "stay") {
            setStays(updateMarkers(stays))
        } else if (category === "eatDrink") {
            setEatDrink(updateMarkers(eatDrink))
        } else if (category === "explore") {
            setExplore(updateMarkers(explore))
        } else if (category === "essentials") {
            setEssentials(updateMarkers(essentials))
        } else {
            setGettingAround(updateMarkers(gettingAround))
        }

        setHasChanges(true)
    }

    // Component that turns a temporary marker resultant from a search to one of the trip's marker
    function SearchResultHandler({ result }) {
        const map = useMap() // get an instance of the map

        useEffect(() => {
            if (!result?.location) return; // make sure location exists

            const lat = result.location.y ?? result.y;
            const lng = result.location.x ?? result.x;

            const tempMarker = L.marker([lat, lng]).addTo(map);

            tempMarker
                .bindTooltip(result.label || "Search result", { permanent: false, direction: "top" })
                .openTooltip()

            map.setView([lat, lng], 15); // zoom to the search result

            // Upon click
            const onClick = () => {
                // if there is no category selected, open tooltip
                if (!activeCategory) {
                    const tempTooltip = L.tooltip({
                        permanent: false,
                        direction: "top",
                        className: "bg-red-200 text-red-800 p-1 rounded shadow"
                    })
                        .setLatLng([lat, lng])
                        .setContent("To add this place to your markers, please choose a category first")
                        .addTo(map) // add tooltip to map

                    setTimeout(() => map.removeLayer(tempTooltip), 2000) // remove it after 2 seconds
                    return
                }
                // if there is a category selected, remove the default temp marker from the search, and add permanent marker
                if (map.hasLayer(tempMarker)) { // remove temporary marker
                    map.removeLayer(tempMarker)
                    setHasChanges(true)
                }
                addMarkerCallback({ latlng: { lat, lng }, label: result.label }) // reuse this function to add permanent marker
                setSearchResult(null) // clear results to unmount this component
            }

            tempMarker.on("click", onClick) // when the temp marker is clicked, run the onClick function

            return () => {
                tempMarker.off("click", onClick) // turn off click function (remove event listener)
                if (map.hasLayer(tempMarker)) {
                    map.removeLayer(tempMarker) //make sure there is no temp marker left on the map (clean up if unmounts or new result arrives)
                }
            }
        }, [result, map, activeCategory, addMarkerCallback, setSearchResult])
        return null
    }


    const saveChanges = () => {
        const mappedStays = stays.map(mapItemForBackend)
        const mappedEatDrink = eatDrink.map(mapItemForBackend)
        const mappedExplore = explore.map(mapItemForBackend)
        const mappedEssentials = essentials.map(mapItemForBackend)
        const mappedGettingAround = gettingAround.map(mapItemForBackend)

        updateTripById(tripId, tripName, mappedEatDrink, mappedExplore, mappedStays, mappedEssentials, mappedGettingAround)
            .then(data => {
                console.log("Saved", data)

                if (data.stays) setStays(mapCategoryForFrontend(data.stays))
                if (data.eat_drink) setEatDrink(mapCategoryForFrontend(data.eat_drink))
                if (data.explore) setExplore(mapCategoryForFrontend(data.explore))
                if (data.essentials) setEssentials(mapCategoryForFrontend(data.essentials))
                if (data.getting_around) setGettingAround(mapCategoryForFrontend(data.getting_around))

                setHasChanges(false)
            })
            .catch(err => console.error("Error saving data", err))
    }


    // Combine all markers into one 
    const allMarkersData = useMemo(() => {
        if (loading) return { allMarkers: [], initialMarkers: [] }

        // Get markers
        const prepareMarkers = (items, extraFields = []) =>
            items
                .filter(item => !item.deleted)
                .map(item => {
                    const marker = {
                        id: item.id,
                        position: item.latLong,
                        name: item.name,
                        address: item.address,
                        day: item.day,
                        url: item.url,
                        comments: item.comments
                    }
                    extraFields.forEach(field => {
                        if (item[field] !== undefined) marker[field] = item[field]
                    })
                    return marker
                })
        // Only markers loaded from backend at the start
        const initialMarkers = [
            ...prepareMarkers(stays, ["status", "price"]).filter(m => !m.id.toString().startsWith("temp-")),
            ...prepareMarkers(eatDrink).filter(m => !m.id.toString().startsWith("temp-")),
            ...prepareMarkers(explore, ["price"]).filter(m => !m.id.toString().startsWith("temp-")),
            ...prepareMarkers(essentials).filter(m => !m.id.toString().startsWith("temp-")),
            ...prepareMarkers(gettingAround).filter(m => !m.id.toString().startsWith("temp-"))
        ]
        // combine all markers to be used in the calculation of the center point and radius for MapSuggestions
        const allMarkers = combineMarkers([
            prepareMarkers(stays, ["status", "price"]),
            prepareMarkers(eatDrink),
            prepareMarkers(explore, ["price"]),
            prepareMarkers(essentials),
            prepareMarkers(gettingAround)
        ]).map(marker => {
            const lat = marker.position?.[0] ?? null
            const lon = marker.position?.[1] ?? null
            return lat != null && lon != null ? { lat, lon } : null
        }).filter(Boolean)
        //return markers per category, combined markers, and initial markers
        return { allMarkers, initialMarkers }
    }, [loading, stays, explore, eatDrink, essentials, gettingAround])

    const { allMarkers, initialMarkers } = allMarkersData


    // MAPSUGGESTIONS (functions to pass down to MapSuggestions)
    // Calculate Center and Radius to be used for MapSuggestions (getCenterOfMarkers and getRadiusFromMarkers come from util/geo.js)
    const suggestionsParams = useMemo(() => {
        if (!allMarkers.length) return null
        const center = getCenterOfMarkers(allMarkers)
        const radius = getRadiusFromMarkers(allMarkers, center)
        return { lat: center.lat, lon: center.lon, radius }
    }, [allMarkers])


    // Add a suggested marker to the map (not tied to map clicks, that's why it's different from addMarkerCallback)
    const onAddMarker = (category, newMarker) => {
        // Decide which category array to update
        if (category === "stays") setStays(prev => [...prev, newMarker])
        if (category === "eatDrink") setEatDrink(prev => [...prev, newMarker])
        if (category === "explore") setExplore(prev => [...prev, newMarker])
        if (category === "essentials") setEssentials(prev => [...prev, newMarker])
        if (category === "gettingAround") setGettingAround(prev => [...prev, newMarker])
      
        // Make sure the category visibility toggles on
        switch (category) {
          case "stays": if (!showStays) setShowStays(true); break
          case "eatDrink": if (!showEatDrink) setShowEatDrink(true); break
          case "explore": if (!showExplore) setShowExplore(true); break
          case "essentials": if (!showEssentials) setShowEssentials(true); break
          case "gettingAround": if (!showGettingAround) setShowGettingAround(true); break
        }
      
        setHasChanges(true);
        console.log("TripMap added marker:", newMarker)
      
        if (mapRef.current) {
          mapRef.current.flyTo(newMarker.latLong, 15, { duration: 1.5 })
        }
      }


    // User picks one suggestion & add marker 
    const handleSelectSuggestion = (suggestion) => {
        const category = activeSuggestionCategory
        const lat = suggestion.lat ?? suggestion.center?.lat
        const lon = suggestion.lon ?? suggestion.center?.lon

        if (lat == null || lon == null) {
            console.error("No valid coordinates found for ", suggestion)
        }
        const tempId = `temp-${Date.now()}`
        const newMarker = {
            id: tempId,
            latLong: [lat, lon],
            name: suggestion.tags?.name || "Suggestion",
            status: "",
            price: "",
            address: suggestion.tags?.addr_street || "",
            day: 1,
            url: suggestion.tags?.website || "",
            comments: suggestion.description || ""
        }
        console.log("handleSelectSuggestion:", newMarker)

        onAddMarker(category, newMarker)
        setSelectedSuggestions(prev => [...prev,
            { ...suggestion, id: tempId, originalId: suggestion.id, isTemp: true }])
    }

    if (loading) return <h2>Loading map...</h2>

    // Everything below the if needs the data to be loaded to run


    // Make the map automatically open on my markers, not on a fixed location (and update the hasFitBounds state so this function will only run the first time the map opens, when hasFitBounds is still false)
    function FitBounds({ markers }) {
        const map = useMap()

        useEffect(() => {
            if (hasFitBounds) return
            const validBounds = markers // filter only markers with valid latLong
                .map(marker => marker.position)
                .filter(position => Array.isArray(position) && position.length === 2)

            if (validBounds.length > 0) {
                const bounds = L.latLngBounds(validBounds)
                map.fitBounds(bounds, { padding: [30, 30] })
            } else { // if there are no valid coordinates
                map.setView([0, 0], 2)
            }
            setHasFitBounds(true)
        }, [])

        return null
    }


    return (
        <div className="m-25 mt-15 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-[#dddddd]">

                <input
                    type="text"
                    value={tripName}
                    onChange={(e) => handleTripNameChange(e.target.value)}
                    className="text-4xl font-bold bg-transparent border-b-1 border-gray-300 dark:border-[#a9a9a9] focus:outline-none focus:border-b-2 text-center"
                />
                <h3 className="mt-4">Edit your trip details directly on the map</h3>
            </div>
            <div className="flex flex-row items-center justify-center gap-5">
                <Link to="..">
                    <button
                        className="w-50 my-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                        focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                        dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-[#222222]">
                        Back
                    </button>
                </Link>
                <SaveButton saveChanges={saveChanges} hasChanges={hasChanges} />
            </div>
            <MapContainer ref={mapRef} zoomControl={false} className="h-[500px] w-full" id="map">
                <ZoomControl position="bottomright" />
                <FitBounds markers={initialMarkers} /> {/* calls the function and sets the bounds of the map to show all markers*/}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SearchControl /> {/* Search bar */}
                {searchResult && <SearchResultHandler result={searchResult} />} {/* Add marker from search upon click */}
                <AddMarkerOnClick
                    activeCategory={activeCategory}
                    onClick={addMarkerCallback} />
                {/* Control - Dropdown to pick category of next marker to be added*/}
                <CategoryDropdown
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    setShowStays={setShowStays}
                    setShowEatDrink={setShowEatDrink}
                    setShowExplore={setShowExplore}
                    setShowEssentials={setShowEssentials}
                    setShowGettingAround={setShowGettingAround}
                />
                <CategoryFilter
                    showStays={showStays} setShowStays={setShowStays}
                    showEatDrink={showEatDrink} setShowEatDrink={setShowEatDrink}
                    showExplore={showExplore} setShowExplore={setShowExplore}
                    showEssentials={showEssentials} setShowEssentials={setShowEssentials}
                    showGettingAround={showGettingAround} setShowGettingAround={setShowGettingAround}
                />
                <DayFilter showDays={showDays} setShowDays={setShowDays} />

                {showStays && stays
                    .filter(marker => !marker.deleted && Array.isArray(marker.latLong) && marker.latLong.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.latLong}
                            icon={getMarkerIcon(marker, staysIcon)}
                            draggable={true} //Make it possible to drag marker to change the location
                            eventHandlers={{
                                dragend: (event) => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("stay", marker.id, newLatLong)
                                }
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700"> Name:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Status:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="status"
                                            type="text"
                                            value={marker.status || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Price:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="price"
                                            type="text"
                                            value={marker.price || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Day:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="comments"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("stay", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {showEatDrink && eatDrink
                    .filter(marker => !marker.deleted && Array.isArray(marker.latLong) && marker.latLong.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.latLong}
                            icon={getMarkerIcon(marker, eatDrinkIcon)}
                            draggable={true}
                            eventHandlers={{
                                dragend: (event) => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("eatDrink", marker.id, newLatLong)
                                }
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700"> Name:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Day:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="comments"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("eatDrink", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {showExplore && explore
                    .filter(marker => !marker.deleted && Array.isArray(marker.latLong) && marker.latLong.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.latLong}
                            icon={getMarkerIcon(marker, exploreIcon)}
                            draggable={true}
                            eventHandlers={{
                                dragend: (event => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("explore", marker.id, newLatLong)
                                })
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700"> Name:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Price:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="price"
                                            type="text"
                                            value={marker.price || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Day:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="comments"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("explore", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {showEssentials && essentials
                    .filter(marker => !marker.deleted && Array.isArray(marker.latLong) && marker.latLong.length === 2 && showDays[marker.day])
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.latLong}
                            icon={getMarkerIcon(marker, essentialsIcon)}
                            draggable={true}
                            eventHandlers={{
                                dragend: (event) => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("essentials", marker.id, newLatLong)
                                }
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700"> Name:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Day:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="comments"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("essentials", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {showGettingAround && gettingAround
                    .filter(marker => !marker.deleted && Array.isArray(marker.latLong) && marker.latLong.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.latLong}
                            icon={getMarkerIcon(marker, gettingAroundIcon)}
                            draggable={true}
                            eventHandlers={{
                                dragend: (event) => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("gettingAround", marker.id, newLatLong)
                                }
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700"> Name:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Day:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            name="comments"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("gettingAround", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {/* Rendering the suggestions that come from AI from the user clicks the 'Show on map' button (rendered in MapSuggestions)*/}
                {showSuggestionsOnMap && suggestions.map((s, index) => {
                    const lat = s.lat ?? s.center?.lat
                    const lon = s.lon ?? s.center?.lon
                    if (!lat || !lon) return null
                    
                    return (
                        <Marker
                            key={`suggestion-${index}`}
                            position={[lat, lon]}
                            icon={getSuggestionMarkerIcon(s)} // different icon for suggestions
                        >
                            <Popup>
                                <div>
                                    <strong>{s.tags?.name || "Suggestion"}</strong>
                                    <br />
                                    {s.description && <span className="text-xs">{s.description}</span>}
                                    <br />
                                    <button
                                        onClick={() => handleSelectSuggestion(s)}
                                        className="text-sm bg-zinc-900 text-white px-2 py-1 rounded mt-2"
                                    >
                                        {selectedSuggestions.some(sel => sel.originalId === s.id) ? "Added" : "Add"}
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {showSuggestionsOnMap && (
                    <div className="absolute top-50 right-4 z-[1001]">
                        <button
                            onClick={() => {
                                setShowSuggestionsOnMap(false)
                                setIsSuggestionsPopupOpen(true)
                            }}
                            className="bg-white text-zinc-800 border-5 px-3 py-2 shadow hover:bg-zinc-100 dark:bg-[#333333] dark:text-[#dddddd]"
                        >
                            Back to list
                        </button>
                    </div>
                )}

            </MapContainer>
            
            {/* Suggestions is only an option when the user already has a marker */}
            {allMarkers.length > 0 && suggestionsParams && (
                <MapSuggestions
                    tripId={tripId}
                    suggestionsParams={suggestionsParams}
                    handleSelectSuggestion={handleSelectSuggestion}
                    selectedSuggestions={selectedSuggestions}
                    setSelectedSuggestions={setSelectedSuggestions}
                    showSuggestionsOnMap={showSuggestionsOnMap}
                    setShowSuggestionsOnMap={setShowSuggestionsOnMap}
                    isOpen={isSuggestionsPopupOpen}
                    setIsOpen={setIsSuggestionsPopupOpen}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                    onCategorySelect={setActiveSuggestionCategory}
                />
            )}
        </div>
    )
}