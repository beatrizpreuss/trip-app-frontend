import { useState, useEffect, useContext } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { getAllTrips, createNewTrip } from "../util/apiCalls"
import { AuthContext } from "./AuthContext"


export default function Trips() {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)

    const { token, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    if (!token) return <Navigate to="login" replace />

    useEffect(() => {
        if (!token) return
      
        const fetchTrips = async () => {
          try {
            const data = await getAllTrips(token)
            if (Array.isArray(data)) setTrips(data)
            else setTrips([])
          } catch (err) {
            console.error("Error fetching trips", err)
            if (err.message === "Unauthorized") {
              logout()           // clear token / auth state
              navigate("/login", { replace: true })
            }
          } finally {
            setLoading(false)
          }
        }
        fetchTrips()
      }, [token, logout, navigate])


    function NewTripButton() {
        const navigate = useNavigate()

        const handleNewTrip = async () => {
            try {
                if (!token) throw new Error("Not authenticated")

                const newTrip = await createNewTrip(token)

                if (!newTrip || !newTrip.trip || !newTrip.trip.id) {
                    throw new Error("Trip creation failed")
            }
            navigate(`/trips/${newTrip.trip.id}`)
        } catch (err) {
            console.error("Failed to create trip:", err)
            alert("Could not create new trip. Please try again.")
          }
        }
        
        return (
            <button
                onClick={handleNewTrip}
                className="aspect-square flex flex-col items-center justify-center border-2 
                        border-dashed rounded-lg cursor-pointer transition group dark:border-[#a9a9a9]"
            >
                <div className="flex flex-col items-center transform transition group-hover:scale-110">
                    <span className="text-7xl font-bold text-[#dddddd]">+</span>
                    <span className="font-medium text-zinc-900 dark:text-[#dddddd]">New Trip</span>
                </div>
            </button>
        )
    }


    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-[#dddddd]">
                <h1 className="text-4xl font-bold">Plan your trips</h1>
                <h3 className="mt-4 mb-20">Edit an existing trip or create a new one</h3>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">

                <NewTripButton />

                {/* Trip cards */}
                {trips.map((trip) => (
                    <Link
                        key={trip.id}
                        to={`/trips/${trip.id}`}
                        className="aspect-square relative rounded-lg shadow dark:shadow-[#a9a9a9] overflow-hidden group"
                    >
                        {/* Background image if available */}
                        {trip.image ? (
                            <img
                                src={trip.image}
                                alt={trip.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 transition"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gray-100 dark:bg-[#222222]" />
                        )}

                        {/* Trip name overlay */}
                        <div className="relative flex items-center justify-center h-full">
                            <span className="font-medium text-center text-zinc-900 group-hover:scale-110 transition dark:text-[#dddddd]">
                                {trip.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    )
}