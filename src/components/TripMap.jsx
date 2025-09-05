import "leaflet/dist/leaflet.css"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from "react-leaflet"
import { getTripById } from "../util/apiCalls"
import { Icon } from "leaflet"
import accommodationIconImage from "../assets/images/placeholder1.png"
import foodIconImage from "../assets/images/placeholder1.png"
import pointsOfInterestIconImage from "../assets/images/placeholder1.png"


export default function TripMap() {

    const { tripId } = useParams()
    const [tripName, setTripName] = useState("")
    const [accommodations, setAccommodations] = useState([])
    const [foods, setFoods] = useState([])
    const [pointsOfInterest, setPointsOfInterest] = useState([])
    const [loading, setLoading] = useState(true)

    // State for the dropdown inside the map (let's the user choose the category of the next marker to be added)
    const [activeCategory, setActiveCategory] = useState("accommodation")

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

    // Create new markers with default info (and specific to each category)
    function getNewMarker(category, latLong) {
        const basic = {
            id: `temp-${Date.now()}`, // Temporary id, just until the data is sent to the backend
            latLong,
            address: "",
            comments: ""
        }
        if (category === "accommodation") {
            return { ...basic, type: "Hotel", status: "planned", price: "unknown" }
        }
        if (category === "food") {
            return { ...basic, type: "Restaurant" }
        }
        if (category === "pointOfInterest") {
            return { ...basic, name: "New POI", price: "Free" }
        }
    }

    // Add a new marker when there is a map click
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
    function AddMarkerOnClick({ onClick }) {
        useMapEvent("click", onClick)
        return null
    }

    // Delete a marker
    function handleDeleteMarker(category, id) {
        if (category === "accommodation") {
            setAccommodations(accommodations.filter((m) => m.id !== id))
        } else if (category === "food") {
            setFoods(foods.filter((m) => m.id !== id))
        } else {
            setPointsOfInterest(pointsOfInterest.filter((m) => m.id !== id))
        }
    }



    if (loading) return <h2>Loading map...</h2>

    // Everything below the if needs the data to be loaded to run

    // Only get accommodation details after data is loaded
    const accommodationMarkers =
        accommodations.map(item => ({
            id: item.id,
            position: item.latLong,
            type: item.type,
            status: item.status,
            price: item.price,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))

    const foodMarkers =
        foods.map(item => ({
            id: item.id,
            position: item.latLong,
            type: item.type,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))


    const pointOfInterestMarkers =
        pointsOfInterest.map(item => ({
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

    // Helper function to make the map automatically open on my markers, not on a fixed location
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
                {/* 🆕 Dropdown to pick category */}
                <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="mb-5 p-2 border rounded"
                >
                    <option value="accommodation">Accommodation</option>
                    <option value="food">Food</option>
                    <option value="pointOfInterest">Point of Interest</option>
                </select>
            </div>
            <MapContainer className="h-[500px] w-full" zoom={5}>
                <FitBounds allMarkers={allMarkers} /> {/* calls the function and sets the bounds of the map to show all markers*/}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <AddMarkerOnClick onClick={handleMapClick}/>

                {accommodationMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker key={index} position={marker.position} icon={accommodationIcon}>
                            <Popup className="">
                                <p className="font-bold text-center">{marker.type}</p>
                                <p>Status: {marker.status}</p>
                                <p>Price: {marker.price}</p>
                                <p>Address: {marker.address}</p>
                                <p>URL: {marker.url}</p>
                                <p>Comments: {marker.comments}</p>
                                <button
                                    className="text-red p-1"
                                    onClick={() => handleDeleteMarker("accommodation", marker.id)}
                                >
                                    Delete
                                </button>
                            </Popup>
                        </Marker>
                    ))}

                {foodMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker key={index} position={marker.position} icon={foodIcon}>
                            <Popup className="">
                                <p className="font-bold text-center">{marker.type}</p>
                                <p>Address: {marker.address}</p>
                                <p>URL: {marker.url}</p>
                                <p>Comments: {marker.comments}</p>
                                <button
                                    className="text-red p-1"
                                    onClick={() => handleDeleteMarker("food", marker.id)}
                                >
                                    Delete
                                </button>
                            </Popup>
                        </Marker>
                    ))}

                {pointOfInterestMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker key={index} position={marker.position} icon={pointOfInterestIcon}>
                            <Popup className="">
                                <p className="font-bold text-center">{marker.name}</p>
                                <p>Price: {marker.price}</p>
                                <p>Address: {marker.address}</p>
                                <p>URL: {marker.url}</p>
                                <p>Comments: {marker.comments}</p>
                                <button
                                    className="text-red p-1"
                                    onClick={() => handleDeleteMarker("pointOfInterest", marker.id)}
                                >
                                    Delete
                                </button>
                            </Popup>
                        </Marker>
                    ))}

            </MapContainer>
        </div>
    )
}