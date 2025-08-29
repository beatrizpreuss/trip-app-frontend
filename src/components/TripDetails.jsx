import { useState } from "react"
import { useEffect } from "react"
import { useParams } from "react-router-dom"


export default function TripDetails() {

    const { tripId } = useParams()

    const [loading, setLoading] = useState(true)
    const [accommodations, setaccommodations] = useState([])
    const [foods, setFoods] = useState([])
    const [pointsOfInterest, setPointsOfInterest] = useState([])

    useEffect(() => {
        fetch(`https://wander-wise-backend-t1wv.onrender.com/trips/${tripId}`)
            .then(res => res.json())
            .then(data => {
                setaccommodations(data.accommodations)
                setFoods(data.foods)
                setPointsOfInterest(data.pointsOfInterest)
                setLoading(false)
            })
    }, [])

    function showaccommodations() {
        return accommodations.map((accommodation, index) => (
            <div key={index}>{accommodation.address}</div>
        ))
    }

    return (
        <>
            <h1>I'll show all the trip details here</h1>
            <div>{loading ? "Loading..." : showaccommodations()}</div>
        </>
    )
}