import { Outlet } from "react-router-dom";
import { TripContext } from "./TripContext";
import { useState } from "react";

export default function TripLayout() {
    
    // Passing state to the children using Context
    const [tripName, setTripName] = useState("")
    const [stays, setStays] = useState([])
    const [eatDrink, setEatDrink] = useState([])
    const [explore, setExplore] = useState([])
    const [essentials, setEssentials] = useState([])
    const [gettingAround, setGettingAround] = useState([])

    return (
        <TripContext.Provider value={{
            tripName, setTripName,
            stays, setStays,
            eatDrink, setEatDrink,
            explore, setExplore,
            essentials, setEssentials,
            gettingAround, setGettingAround
        }}>
            <Outlet />
        </TripContext.Provider>
    )
}