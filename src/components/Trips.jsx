import { useState } from "react"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"


export default function Trips() {

    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("https://wander-wise-backend-t1wv.onrender.com/trips")
            .then(res => res.json())
            .then(data => {
                setTrips(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error fetching trips", err)
                setLoading(false)
            })
    }, [])

    function NewTripButton() {
        const navigate = useNavigate()

        const handleNewTrip = async () => {
            const res = await fetch("https://wander-wise-backend-t1wv.onrender.com/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Untitled Trip", image: null })
            })
            const newTrip = await res.json()
            navigate(`/trips/${newTrip.trip.id}`)
        }
        return (
            <button
                onClick={handleNewTrip}
                className="aspect-square flex flex-col items-center justify-center border-2 
                        border-dashed rounded-lg cursor-pointer transition group dark:border-zinc-500"
            >
                <div className="flex flex-col items-center transform transition group-hover:scale-110">
                    <span className="text-7xl font-bold text-gray-400">+</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">New Trip</span>
                </div>
            </button>
        )
    }

    
    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-zinc-100">
                <h1 className="text-4xl font-bold">Plan your trips</h1>
                <h3 className="mt-4 mb-20">Edit an existing trip or create a new one</h3>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">

                <NewTripButton/>

                {/* Trip cards */}
                {trips.map((trip) => (
                    <Link
                        key={trip.id}
                        to={`/trips/${trip.id}`}
                        className="aspect-square relative rounded-lg shadow dark:shadow-zinc-500 overflow-hidden group"
                    >
                        {/* Background image if available */}
                        {trip.image ? (
                            <img
                                src={trip.image}
                                alt={trip.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 transition"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gray-100 dark:bg-zinc-900" />
                        )}

                        {/* Trip name overlay */}
                        <div className="relative flex items-center justify-center h-full">
                            <span className="font-medium text-center text-zinc-900 group-hover:scale-110 transition dark:text-zinc-100">
                                {trip.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    )
}