import { Outlet } from "react-router-dom";
import { TripContext } from "./TripContext";
import { useState } from "react";

export default function TripLayout() {
    
    // Passing state to the children using Context
    const [tripName, setTripName] = useState("")
    const [accommodations, setAccommodations] = useState([])
    const [foods, setFoods] = useState([])
    const [pointsOfInterest, setPointsOfInterest] = useState([])

    return (
        <TripContext.Provider value={{
            tripName, setTripName,
            accommodations, setAccommodations,
            foods, setFoods,
            pointsOfInterest, setPointsOfInterest
        }}>
            <Outlet />
        </TripContext.Provider>
    )
}