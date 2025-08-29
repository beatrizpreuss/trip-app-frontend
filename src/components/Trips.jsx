import { useState } from "react"
import { useEffect } from "react"


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

    function showTrips(trips) {
        if (trips.length === 0) return "No trips found"
        return trips.map((trip, index) => (
            <div key={index}>{trip.name}</div>
        ))
    }

    return (
        <>
            <h1>I'll show all the trips here</h1>
            <div>{loading ? "Loading" : showTrips(trips)}</div>
        </>
    )
}