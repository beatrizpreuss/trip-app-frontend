import { Outlet } from "react-router-dom";

export default function TripLayout() {
    return (
        <>
            <h1>Trip Name coming from somewhere</h1>
            <Outlet />
        </>
    )
}