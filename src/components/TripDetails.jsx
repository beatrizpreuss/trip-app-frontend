import { useState } from "react"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useTrip } from "./TripContext"
import { useNavigate } from "react-router-dom"
import { FaTrash } from "react-icons/fa"
import { Link } from "react-router-dom"
import { deleteTripById, getTripById, updateTripById } from "../util/apiCalls"


export default function TripDetails() {
    //Pulling state from Context
    const { tripName, setTripName, stays, setStays, eatDrink, setEatDrink, explore, setExplore, essentials, setEssentials, gettingAround, setGettingAround } = useTrip()

    const { tripId } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)

    //States that toggle showing each table
    const [showStays, setShowStays] = useState(true)
    const [showEatDrink, setShowEatDrink] = useState(true)
    const [showExplore, setShowExplore] = useState(true)
    const [showEssentials, setShowEssentials] = useState(true)
    const [showGettingAround, setShowGettingAround] = useState(true)

    // GET DATA FROM BACKEND

    useEffect(() => {
        getTripById(tripId)
            .then(data => {
                setTripName(data.trip.name)
                setStays(
                    data.stays.map(stay => ({
                        ...stay,
                        latLong: stay.coordinates, // Match the names with backend to get data
                        url: stay.external_url
                    }))
                )
                setEatDrink(
                    data.eat_drink.map(eat => ({
                        ...eat,
                        latLong: eat.coordinates,
                        url: eat.external_url
                    }))
                )
                setExplore(
                    data.explore.map(expl => ({
                        ...expl,
                        latLong: expl.coordinates,
                        url: expl.external_url
                    }))
                )
                setEssentials(
                    data.essentials.map(essential => ({
                        ...essential,
                        latLong: essential.coordinates,
                        url: essential.external_url
                    }))
                )
                setGettingAround(
                    data.getting_around.map(around => ({
                        ...around,
                        latLong: around.coordinates,
                        url: around.external_url
                    }))
                )

                setLoading(false)
            })
    }, [])

    // CHANGE DATA IN THE TABLE

    const handleStaysChange = (index, field, value) => {
        const updated = [...stays]
        updated[index][field] = value
        setStays(updated)
    }

    const handleEatDrinkChange = (index, field, value) => {
        const updated = [...eatDrink]
        updated[index][field] = value
        setEatDrink(updated)
    }

    const handleExploreChange = (index, field, value) => {
        const updated = [...explore]
        updated[index][field] = value
        setExplore(updated)
    }

    const handleEssentialsChange = (index, field, value) => {
        const updated = [...essentials]
        updated[index][field] = value
        setEssentials(updated)
    }

    const handleGettingAroundChange = (index, field, value) => {
        const updated = [...gettingAround]
        updated[index][field] = value
        setGettingAround(updated)
    }

    // ADD A ROW TO THE TABLE

    const addStay = () => {
        setStays([
            ...stays,
            {
                id: null,
                name: "",
                status: "",
                price: "",
                address: "",
                coordinates: "",
                external_url: "",
                comments: ""
            }
        ])
    }

    const addEatDrink = () => {
        setEatDrink([
            ...eatDrink,
            {
                id: null,
                name: "",
                address: "",
                coordinates: "",
                external_url: "",
                comments: ""
            }
        ])
    }

    const addExplore = () => {
        setExplore([
            ...explore,
            {
                id: null,
                name: "",
                price: "",
                address: "",
                coordinates: "",
                external_url: "",
                comments: ""
            }
        ])
    }

    const addEssentials = () => {
        setEssentials([
            ...essentials,
            {
                id: null,
                name: "",
                address: "",
                coordinates: "",
                external_url: "",
                comments: ""
            }
        ])
    }

    const addGettingAround = () => {
        setGettingAround([
            ...gettingAround,
            {
                id: null,
                name: "",
                address: "",
                coordinates: "",
                external_url: "",
                comments: ""
            }
        ])
    }

    // DELETE A ROW FROM THE TABLE

    const deleteStay = (stayId) => {
        setStays(prev =>
            prev.map(stay =>
                stay.id === stayId ? { ...stay, deleted: true } : stay
            )
        )
    }

    const deleteEatDrink = (eatDrinkId) => {
        setEatDrink(prev =>
            prev.map(eatDrink =>
                eatDrink.id === eatDrinkId ? { ...eatDrink, deleted: true } : eatDrink
            )
        )
    }

    const deleteExplore = (exploreId) => {
        setExplore(prev =>
            prev.map(explore =>
                explore.id === exploreId ? { ...explore, deleted: true } : explore
            )
        )
    }

    const deleteEssentials = (essentialsId) => {
        setEssentials(prev =>
            prev.map(essentials =>
                essentials.id === essentialsId ? { ...essentials, deleted: true } : essentials
            )
        )
    }

    const deleteGettingAround = (gettingAroundId) => {
        setGettingAround(prev =>
            prev.map(gettingAround =>
                gettingAround.id === gettingAroundId ? { ...gettingAround, deleted: true } : gettingAround
            )
        )
    }

    // SAVE ALL TABLES AT ONCE (saves all changes to the backend - update)

    const saveChanges = () => {
        // Match the names to the backend to send data
        const mappedStays = stays.map(stay => ({
            id: stay.id && stay.id.toString().startsWith("temp-") ? null : stay.id,
            name: stay.name,
            status: stay.status,
            price: stay.price,
            address: stay.address,
            coordinates: stay.latLong,
            external_url: stay.url,
            comments: stay.comments,
            deleted: stay.deleted || false
        }))

        const mappedEatDrink = eatDrink.map(eat => ({
            id: eat.id && eat.id.toString().startsWith("temp-") ? null : eat.id,
            name: eat.name,
            address: eat.address,
            coordinates: eat.latLong,
            external_url: eat.url,
            comments: eat.comments,
            deleted: eat.deleted || false
        }))

        const mappedExplore = explore.map(expl => ({
            id: expl.id && expl.id.toString().startsWith("temp-") ? null : expl.id,
            name: expl.name,
            price: expl.price,
            address: expl.address,
            coordinates: expl.latLong,
            external_url: expl.url,
            comment: expl.comments,
            deleted: expl.deleted || false
        }))

        const mappedEssentials = essentials.map(essential => ({
            id: essential.id && essential.id.toString().startsWith("temp-") ? null : essential.id,
            name: essential.name,
            address: essential.address,
            coordinates: essential.latLong,
            external_url: essential.url,
            comments: essential.comments,
            deleted: essential.deleted || false
        }))

        const mappedGettingAround = gettingAround.map(around => ({
            id: around.id && around.id.toString().startsWith("temp-") ? null : around.id,
            name: around.name,
            address: around.address,
            coordinates: around.latLong,
            external_url: around.url,
            comments: around.comments,
            deleted: around.deleted || false
        }))

        updateTripById(tripId, tripName, mappedEatDrink, mappedExplore, mappedStays, mappedEssentials, mappedGettingAround)
            .then(data => {
                console.log("Saved", data)

                //Replace frontend state with backend response
                if (data.stays) {
                    setStays(
                        data.stays.map(stay => ({
                            ...stay,
                            latLong: stay.coordinates ? stay.coordinates.split(",").map(Number) : null,
                            url: stay.external_url,
                        }))
                    )
                }

                if (data.eat_drink) {
                    setEatDrink(
                        data.eat_drink.map(eat => ({
                            ...eat,
                            latLong: eat.coordinates ? eat.coordinates.split(",").map(Number) : null,
                            url: eat.external_url,
                        }))
                    )
                }

                if (data.explore) {
                    setExplore(
                        data.explore.map(expl => ({
                            ...expl,
                            latLong: expl.coordinates ? expl.coordinates.split(",").map(Number) : null,
                            url: expl.external_url,
                        }))
                    )
                }

                if (data.essentials) {
                    setEssentials(
                        data.essentials.map(essential => ({
                            ...essential,
                            latLong: essential.coordinates ? essential.coordinates.split(",").map(Number) : null,
                            url: essential.external_url,
                        }))
                    )
                }

                if (data.getting_around) {
                    setGettingAround(
                        data.getting_around.map(around => ({
                            ...around,
                            latLong: around.coordinates ? around.coordinates.split(",").map(Number) : null,
                            url: around.external_url,
                        }))
                    )
                }
            })
            .catch(err => console.error("Error saving data", err))
    }

    // DELETE ENTIRE TRIP FROM DATABASE

    const deleteTrip = async () => {
        if (!window.confirm("Are you sure you want to delete this trip?")) return

        try {
            await deleteTripById(tripId)
            console.log("Deleted", tripId)
            navigate("/trips")
        } catch (err) {
            console.error("Error deleting trip:", err)
        }
    }

    // RENDERING STARTS HERE

    if (loading) {
        return <p className="text-center text-lg">Loading trip details...</p>
    }

    return (

        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-[#dddddd]">

                <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="text-4xl font-bold bg-transparent border-b-1 border-gray-300 dark:border-[#a9a9a9] focus:outline-none focus:border-b-2 text-center"
                />
                <h3 className="mt-4">Manage all your trip details in the tables, or open the map to make changes</h3>
                <Link to="map">
                    <button
                        className="w-50 my-5 mb-20 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                            focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                            dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">
                        Open Map
                    </button>
                </Link>
            </div>

            {/* Stays Table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[#dddddd] dark:bg-[#222222]">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowStays(prev => !prev)}>
                                    {showStays ?
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>Stays</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-[#dddddd]"
                            >Make a list with all the hotels, camping sites or any other accommodation places
                                <br /> relevant to your trip. Include all details and stay organized.</p>
                        </div>
                    </caption>

                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#8d8d8d] dark:text-[#dddddd]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Coordinates</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showStays && (
                        <tbody>
                            {stays
                                .filter(stay => !stay.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-[#5f5f5f] dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="name"
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handleStaysChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="status"
                                                type="text"
                                                value={item.status || ""}
                                                onChange={(event) => handleStaysChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="price"
                                                type="text"
                                                value={item.price || ""}
                                                onChange={(event) => handleStaysChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleStaysChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleStaysChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleStaysChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="comments"
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handleStaysChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteStay(item.id)}
                                                className="font-medium text-red-600 dark:text-red-400 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addStay()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:b-2 dark:focus:ring-zinc-800 dark:text-[#dddddd]">
                    ➕ Add Stay
                </button>
            </div>

            {/* Eat & Drink Table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[#dddddd] dark:bg-[#222222]">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowEatDrink(prev => !prev)}>
                                    {showEatDrink ?
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>Eat & Drink</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-[#dddddd]"
                            >Make a list of the restaurants you would like to try, and of possible</p>
                        </div>
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#8d8d8d] dark:text-[#dddddd]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Coordinates</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showEatDrink && (
                        <tbody>
                            {eatDrink
                                .filter(eat => !eat.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-[#5f5f5f] dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="name"
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handleEatDrinkChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleEatDrinkChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleEatDrinkChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleEatDrinkChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="comments"
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handleEatDrinkChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteEatDrink(item.id)}
                                                className="font-medium text-red-600 dark:text-red-400 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addEatDrink()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:b-2 dark:focus:ring-zinc-800 dark:text-[#dddddd]">
                    ➕ Add Eat & Drink
                </button>
            </div>

            {/* Explore table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[#dddddd] dark:bg-[#222222]">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowExplore(prev => !prev)}>
                                    {showExplore ?
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>Places to Explore</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-[#dddddd]"
                            >List all the places you would like to see, like museums, monuments,
                                <br /> parks, nature attractions, hiking trails, etc. </p>
                        </div>
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#8d8d8d] dark:text-[#dddddd]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Coordinates</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showExplore && (
                        <tbody>
                            {explore
                                .filter(expl => !expl.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-[#5f5f5f] dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="name"
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handleExploreChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="price"
                                                type="text"
                                                value={item.price || ""}
                                                onChange={(event) => handleExploreChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleExploreChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleExploreChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleExploreChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="comments"
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handleExploreChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteExplore(item.id)}
                                                className="font-medium text-red-600 dark:text-red-400 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addExplore()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:b-2 dark:focus:ring-zinc-800 dark:text-[#dddddd]">
                    ➕ Add Place to Explore
                </button>
            </div>

            {/* Essentials table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[#dddddd] dark:bg-[#222222]">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowEssentials(prev => !prev)}>
                                    {showEssentials ?
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>Essentials</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-[#dddddd]"
                            >List places that could be helpful to keep your trip up and running,
                                <br /> like supermarkets, pharmacies, banks, etc. </p>
                        </div>
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#8d8d8d] dark:text-[#dddddd]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Coordinates</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showEssentials && (
                        <tbody>
                            {essentials
                                .filter(essential => !essential.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-[#5f5f5f] dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="name"
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handleEssentialsChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleEssentialsChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleEssentialsChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleEssentialsChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="comments"
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handleEssentialsChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteEssentials(item.id)}
                                                className="font-medium text-red-600 dark:text-red-400 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addEssentials()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:b-2 dark:focus:ring-zinc-800 dark:text-[#dddddd]">
                    ➕ Add Essentials
                </button>
            </div>


            {/* Getting Around table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[#dddddd] dark:bg-[#222222]">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowGettingAround(prev => !prev)}>
                                    {showGettingAround ?
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[#dddddd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>Getting Around</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-[#dddddd]"
                            >Airports, train statios, bus stops and such.</p>
                        </div>
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#8d8d8d] dark:text-[#dddddd]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Coordinates</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showGettingAround && (
                        <tbody>
                            {gettingAround
                                .filter(around => !around.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-[#5f5f5f] dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="name"
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handleGettingAroundChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleGettingAroundChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleGettingAroundChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleGettingAroundChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[#dddddd]">
                                            <input
                                                name="comments"
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handleGettingAroundChange(index, event.target.name, event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteGettingAround(item.id)}
                                                className="font-medium text-red-600 dark:text-red-400 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addGettingAround()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:b-2 dark:focus:ring-zinc-800 dark:text-[#dddddd]">
                    ➕ Add Getting Around Item
                </button>
            </div>


            <div className="flex flex-row justify-between">
                <div className="flex flex-row">
                    <button
                        onClick={saveChanges}
                        className="w-50 my-5 mr-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">
                        Save Changes
                    </button>
                    <Link to="map">
                        <button
                            className="w-50 my-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                        focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                        dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">
                            Open Map
                        </button>
                    </Link>
                </div>
                <button
                    onClick={deleteTrip}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:b-2 dark:focus:ring-zinc-800 dark:text-[#dddddd]">
                    Delete entire trip
                </button>
            </div>
        </div>
    )
}