import "leaflet/dist/leaflet.css"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from "react-leaflet"
import { getTripById } from "../util/apiCalls"
import L, { Icon } from "leaflet" //L is not a named export from the leaflet package
import { useTrip } from "./TripContext"
import { updateTripById } from "../util/apiCalls"
import accommodationIconImage from "../assets/images/placeholder1.png"
import foodIconImage from "../assets/images/placeholder2.png"
import pointsOfInterestIconImage from "../assets/images/placeholder3.png"
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch"
import "leaflet-geosearch/dist/geosearch.css";


export default function TripMap() {
    //Pulling state from Context
    const { tripName, setTripName, accommodations, setAccommodations, foods, setFoods, pointsOfInterest, setPointsOfInterest } = useTrip()

    const [searchResult, setSearchResult] = useState(null)

    const { tripId } = useParams()

    const [loading, setLoading] = useState(true)

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
                <option value="accommodation">Accommodation</option>
                <option value="food">Food</option>
                <option value="pointOfInterest">Point of Interest</option>
            `

            select.value = activeCategory //sets the selected option


            select.addEventListener("change", (e) => {
                setActiveCategory(e.target.value)
            }) //updates state when a new category is selected

            // Stop clicks from propagating to the map
            L.DomEvent.disableClickPropagation(controlDiv)
            L.DomEvent.disableScrollPropagation(controlDiv)

            const customControl = L.Control.extend({ //creates a custom control class
                onAdd: () => controlDiv, //how it should be added to the map
                onRemove: () => { } //no need for removal
            })

            const instance = new customControl({ position: "topright" }) //creates an instance of the control
            map.addControl(instance) //adds it to the map

            return () => map.removeControl(instance) //cleanup function when useEffect re-runs or component unmounts

        }, [map, activeCategory, setActiveCategory]) //dependencies

        return null
    }

    //Search Control component - lets the user search for places, like in Google Maps
    function SearchControl() {
        const map = useMap() //gives the Leaflet map instance so it's possible to attach a control to it

        useEffect(() => {
            const provider = new OpenStreetMapProvider() //geocode provider

            const searchControl = new GeoSearchControl({ //create the search bar
                provider,
                style: "bar",
                showMarker: false, // don't show the marker so this can be handled in the SearchResultHandler component
                showPopup: true,
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
                setAccommodations(
                    data.accommodations.map(acc => ({ // Match the names with backend to get data and turn latlong into an array
                        ...acc,
                        latLong:
                            acc.lat_long
                                ? acc.lat_long.split(",").map(Number)
                                : null,
                        url: acc.external_url,
                        comments: acc.comment
                    }))
                )
                setFoods(
                    data.foods.map(food => ({
                        ...food,
                        latLong:
                            food.lat_long
                                ? food.lat_long.split(",").map(Number)
                                : null,
                        url: food.external_url,
                        comments: food.comment
                    }))
                )
                setPointsOfInterest(
                    data.points_of_interest.map(poi => ({
                        ...poi,
                        latLong:
                            poi.lat_long
                                ? poi.lat_long.split(",").map(Number)
                                : null,
                        url: poi.external_url,
                        comments: poi.comment
                    }))
                )
                setLoading(false)
            })
    }, [tripId])

    // Create new marker icons
    const accommodationIcon = new Icon({
        iconUrl: accommodationIconImage,
        iconSize: [38, 38]
    })

    const foodIcon = new Icon({
        iconUrl: foodIconImage,
        iconSize: [38, 38]
    })

    const pointOfInterestIcon = new Icon({
        iconUrl: pointsOfInterestIconImage,
        iconSize: [38, 38]
    })

    // Create a new marker with temporary info)
    function getNewMarker(category, latLong) {
        const basic = {
            id: `temp-${Date.now()}`, // Temporary id, just until the data is sent to the backend
            latLong,
            address: "",
            comments: ""
        }
        if (category === "accommodation") {
            return { ...basic, type: "New accommodation item", status: "planned", price: "unknown" }
        }
        if (category === "food") {
            return { ...basic, type: "New food item" }
        }
        if (category === "pointOfInterest") {
            return { ...basic, name: "New POI", price: "unknown" }
        }
    }


    // Add a new marker to state when there is a map click
    function handleMapClick(event) {
        const latLong = [event.latlng.lat, event.latlng.lng] // gets lat and long from the map and turns it into latLong
        const newMarker = getNewMarker(activeCategory, latLong)

        //add the new marker to the state
        if (activeCategory === "accommodation") {
            setAccommodations([...accommodations, newMarker])
        } else if (activeCategory === "food") {
            setFoods([...foods, newMarker])
        } else {
            setPointsOfInterest([...pointsOfInterest, newMarker])
        }
    }

    // Component that helps the click event happen
    function AddMarkerOnClick({ activeCategory, onClick }) {
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
        })
        return null
    }

    // Update info inside the popups
    function handleMarkerFieldChange(category, id, field, value) {
        if (category === "accommodation") {
            setAccommodations(accommodations.map(acc =>
                acc.id === id ? { ...acc, [field]: value } : acc
            ))
        } else if (category === "food") {
            setFoods(foods.map(food =>
                food.id === id ? { ...food, [field]: value } : food
            ))
        } else {
            setPointsOfInterest(pointsOfInterest.map(poi =>
                poi.id === id ? { ...poi, [field]: value } : poi
            ))
        }
    }

    // Change marker's location by dragging it (and reusing handleMarkerFieldChange)
    function handleMarkerDragEnd(category, id, newLatLong) {
        handleMarkerFieldChange(category, id, "latLong", newLatLong)
    }

    // Delete a marker
    function handleDeleteMarker(category, id) {
        if (category === "accommodation") {
            setAccommodations(accommodations.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
        } else if (category === "food") {
            setFoods(foods.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
        } else {
            setPointsOfInterest(pointsOfInterest.map(marker =>
                marker.id === id ? { ...marker, deleted: true } : marker
            ))
        }
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
                handleMapClick({ latlng: { lat, lng } }) // reuse this function to add permanent marker
                setSearchResult(null) // clear results to unmount this component
            }

            tempMarker.on("click", onClick) // when the temp marker is clicked, run the onClick function

            return () => {
                tempMarker.off("click", onClick) // turn off click function (remove event listener)
                if (map.hasLayer(tempMarker)) {
                    map.removeLayer(tempMarker) //make sure there is no temp marker left on the map (clean up if unmounts or new result arrives)
                }
            }
        }, [result, map])
        return null
    }


    const saveChanges = () => {
        // Match the names to the backend to send data
        const mappedAccommodations = accommodations.map(acc => ({
            id: acc.id && acc.id.toString().startsWith("temp-") ? null : acc.id, // reads the temporary id (which starts with "temp") then turns it to null so the backend can add a real id later
            type: acc.type,
            status: acc.status,
            price: acc.price,
            address: acc.address,
            lat_long: acc.latLong ? acc.latLong.join(",") : null,
            external_url: acc.url,
            comment: acc.comments,
            deleted: acc.deleted || false
        }))

        const mappedFoods = foods.map(food => ({
            id: food.id && food.id.toString().startsWith("temp-") ? null : food.id,
            type: food.type,
            address: food.address,
            lat_long: food.latLong ? food.latLong.join(",") : null,
            external_url: food.url,
            comment: food.comments,
            deleted: food.deleted || false
        }))

        const mappedPointsOfInterest = pointsOfInterest.map(poi => ({
            id: poi.id && poi.id.toString().startsWith("temp-") ? null : poi.id,
            name: poi.name,
            price: poi.price,
            address: poi.address,
            lat_long: poi.latLong ? poi.latLong.join(",") : null,
            external_url: poi.url,
            comment: poi.comments,
            deleted: poi.deleted || false
        }))

        updateTripById(tripId, tripName, mappedFoods, mappedPointsOfInterest, mappedAccommodations)
            .then(data => {
                console.log("Saved", data)

                //Replace frontend state with backend response
                if (data.accommodations) {
                    setAccommodations(
                        data.accommodations.map(acc => ({
                            ...acc,
                            latLong: acc.lat_long ? acc.lat_long.split(",").map(Number) : null,
                            url: acc.external_url,
                            comments: acc.comment
                        }))
                    )
                }

                if (data.foods) {
                    setFoods(
                        data.foods.map(food => ({
                            ...food,
                            latLong: food.lat_long ? food.lat_long.split(",").map(Number) : null,
                            url: food.external_url,
                            comments: food.comment
                        }))
                    )
                }

                if (data.points_of_interest) {
                    setPointsOfInterest(
                        data.points_of_interest.map(poi => ({
                            ...poi,
                            latLong: poi.lat_long ? poi.lat_long.split(",").map(Number) : null,
                            url: poi.external_url,
                            comments: poi.comment
                        }))
                    )
                }
            })
            .catch(err => console.error("Error saving data", err))
    }


    if (loading) return <h2>Loading map...</h2>

    // Everything below the if needs the data to be loaded to run

    // Only get details after data is loaded
    const accommodationMarkers = accommodations
        .filter(item => !item.deleted) // hide marker immediately if it has been deleted from map
        .map(item => ({
            id: item.id,
            position: item.latLong,
            type: item.type,
            status: item.status,
            price: item.price,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))

    const foodMarkers = foods
        .filter(item => !item.deleted)
        .map(item => ({
            id: item.id,
            position: item.latLong,
            type: item.type,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))


    const pointOfInterestMarkers = pointsOfInterest
        .filter(item => !item.deleted)
        .map(item => ({
            id: item.id,
            position: item.latLong,
            name: item.name,
            price: item.price,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))

    // Collect all the markers into 1 array (needed for FitBounds function)
    const allMarkers = [
        ...accommodationMarkers,
        ...foodMarkers,
        ...pointOfInterestMarkers
    ]

    // Make the map automatically open on my markers, not on a fixed location
    function FitBounds({ allMarkers }) {
        const map = useMap()

        if (allMarkers.length > 0) {
            const bounds = allMarkers.map(marker => marker.position)
            map.fitBounds(bounds, { padding: [50, 50] })
        }
        return null
    }

    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-zinc-100">
                <h1 className="mb-25 text-4xl font-bold">{tripName}</h1>
            </div>
            <MapContainer className="h-[500px] w-full" zoom={5}>
                <FitBounds allMarkers={allMarkers} /> {/* calls the function and sets the bounds of the map to show all markers*/}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SearchControl /> {/* Search bar */}
                {searchResult && <SearchResultHandler result={searchResult} />} {/* Add marker from search upon click */}
                <AddMarkerOnClick
                    activeCategory={activeCategory}
                    onClick={handleMapClick} />
                {/* Control - Dropdown to pick category of next marker to be added*/}
                <CategoryDropdown
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                {accommodationMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={accommodationIcon}
                            draggable={true} //Make it possible to drag marker to change the location
                            eventHandlers={{
                                dragend: (event) => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("accommodation", marker.id, newLatLong)
                                }
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Type:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.type || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("accommodation", marker.id, "type", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Status:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.status || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("accommodation", marker.id, "status", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Price:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.price || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("accommodation", marker.id, "price", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("accommodation", marker.id, "address", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("accommodation", marker.id, "url", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("accommodation", marker.id, "comments", event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 dark:text-gray-300 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("accommodation", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {foodMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={foodIcon}
                            draggable={true}
                            eventHandlers={{
                                dragend: (event) => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("food", marker.id, newLatLong)
                                }
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Type:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.type || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("food", marker.id, "type", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("food", marker.id, "address", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("food", marker.id, "url", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("food", marker.id, "comments", event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 dark:text-gray-300 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("food", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {pointOfInterestMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={pointOfInterestIcon}
                            draggable={true}
                            eventHandlers={{
                                dragend: (event => {
                                    const newLatLong = [
                                        event.target.getLatLng().lat,
                                        event.target.getLatLng().lng
                                    ]
                                    handleMarkerDragEnd("pointsOfInterest", marker.id, newLatLong)
                                })
                            }}>
                            <Popup>
                                <div className="space-x-2">
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Name:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.name || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("pointOfInterest", marker.id, "name", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Price:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.price || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("pointOfInterest", marker.id, "price", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Address:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.address || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("pointOfInterest", marker.id, "address", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> URL:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.url || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("pointOfInterest", marker.id, "url", event.target.value)
                                            } />
                                    </label>
                                    <label className="block text-xs text-gray-700 dark:text-gray-300"> Comments:
                                        <input
                                            className="px-1 py-0.2 text-sm"
                                            type="text"
                                            value={marker.comments || ""}
                                            onChange={(event) =>
                                                handleMarkerFieldChange("pointOfInterest", marker.id, "comments", event.target.value)
                                            } />
                                    </label>
                                    <button
                                        className="block text-xs text-red-600 dark:text-gray-300 my-1"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMarker("pointOfInterest", marker.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

            </MapContainer>


            <button
                onClick={saveChanges}
                className="w-50 my-5 mr-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">
                Save Changes
            </button>
        </div>
    )
}