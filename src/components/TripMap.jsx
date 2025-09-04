import "leaflet/dist/leaflet.css"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { getTripById } from "../util/apiCalls"
import { Icon } from "leaflet"
import accommodationIconImage from "../assets/images/placeholder.png"


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

    
    if (loading) return <h2>Loading map...</h2>

    // Only get accommodation details after data is loaded
    const accommodationMarkers = 
        accommodations.map(item => ({
            position: item.latLong.split(",").map(Number), // turning the string latLog into an array
            type: item.type,
            status: item.status,
            price: item.price,
            address: item.address,
            url: item.url,
            comments: item.comments
        }))
        console.log(accommodationMarkers.map(marker => marker.position));


    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-zinc-100">
                <h1 className="mb-25 text-4xl font-bold">{tripName}</h1>
            </div>
            <MapContainer center={[52.522, 13.404]} zoom={5} className="h-[500px] w-full">
                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"    
                />

                {accommodationMarkers
                    .filter(marker => Array.isArray(marker.position) && marker.position.length === 2)
                    .map((marker, index) => (
                        <Marker key={index} position={marker.position} icon={accommodationIcon}>
                            <Popup className="leading-none">
                                <p className="font-bold text-center">{marker.type}</p>
                                <p>Status: {marker.status}</p>
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