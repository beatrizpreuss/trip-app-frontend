import "leaflet/dist/leaflet.css"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
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

    useEffect(() => {
        getTripById(tripId)
            .then(data => {
                setTripName(data.trip.name)
                setAccommodations(
                    data.accommodations.map(acc => ({
                        ...acc,
                        latLong: acc.lat_long, // Match the names with backend to get data
                        url: acc.external_url,
                        comments: acc.comment
                    }))
                )
                setFoods(
                    data.foods.map(food => ({
                        ...food,
                        latLong: food.lat_long,
                        url: food.external_url,
                        comments: food.comment
                    }))
                )
                setPointsOfInterest(
                    data.points_of_interest.map(poi => ({
                        ...poi,
                        latLong: poi.lat_long,
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


    if (loading) return <h2>Loading map...</h2>

    // Everything below the if needs the data to be loaded to run

    // Only get accommodation details after data is loaded
    const accommodationMarkers =
        accommodations.map(item => ({
            position: item.latLong
                ? item.latLong.split(",").map(Number) // turning the string latLog into an array
                : null,
            type: item.type,
            status: item.status,
            price: item.price,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))

    const foodMarkers =
        foods.map(item => ({
            position: item.latLong
                ? item.latLong.split(",").map(Number) // turning the string latLog into an array
                : null,
            type: item.type,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))


    const pointOfInterestMarkers =
        pointsOfInterest.map(item => ({
            position: item.latLong 
                ? item.latLong.split(",").map(Number) // turning the string latLog into an array
                : null,
            name: item.name,
            price: item.price,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))

    // Collect all the markers into 1 array (needed for function below)
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
            </div>
            <MapContainer className="h-[500px] w-full" zoom={5}>
                <FitBounds allMarkers={allMarkers} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

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
                            </Popup>
                        </Marker>
                    ))}
                
                {pointOfInterestMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker key={index} position={marker.position} icon={pointOfInterestIcon}>
                            <Popup className="">
                                <p className="font-bold text-center">{marker.type}</p>
                                <p>Price: {marker.price}</p>
                                <p>Address: {marker.address}</p>
                                <p>URL: {marker.url}</p>
                                <p>Comments: {marker.comments}</p>
                            </Popup>
                        </Marker>
                ))}

            
            </MapContainer>
        </div>
    )
}