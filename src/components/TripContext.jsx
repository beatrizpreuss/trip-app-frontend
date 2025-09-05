// This component is responsible for passing props to the children of TripLayout, 
// since that component can't pass props through Outlet. The children of TripLayout
// (TripDetails and TripMap) need access to the states so they can keep data in sync.

import { createContext, useContext } from "react";

export const TripContext = createContext()

export const useTrip = () => useContext(TripContext)