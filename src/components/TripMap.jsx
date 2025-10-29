import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useCallback, useEffect, useState, useMemo, useRef, useContext } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, ZoomControl, LayersControl } from "react-leaflet"
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
import { AuthContext } from "./AuthContext"

const { BaseLayer } = LayersControl
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY


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

    const [suggestions, setSuggestions] = useState([]) // Suggestions that come from openAI
    const [selectedSuggestions, setSelectedSuggestions] = useState([]) // Suggestions the user has selected to add to their trip
    const [isSuggestionsPopupOpen, setIsSuggestionsPopupOpen] = useState(false) //State of main popup (in MapSuggestions, it's [isOpen, setIsOpen] - passed down as props)
    const [showSuggestionsOnMap, setShowSuggestionsOnMap] = useState(false) // State for showing suggestion markers   
    const [activeSuggestionCategory, setActiveSuggestionCategory] = useState(null) // State to keep track of the category of the suggestions, defined in the first popup question in MapSuggestions (as onCategorySelect)

    // Popup + flow states (to be used here and passed down to MapSuggestions)
    const [currentNode, setCurrentNode] = useState("start") // start or category
    const [branchStep, setBranchStep] = useState(0) // question index inside branch
    const [answers, setAnswers] = useState({})
    const [selectedOptions, setSelectedOptions] = useState([])
    const [textInput, setTextInput] = useState("")
    const mapRef = useRef(null) // ref to be used to zoom in to the new suggested marker added (in the MapSuggestions component)

    // MAP DESIGN

    // Category Filter component - lets the user filter the map to see different categories
    function CategoryFilter({ showStays, showEatDrink, showExplore, showEssentials, showGettingAround,
        setShowStays, setShowEatDrink, setShowExplore, setShowEssentials, setShowGettingAround }) {
        const map = useMap() //gives the Leaflet map instance so it's possible to attach a control to it

        useEffect(() => {
            const controlDiv = L.DomUtil.create("div", "leaflet-bar p-2 bg-white rounded shadow") //creates the container for the filter

            const title = L.DomUtil.create("div", "font-semibold text-gray-700 text-sm mb-1", controlDiv)
            title.textContent = "Filter by Category"

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
            const title = L.DomUtil.create("div", "font-semibold text-gray-700 text-sm mb-1", controlDiv)
            title.textContent = "Filter by Day"
            
            const days = Object.keys(showDays).sort((a, b) => a - b)

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
    const { token, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return
        }
        const fetchTripDetails = async () => {
            try {
                const data = await getTripById(tripId, token)

                if (!data) {
                    setLoading(false)
                    return
                }
                const { tripName, stays, eatDrink, explore, essentials, gettingAround } = formatTripData(data)

                setTripName(tripName)
                setStays(stays)
                setEatDrink(eatDrink)
                setExplore(explore)
                setEssentials(essentials)
                setGettingAround(gettingAround)
            } catch (err) {
                console.error("Error fetching trip details", err)

                if (err.message === "Unauthorized" || err.status === 401) { // handle expired token
                    logout(); // clear token + user state
                    navigate("/login", { replace: true })
                    return;
                }
            } finally {
                setLoading(false)
            }
        }
        fetchTripDetails()
    }, [tripId, token, logout, navigate])


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
        const { latlng, category } = event
        const lat = latlng.lat
        const lng = latlng.lng // gets lat and long from the map and turns it into latLong

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
        switch (category) {
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
    }, [stays, eatDrink, explore, essentials, gettingAround])


    // Popup to Add Marker (used in AddMarkerOnClick and SearchResultHandler)
    function openCategoryPopup({ map, lat, lng, label, onConfirm }) {
        const popup = L.popup().setLatLng([lat, lng]).openOn(map)

        // Create container
        const container = document.createElement("div")
        container.className = "flex flex-col items-center gap-2"

        // Create dropdown
        const select = document.createElement("select")
        select.className = "border border-gray-300 rounded-md text-xs px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
        const categories = [
            { value: "stay", label: "Stays" },
            { value: "eatDrink", label: "Eat & Drink" },
            { value: "explore", label: "Explore" },
            { value: "essentials", label: "Essentials" },
            { value: "gettingAround", label: "Getting Around" }
        ]
        select.innerHTML = `<option value="">Select category</option>` +
            categories.map(c => `<option value="${c.value}">${c.label}</option>`).join("")

        container.appendChild(select)

        // Create button
        const button = document.createElement("button")
        button.textContent = "Add Marker"
        button.className = "general-button my-0 w-35 text-xs"
        container.appendChild(button)

        popup.setContent(container)

        // Attach event listener
        button.addEventListener("click", () => {
            const selectedCategory = select.value
            if (!selectedCategory) {
                alert("Please select a category first")
                return
            }
            // Pass the selected category to AddMarkerCallback
            onConfirm(selectedCategory)
            map.closePopup()
        }, { once: true })
    }

    // Component that helps the click event happen (wrapper for addMarker that listens to click events - component)
    // When the map is clicked, a popup opens witb category selection and Add button
    function AddMarkerOnClick({ onClick }) { //onClick = addMarker
        const map = useMap() //get map instance

        useMapEvent("click", (mapEvent) => {
            const { lat, lng } = mapEvent.latlng

            openCategoryPopup({
                map, lat, lng, label: "Marker", onConfirm: (category) => {
                    addMarkerCallback({ latlng: { lat, lng }, category })
                    setHasChanges(true)
                }
            })
        })
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
            if (!result?.location) return // make sure location exists

            const lat = result.location.y ?? result.y
            const lng = result.location.x ?? result.x

            const tempMarker = L.marker([lat, lng]).addTo(map)

            tempMarker
                .bindTooltip(result.label || "Search result", { permanent: false, direction: "top" })
                .openTooltip()

            map.setView([lat, lng], 15) // zoom to the search result

            // Upon click
            const onClick = () => {
                openCategoryPopup({
                    map, lat, lng, label: result.label, onConfirm: (category) => {
                        if (map.hasLayer(tempMarker)) map.removeLayer(tempMarker) // Remove temporary marker
                        addMarkerCallback({ latlng: { lat, lng }, category, label: result.label }) // Call addMarkerCallback
                        setHasChanges(true)
                        setSearchResult(null) // clear search result
                    }
                })
            }
            tempMarker.on("click", onClick) // when the temp marker is clicked, run the onClick function

            return () => {
                tempMarker.off("click", onClick) // turn off click function (remove event listener)
                if (map.hasLayer(tempMarker)) {
                    map.removeLayer(tempMarker) //make sure there is no temp marker left on the map (clean up if unmounts or new result arrives)
                }
            }
        }, [result, map, addMarkerCallback, setSearchResult])
        return null
    }


    const saveChanges = () => {
        const mappedStays = stays.map(mapItemForBackend)
        const mappedEatDrink = eatDrink.map(mapItemForBackend)
        const mappedExplore = explore.map(mapItemForBackend)
        const mappedEssentials = essentials.map(mapItemForBackend)
        const mappedGettingAround = gettingAround.map(mapItemForBackend)

        updateTripById(token, tripId, tripName, mappedEatDrink, mappedExplore, mappedStays, mappedEssentials, mappedGettingAround)
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


    // User picks one suggestion & add or remove marker 
    const handleSelectSuggestion = (suggestion) => {
        const category = activeSuggestionCategory
        const lat = suggestion.lat ?? suggestion.center?.lat
        const lon = suggestion.lon ?? suggestion.center?.lon

        if (lat == null || lon == null) {
            console.error("No valid coordinates found for ", suggestion)
            return
        }
        // check if the suggestion has been added or not
        const isSelected = selectedSuggestions.some(sel => sel.originalId === suggestion.id)
        // if it has, remove
        if (isSelected) {
            const existing = selectedSuggestions.find(
                sel => sel.originalId === suggestion.id || sel.id === suggestion.id
            )
            removeTempMarker(category, existing.id)

            setSelectedSuggestions(prev =>
                prev.filter(sel => sel.originalId !== suggestion.id)
            )
            // if it hasn't, add
        } else {
            const tempId = `temp-${Date.now()}`
            const newMarker = {
                id: tempId,
                latLong: [lat, lon],
                name: suggestion.tags?.name || "(unnamed)",
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
    }


    //Delete temporary marker that came from suggestions
    function removeTempMarker(category, id) {
        const removeMarker = (markers) => markers.filter(marker => marker.id !== id)

        switch (category) {
            case "stays": setStays(prev => removeMarker(prev)); break
            case "eatDrink": setEatDrink(prev => removeMarker(prev)); break
            case "explore": setExplore(prev => removeMarker(prev)); break
            case "essentials": setEssentials(prev => removeMarker(prev)); break
            case "gettingAround": setGettingAround(prev => removeMarker(prev)); break
        }
        setHasChanges(true)
    }


    // Reset popup to initial state
    const resetPopup = () => {
        setCurrentNode("start")
        setBranchStep(0)
        setAnswers({})
        setSuggestions([])
        setTextInput("")
        setSelectedOptions([])
        setIsSuggestionsPopupOpen(false)
    }

    // Creates the buttons on the map (Back to List and Close Suggestions)
    function MapSuggestionsButtons({ onBackToList, onClose }) {
        const map = useMap()

        useEffect(() => {
            const container = L.DomUtil.create("div", "map-buttons-container")
            container.style.position = "absolute"
            container.style.bottom = "10px"
            container.style.left = "50%"
            container.style.transform = "translateX(-50%)"
            container.style.zIndex = 1000
            container.style.display = "flex"
            container.style.gap = "8px"

            const backButton = L.DomUtil.create("button", "", container)
            backButton.innerText = "Back to List"
            backButton.className = "w-40 bg-white text-zinc-800 border px-3 py-2 shadow hover:bg-zinc-100 dark:bg-[#333333] dark:text-[#dddddd]"
            L.DomEvent.on(backButton, "click", (e) => {
                L.DomEvent.stopPropagation(e);
                onBackToList();
            })
            const closeButton = L.DomUtil.create("button", "", container)
            closeButton.innerText = "Close Suggestions"
            closeButton.className = "w-40 bg-white text-zinc-800 border px-3 py-2 shadow hover:bg-zinc-100 dark:bg-[#333333] dark:text-[#dddddd]"
            L.DomEvent.on(closeButton, "click", (e) => {
                L.DomEvent.stopPropagation(e);
                onClose();
            })
            map.getContainer().appendChild(container)

            return () => { map.getContainer().removeChild(container) }
        }, [map, onBackToList, onClose])

        return null
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
        <div className="mt-15">
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
                <Link to={`/trips/${tripId}`}>
                    <button
                        className="general-button">
                        Back
                    </button>
                </Link>
                <SaveButton saveChanges={saveChanges} hasChanges={hasChanges} />
            </div>

            <MapContainer ref={mapRef} zoomControl={false} className="h-[500px] w-full" id="map">
                <LayersControl position="topright">
                    <BaseLayer checked name="Streets">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                            url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
                            tileSize={512}
                            zoomOffset={-1}
                        />
                    </BaseLayer>
                    <BaseLayer name="Satellite">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                            url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`}
                            tileSize={512}
                            zoomOffset={-1}
                        />
                    </BaseLayer>
                </LayersControl>
                {/* MapTiler Logo */}
                <a href="https://www.maptiler.com/" target="_blank">
                    <img
                        src="https://api.maptiler.com/resources/logo.svg"
                        alt="MapTiler logo"
                        className="absolute bottom-2 left-2 w-20 opacity-80 z-[1000]"
                    />
                </a>v
                <ZoomControl position="bottomright" />
                <FitBounds markers={initialMarkers} /> {/* calls the function and sets the bounds of the map to show all markers*/}
                <SearchControl /> {/* Search bar */}
                {searchResult && <SearchResultHandler result={searchResult} />} {/* Add marker from search upon click */}
                <AddMarkerOnClick
                    onClick={addMarkerCallback} />
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
                                    <label className="popup-label"> Name:
                                        <input
                                            className="popup-input"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Status:
                                        <input
                                            className="popup-input"
                                            name="status"
                                            type="text"
                                            value={marker.status || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Price:
                                        <input
                                            className="popup-input"
                                            name="price"
                                            type="text"
                                            value={marker.price || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Address:
                                        <input
                                            className="popup-input"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Day:
                                        <input
                                            className="popup-input"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> URL:
                                        <input
                                            className="popup-input"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="flex flex-col items-start mr-0">
                                        <span className="popup-label">Comments:</span>
                                        <textarea
                                            className="popup-input w-full bg-gray-200"
                                            name="comments"
                                            rows={2}
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("stay", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="delete-marker-button"
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
                                    <label className="popup-label"> Name:
                                        <input
                                            className="popup-input"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Address:
                                        <input
                                            className="popup-input"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Day:
                                        <input
                                            className="popup-input"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> URL:
                                        <input
                                            className="popup-input"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="flex flex-col items-start mr-0">
                                        <span className="popup-label">Comments:</span>
                                        <textarea
                                            className="popup-input w-full bg-gray-200"
                                            name="comments"
                                            rows={2}
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("eatDrink", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="delete-marker-button"
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
                                    <label className="popup-label"> Name:
                                        <input
                                            className="popup-input"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Price:
                                        <input
                                            className="popup-input"
                                            name="price"
                                            type="text"
                                            value={marker.price || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Address:
                                        <input
                                            className="popup-input"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Day:
                                        <input
                                            className="popup-input"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> URL:
                                        <input
                                            className="popup-input"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="flex flex-col items-start mr-0">
                                        <span className="popup-label">Comments:</span>
                                        <textarea
                                            className="popup-input w-full bg-gray-200"
                                            name="comments"
                                            rows={2}
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("explore", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="delete-marker-button"
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
                                    <label className="popup-label"> Name:
                                        <input
                                            className="popup-input"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Address:
                                        <input
                                            className="popup-input"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Day:
                                        <input
                                            className="popup-input"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> URL:
                                        <input
                                            className="popup-input"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="flex flex-col items-start mr-0">
                                        <span className="popup-label">Comments:</span>
                                        <textarea
                                            className="popup-input w-full bg-gray-200"
                                            name="comments"
                                            rows={2}
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("essentials", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="delete-marker-button"
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
                                    <label className="popup-label"> Name:
                                        <input
                                            className="popup-input"
                                            name="name"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Address:
                                        <input
                                            className="popup-input"
                                            name="address"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> Day:
                                        <input
                                            className="popup-input"
                                            name="day"
                                            type="number"
                                            value={marker.day || 1}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="popup-label"> URL:
                                        <input
                                            className="popup-input"
                                            name="url"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <label className="flex flex-col items-start mr-0">
                                        <span className="popup-label">Comments:</span>
                                        <textarea
                                            className="popup-input w-full bg-gray-200"
                                            name="comments"
                                            rows={2}
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("gettingAround", marker.id, event.target.name, event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="delete-marker-button"
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
                    <MapSuggestionsButtons
                        onBackToList={() => {
                            setShowSuggestionsOnMap(false)
                            setIsSuggestionsPopupOpen(true)
                        }}
                        onClose={() => {
                            resetPopup()
                            setShowSuggestionsOnMap(false)
                        }}
                    />
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
                    currentNode={currentNode}
                    setCurrentNode={setCurrentNode}
                    branchStep={branchStep}
                    setBranchStep={setBranchStep}
                    answers={answers}
                    setAnswers={setAnswers}
                    selectedOptions={selectedOptions}
                    setSelectedOptions={setSelectedOptions}
                    textInput={textInput}
                    setTextInput={setTextInput} />
            )}
        </div>
    )
}