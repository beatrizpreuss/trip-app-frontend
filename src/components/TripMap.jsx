import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css"
import { useParams, Link } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, ZoomControl } from "react-leaflet"
import { getTripById } from "../util/apiCalls"
import L, { Icon } from "leaflet" //L is not a named export from the leaflet package
import { useTrip } from "./TripContext" //Context that is passed through TripLayout (all the trip states)
import { updateTripById } from "../util/apiCalls"
import staysIconImage from "../assets/images/house.png"
import eatDrinkIconImage from "../assets/images/drinks.png"
import exploreIconImage from "../assets/images/camera.png"
import essentialsIconImage from "../assets/images/plus.png"
import gettingAroundIconImage from "../assets/images/train.png"
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch"


export default function TripMap() {
    //Pulling state from Context
    const { tripName, setTripName, stays, setStays, eatDrink, setEatDrink, explore, setExplore, essentials, setEssentials, gettingAround, setGettingAround } = useTrip()

    // State for the search bar result
    const [searchResult, setSearchResult] = useState(null)

    // Extract dinamic URL parameter
    const { tripId } = useParams()

    // Was the FitBounds (initialMarkers) already defined? Then set this to true (I need this to only render the map zoomed in on my markers once)
    const [hasFitBounds, setHasFitBounds] = useState(false)

    // used to track unsaved changes to make the Save Changes button another color
    const [hasChanges, setHasChanges] = useState(false)

    const [loading, setLoading] = useState(true)

    // States used to show markers in the LayerFilter component
    const [showStays, setShowStays] = useState(true)
    const [showEatDrink, setShowEatDrink] = useState(true)
    const [showExplore, setShowExplore] = useState(true)
    const [showEssentials, setShowEssentials] = useState(true)
    const [showGettingAround, setShowGettingAround] = useState(true)

    // State for the dropdown inside the map (lets the user choose the category of the next marker to be added)
    const [activeCategory, setActiveCategory] = useState("")



    // MAP DESIGN
    // Category Dropdown component - lets the user choose the category of the next marker to be added
    function CategoryDropdown({ activeCategory, setActiveCategory }) {
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
                setActiveCategory(e.target.value)
            }) //updates state when a new category is selected

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


    // To be used in Day Filter
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
            const days = Object.keys(showDays).sort((a,b) => a - b);

            days.forEach(day => {
                const label = L.DomUtil.create("label", "block mb-1", controlDiv)
                const checkbox = L.DomUtil.create("input", "", label)
                checkbox.type = "checkbox"
                checkbox.checked = showDays[day]

                label.appendChild(document.createTextNode(` Day ${day}`));

                checkbox.addEventListener("change", (e) => {
                    setShowDays(prev => ({ ...prev, [day]: e.target.checked }));
                });
            });


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
    // Get data from backend
    useEffect(() => {
        getTripById(tripId)
            .then(data => {
                setTripName(data.trip.name)
                setStays(
                    data.stays.map(stay => ({ // Match the names with backend to get data and turn latlong into an array
                        ...stay,
                        latLong:
                            stay.coordinates
                                ? stay.coordinates.split(",").map(Number)
                                : null,
                        url: stay.external_url,
                    }))
                )
                setEatDrink(
                    data.eat_drink.map(eat => ({
                        ...eat,
                        latLong:
                            eat.coordinates
                                ? eat.coordinates.split(",").map(Number)
                                : null,
                        url: eat.external_url,
                    }))
                )
                setExplore(
                    data.explore.map(expl => ({
                        ...expl,
                        latLong:
                            expl.coordinates
                                ? expl.coordinates.split(",").map(Number)
                                : null,
                        url: expl.external_url,
                    }))
                )
                setEssentials(
                    data.essentials.map(essential => ({
                        ...essential,
                        latLong:
                            essential.coordinates
                                ? essential.coordinates.split(",").map(Number)
                                : null,
                        url: essential.external_url,
                    }))
                )
                setGettingAround(
                    data.getting_around.map(around => ({
                        ...around,
                        latLong:
                            around.coordinates
                                ? around.coordinates.split(",").map(Number)
                                : null,
                        url: around.external_url,
                    }))
                )
                setLoading(false)
            })
    }, [tripId])

    // Create new marker icons
    const staysIcon = new Icon({
        iconUrl: staysIconImage,
        iconSize: [65, 65]
    })

    const eatDrinkIcon = new Icon({
        iconUrl: eatDrinkIconImage,
        iconSize: [65, 65]
    })

    const exploreIcon = new Icon({
        iconUrl: exploreIconImage,
        iconSize: [65, 65]
    })

    const essentialsIcon = new Icon({
        iconUrl: essentialsIconImage,
        iconSize: [65, 65]
    })

    const gettingAroundIcon = new Icon({
        iconUrl: gettingAroundIconImage,
        iconSize: [65, 65]
    })

    // Create and add a new marker to state when there is a map click

    // Callback: Because the TripMap component (parent component) re-renders every time there is a change in any state, 
    // React could create a new function object for addMarker, which makes AddMarkerOnClick see it as a new function and run again.
    // With useCallback, when the component re-renders, this function is being kept as the same object in memory, not triggering AddMarkerOnClick
    const addMarkerCallback = useCallback((event) => {
        const lat = event.latlng.lat
        const lng = event.latlng.lng // gets lat and long from the map and turns it into latLong

        // checks if there's already a marker with the same coordinates.
        const exists = [...stays, ...eatDrink, ...explore, ...essentials, ...gettingAround].some(
            marker => marker.latLong[0] === lat && marker.latLong[1] === lng)
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
        if (activeCategory === "stay") {
            newMarker = {
                ...newMarker,
                name: event.label || "New stay item",
                status: "planned",
                price: "unknown"
            }
            setStays([...stays, newMarker])
        } else if (activeCategory === "eatDrink") {
            newMarker = {
                ...newMarker,
                name: event.label || "New eat & drink item"
            }
            setEatDrink([...eatDrink, newMarker])
        } else if (activeCategory === "explore") {
            newMarker = {
                ...newMarker,
                name: event.label || "New explore item"
            }
            setExplore([...explore, newMarker])
        } else if (activeCategory === "essentials") {
            newMarker = {
                ...newMarker,
                name: event.label || "New essentials item"
            }
            setEssentials([...essentials, newMarker])
        } else {
            newMarker = {
                ...newMarker,
                name: event.label || "New getting around item"
            }
            setGettingAround([...gettingAround, newMarker])
        }
    }, [activeCategory, stays, eatDrink, explore, essentials, gettingAround])

    // Component that helps the click event happen (wrapper for addMarker that listens to click events)
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

    // Update info inside the popups
    function handleMarkerFieldChange(category, id, field, value) {
        if (category === "stay") {
            setStays(stays.map(stay =>
                stay.id === id ? { ...stay, [field]: value } : stay
            ))
        } else if (category === "eatDrink") {
            setEatDrink(eatDrink.map(eat =>
                eat.id === id ? { ...eat, [field]: value } : eat
            ))
        } else if (category === "explore") {
            setExplore(explore.map(expl =>
                expl.id === id ? { ...expl, [field]: value } : expl
            ))
        } else if (category === "essentials") {
            setEssentials(essentials.map(essential =>
                essential.id === id ? { ...essential, [field]: value } : essential
            ))
        } else {
            setGettingAround(gettingAround.map(around =>
                around.id === id ? { ...around, [field]: value } : around
            ))
        }
        setHasChanges(true)
    }

    // Change marker's location by dragging it (and reusing handleMarkerFieldChange)
    function handleMarkerDragEnd(category, id, newLatLong) {
        handleMarkerFieldChange(category, id, "latLong", newLatLong)
        setHasChanges(true)
    }

    // Delete a marker
    function handleDeleteMarker(category, id) {
        if (category === "stay") {
            setStays(stays.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
        } else if (category === "eatDrink") {
            setEatDrink(eatDrink.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
        } else if (category === "explore") {
            setExplore(explore.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
        } else if (category === "essentials") {
            setEssentials(essentials.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
        } else {
            setGettingAround(gettingAround.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
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
        // Match the names to the backend to send data
        const mappedStays = stays.map(stay => ({
            id: stay.id && stay.id.toString().startsWith("temp-") ? null : stay.id, // reads the temporary id (which starts with "temp") then turns it to null so the backend can add a real id later
            name: stay.name,
            status: stay.status,
            price: stay.price,
            address: stay.address,
            day: stay.day,
            coordinates: stay.latLong ? stay.latLong.join(",") : null,
            external_url: stay.url,
            comments: stay.comments,
            deleted: stay.deleted || false
        }))

        const mappedEatDrink = eatDrink.map(eat => ({
            id: eat.id && eat.id.toString().startsWith("temp-") ? null : eat.id,
            name: eat.name,
            address: eat.address,
            day: eat.day,
            coordinates: eat.latLong ? eat.latLong.join(",") : null,
            external_url: eat.url,
            comments: eat.comments,
            deleted: eat.deleted || false
        }))

        const mappedExplore = explore.map(expl => ({
            id: expl.id && expl.id.toString().startsWith("temp-") ? null : expl.id,
            name: expl.name,
            price: expl.price,
            address: expl.address,
            day: expl.day,
            coordinates: expl.latLong ? expl.latLong.join(",") : null,
            external_url: expl.url,
            comments: expl.comments,
            deleted: expl.deleted || false
        }))

        const mappedEssentials = essentials.map(essential => ({
            id: essential.id && essential.id.toString().startsWith("temp-") ? null : essential.id,
            name: essential.name,
            address: essential.address,
            day: essential.day,
            coordinates: essential.latLong ? essential.latLong.join(",") : null,
            external_url: essential.url,
            comments: essential.comments,
            deleted: essential.deleted || false
        }))

        const mappedGettingAround = gettingAround.map(around => ({
            id: around.id && around.id.toString().startsWith("temp-") ? null : around.id,
            name: around.name,
            address: around.address,
            day: around.day,
            coordinates: around.latLong ? around.latLong.join(",") : null,
            external_url: around.url,
            comments: around.comments,
            deleted: around.deleted || false
        }))
        updateTripById(tripId, tripName, mappedEatDrink, mappedExplore, mappedStays, mappedEssentials, mappedGettingAround)
            .then(data => {
                console.log("Saved", data)

                //Replace frontend state with backend response
                if (data.stays) {
                    setStays(
                        data.stays.map(stay => ({
                            ...stay,
                            latLong: stay.coordinates ? stay.coordinates.split(",").map(Number) : null,
                            url: stay.external_url,
                        }))
                    )
                }

                if (data.eat_drink) {
                    setEatDrink(
                        data.eat_drink.map(eat => ({
                            ...eat,
                            latLong: eat.coordinates ? eat.coordinates.split(",").map(Number) : null,
                            url: eat.external_url,
                        }))
                    )
                }

                if (data.explore) {
                    setExplore(
                        data.explore.map(expl => ({
                            ...expl,
                            latLong: expl.coordinates ? expl.coordinates.split(",").map(Number) : null,
                            url: expl.external_url,
                        }))
                    )
                }

                if (data.essentials) {
                    setEssentials(
                        data.essentials.map(essential => ({
                            ...essential,
                            latLong: essential.coordinates ? essential.coordinates.split(",").map(Number) : null,
                            url: essential.external_url,
                        }))
                    )
                }

                if (data.getting_around) {
                    setGettingAround(
                        data.getting_around.map(around => ({
                            ...around,
                            latLong: around.coordinates ? around.coordinates.split(",").map(Number) : null,
                            url: around.external_url,
                        }))
                    )
                }
                setHasChanges(false)
            })
            .catch(err => console.error("Error saving data", err))
    }


    if (loading) return <h2>Loading map...</h2>

    // Everything below the if needs the data to be loaded to run

    // Only get details after data is loaded
    const staysMarkers = stays
        .filter(item => !item.deleted) // hide marker immediately if it has been deleted from map
        .map(item => ({
            id: item.id,
            position: item.latLong,
            name: item.name,
            status: item.status,
            price: item.price,
            address: item.address,
            day: item.day,
            url: item.url,
            comments: item.comments
        }))

    const eatDrinkMarkers = eatDrink
        .filter(item => !item.deleted)
        .map(item => ({
            id: item.id,
            position: item.latLong,
            name: item.name,
            address: item.address,
            day: item.day,
            url: item.url,
            comments: item.comments
        }))

    const exploreMarkers = explore
        .filter(item => !item.deleted)
        .map(item => ({
            id: item.id,
            position: item.latLong,
            name: item.name,
            price: item.price,
            address: item.address,
            day: item.day,
            url: item.url,
            comments: item.comments
        }))

    const essentialsMarkers = essentials
        .filter(item => !item.deleted)
        .map(item => ({
            id: item.id,
            position: item.latLong,
            name: item.name,
            address: item.address,
            day: item.day,
            url: item.url,
            comments: item.comments
        }))

    const gettingAroundMarkers = gettingAround
        .filter(item => !item.deleted)
        .map(item => ({
            id: item.id,
            position: item.latLong,
            name: item.name,
            address: item.address,
            day: item.day,
            url: item.url,
            comments: item.comments
        }))


    // Only markers loaded from backend at the start
    const initialMarkers = [
        ...staysMarkers.filter(m => !m.id.toString().startsWith("temp-")),
        ...eatDrinkMarkers.filter(m => !m.id.toString().startsWith("temp-")),
        ...exploreMarkers.filter(m => !m.id.toString().startsWith("temp-")),
        ...essentialsMarkers.filter(m => !m.id.toString().startsWith("temp-")),
        ...gettingAroundMarkers.filter(m => !m.id.toString().startsWith("temp-"))
    ]

    // Make the map automatically open on my markers, not on a fixed location (and update the hasFitBounds state so this function will only run the first time the map opens, when hasFitBounds is still false)
    // !! hasFitBound state has also resolved the problem of the zoom not working with addresses !! ******************** DEBUGGED
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
                    onChange={(e) => setTripName(e.target.value)}
                    className="text-4xl font-bold bg-transparent border-b-1 border-gray-300 dark:border-[#a9a9a9] focus:outline-none focus:border-b-2 text-center"
                />
                <h3 className="mt-4 mb-25">Edit your trip details directly on the map</h3>
            </div>
            {/* <div className="flex flex-col justify-center items-center dark:text-[#dddddd]">
                <h1 className="mb-15 text-4xl font-bold">{tripName}</h1>
            </div> */}
            <MapContainer zoomControl={false} className="h-[500px] w-full">
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
                />
                <CategoryFilter
                    showStays={showStays} setShowStays={setShowStays}
                    showEatDrink={showEatDrink} setShowEatDrink={setShowEatDrink}
                    showExplore={showExplore} setShowExplore={setShowExplore}
                    showEssentials={showEssentials} setShowEssentials={setShowEssentials}
                    showGettingAround={showGettingAround} setShowGettingAround={setShowGettingAround}
                />
                <DayFilter showDays={showDays} setShowDays={setShowDays} />

                {showStays && staysMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={staysIcon}
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

                {showEatDrink && eatDrinkMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={eatDrinkIcon}
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

                {showExplore && exploreMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={exploreIcon}
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

                {showEssentials && essentialsMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2 && showDays[marker.day])
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={essentialsIcon}
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

                {showGettingAround && gettingAroundMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2 && (showDays[marker.day] ?? true))
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={gettingAroundIcon}
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

            </MapContainer>

            <Link to="..">
                <button
                    className="w-50 my-5 mr-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                        focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                        dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-[#222222]">
                    Back
                </button>
            </Link>
            <button
                onClick={saveChanges}
                className={`${hasChanges ? "bg-red-400" : "bg-zinc-900 dark:bg-[#dddddd]"} w-50 my-5 mr-5 text-zinc-100  hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-[#222222]`}>
                Save Changes
            </button>
        </div>
    )
}