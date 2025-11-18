import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTrip } from "./TripContext"
import { FaTrash, FaPlus } from "react-icons/fa"
import { deleteTripById, getTripById, updateTripById } from "../util/apiCalls"
import { formatTripData, mapItemForBackend, mapCategoryForFrontend } from "../util/tripMappers"
import SaveButton from "./SaveButton"
import { AuthContext } from "./AuthContext"


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

    // used to track unsaved changes to make the Save Changes button another color
    const [hasChanges, setHasChanges] = useState(false)

    const { token, logout, refreshAccessToken } = useContext(AuthContext)

    // GET DATA FROM BACKEND
    
    useEffect(() => {
        if (!token) return
        
        const fetchTripDetails = async () => {
          try {
            const data = await getTripById({ tripId, token , refreshAccessToken, logout, navigate})
      
            if (!data) {
              setLoading(false)
              return
            }
            const { tripName, stays, eatDrink, explore, essentials, gettingAround } = formatTripData(data)
      
            setTripName(tripName)
            setStays(stays)
            setEatDrink(eatDrink)
            setExplore(explore)
            setEssentials(essentials)
            setGettingAround(gettingAround)
          } catch (err) {
            console.error("Error fetching trip details", err)
    
          } finally {
            setLoading(false)
          }
        }
        fetchTripDetails()
      }, [tripId, token, logout, navigate])

    // CHANGE TRIP NAME

    const handleTripNameChange = (newName) => {
        setTripName(newName)
        setHasChanges(true)
    }

    // CHANGE DATA IN THE TABLE

    const handleMarkerChange = (category, index, field, value, type) => {
        const categoryMap = {
            stays: [stays, setStays],
            eatDrink: [eatDrink, setEatDrink],
            explore: [explore, setExplore],
            essentials: [essentials, setEssentials],
            gettingAround: [gettingAround, setGettingAround]
        }
        const [array, setArray] = categoryMap[category]

        const updated = [...array]
        updated[index] = {
            ...updated[index],
            [field]: type === "number" ? Number(value) : value
        }
        setArray(updated)
        setHasChanges(true)
    }


    // ADD A ROW TO THE TABLE

    function addRow(category, setCategory, extraFields = []) {
        const baseRow = {
            id: null,
            name: "",
            address: "",
            day: [1],
            coordinates: "",
            external_url: "",
            comments: ""
        }
        // Add extra fields if needed
        extraFields.forEach(field => {
            baseRow[field] = ""
        })
        setCategory(prev => [...prev, baseRow])
        setHasChanges(true)
    }


    // DELETE A ROW FROM THE TABLE

    function deleteRow(id, setCategory) {
        setCategory(prev =>
            prev.map(item =>
                item.id === id ? { ...item, deleted: true } : item
            )
        )
        setHasChanges(true)
    }


    // SAVE ALL TABLES AT ONCE (saves all changes to the backend - update)
    // mapItemForBackend and and mapCategoryForFrontend come fron util/tripMappers.js, updateTripById comes from util/apiCalls.js
    const saveChanges = () => {
        const mappedStays = stays.map(mapItemForBackend)
        const mappedEatDrink = eatDrink.map(mapItemForBackend)
        const mappedExplore = explore.map(mapItemForBackend)
        const mappedEssentials = essentials.map(mapItemForBackend)
        const mappedGettingAround = gettingAround.map(mapItemForBackend)

        updateTripById({ 
            token, tripId, tripName, 
            mappedEatDrink, mappedExplore, mappedStays, mappedEssentials, mappedGettingAround,
            refreshAccessToken, logout, navigate
         })
            .then(data => {
                console.log("Saved", data)

                if (data.stays) setStays(mapCategoryForFrontend(data.stays))
                if (data.eat_drink) setEatDrink(mapCategoryForFrontend(data.eat_drink))
                if (data.explore) setExplore(mapCategoryForFrontend(data.explore))
                if (data.essentials) setEssentials(mapCategoryForFrontend(data.essentials))
                if (data.getting_around) setGettingAround(mapCategoryForFrontend(data.getting_around))

                setHasChanges(false)
            })
            .catch(err => console.error("Error saving data", err))
    }

    // DELETE ENTIRE TRIP FROM DATABASE

    const deleteTrip = async () => {
        if (!window.confirm("Are you sure you want to delete this trip?")) return

        try {
            await deleteTripById({ token, tripId, refreshAccessToken, logout, navigate })
            console.log("Deleted", tripId)

            //Clean up
            setStays([])
            setEatDrink([])
            setExplore([])
            setEssentials([])
            setGettingAround([])
            setTripName("")
            
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

        <div className="m-25 mt-15 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-[#dddddd]">

                <input
                    type="text"
                    value={tripName}
                    onChange={(e) => handleTripNameChange(e.target.value)}
                    className="text-4xl font-bold bg-transparent border-b-1 border-gray-300 dark:border-[#a9a9a9] focus:outline-none focus:border-b-2 text-center"
                />
                <h3 className="mt-4">Manage all your trip details in the tables, or open the map to make changes</h3>
                <div className="flex flex-row items-center justify-center gap-5">
                    <SaveButton saveChanges={saveChanges} hasChanges={hasChanges} />
                    <Link to="map">
                        <button
                            className="general-button">
                            Open Map
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stays Table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg">
                <table className="table-auto w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">

                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[#dddddd] dark:bg-[var(--color-navy)]">
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

                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[var(--color-darker-blue)] dark:text-[var(--color-stale-blue)]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Day</th>
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
                                    <tr key={index} className="bg-white border-b dark:bg-[var(--color-dark-blue)] dark:border-gray-700 border-gray-200">
                                        <td className="table-input-box">
                                            <textarea
                                                name="name"
                                                rows={1}
                                                value={item.name || ""}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="status"
                                                type="text"
                                                value={item.status || ""}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-25"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="price"
                                                type="text"
                                                value={item.price || ""}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-15"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="day"
                                                type="text"
                                                placeholder="e.g. 1, 3, 5"
                                                value={item.day}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-10 text-center"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-30 text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                                className="text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <textarea
                                                name="comments"
                                                value={item.comments || ""}
                                                onChange={(event) => handleMarkerChange("stays", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-70"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteRow(item.id, setStays)}
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
                    onClick={() => addRow("stay", setStays, ["status", "price"])}
                    className="add-row-button">
                    <div className="flex flex-row items-center">
                        < FaPlus />
                        <span> Add Stay</span>
                    </div>
                </button>
            </div>

            {/* Eat & Drink Table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[var(--color-stale-blue)]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[var(--color-stale-blue)] dark:bg-[var(--color-navy)]">
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
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[var(--color-darker-blue)] dark:text-[var(--color-stale-blue)]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Day</th>
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
                                    <tr key={index} className="bg-white border-b dark:bg-[var(--color-dark-blue)] dark:border-gray-700 border-gray-200">
                                        <td className="table-input-box">
                                            <textarea
                                                name="name"
                                                rows={1}
                                                value={item.name || ""}
                                                onChange={(event) => handleMarkerChange("eatDrink", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleMarkerChange("eatDrink", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="day"
                                                type="text"
                                                value={item.day}
                                                onChange={(event) => handleMarkerChange("eatDrink", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-10 text-center"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleMarkerChange("eatDrink", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-30 text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleMarkerChange("eatDrink", index, event.target.name, event.target.value, event.target.type)}
                                                className="text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <textarea
                                                name="comments"
                                                value={item.comments || ""}
                                                onChange={(event) => handleMarkerChange("eatDrink", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-70"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteRow(item.id, setEatDrink)}
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
                    onClick={() => addRow("eatDrink", setEatDrink)}
                    className="add-row-button">
                    <div className="flex flex-row items-center">
                        < FaPlus />
                        <span> Add Eat & Drink</span>
                    </div>
                </button>
            </div>

            {/* Explore table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[var(--color-stale-blue)] dark:bg-[var(--color-navy)]">
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
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[var(--color-darker-blue)] dark:text-[var(--color-stale-blue)]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Day</th>
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
                                    <tr key={index} className="bg-white border-b dark:bg-[var(--color-dark-blue)] dark:border-gray-700 border-gray-200">
                                        <td className="table-input-box">
                                            <textarea
                                                name="name"
                                                rows={1}
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handleMarkerChange("explore", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="price"
                                                type="text"
                                                value={item.price || ""}
                                                onChange={(event) => handleMarkerChange("explore", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-15"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleMarkerChange("explore", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="day"
                                                type="text"
                                                value={item.day}
                                                onChange={(event) => handleMarkerChange("explore", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-10 text-center"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleMarkerChange("explore", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-30 text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleMarkerChange("explore", index, event.target.name, event.target.value, event.target.type)}
                                                className="text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <textarea
                                                name="comments"
                                                value={item.comments || ""}
                                                onChange={(event) => handleMarkerChange("explore", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-70"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteRow(item.id, setExplore)}
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
                    onClick={() => addRow("explore", setExplore, ["price"])}
                    className="add-row-button">
                    <div className="flex flex-row items-center">
                        < FaPlus />
                        <span> Add Place to Explore</span>
                    </div>
                </button>
            </div>

            {/* Essentials table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[var(--color-stale-blue)] dark:bg-[var(--color-navy)]">
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
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[var(--color-darker-blue)] dark:text-[var(--color-stale-blue)]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Day</th>
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
                                    <tr key={index} className="bg-white border-b dark:bg-[var(--color-dark-blue)] dark:border-gray-700 border-gray-200">
                                        <td className="table-input-box">
                                            <textarea
                                                name="name"
                                                rows={1}
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handleMarkerChange("essentials", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleMarkerChange("essentials", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="day"
                                                type="text"
                                                value={item.day}
                                                onChange={(event) => handleMarkerChange("essentials", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-10 text-center"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleMarkerChange("essentials", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-30 text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleMarkerChange("essentials", index, event.target.name, event.target.value, event.target.type)}
                                                className="text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <textarea
                                                name="comments"
                                                value={item.comments || ""}
                                                onChange={(event) => handleMarkerChange("essentials", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-70"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteRow(item.id, setEssentials)}
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
                    onClick={() => addRow("essentials", setEssentials)}
                    className="add-row-button">
                    <div className="flex flex-row items-center">
                        < FaPlus />
                        <span> Add Essentials</span>
                    </div>
                </button>
            </div>


            {/* Getting Around table */}
            <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[#dddddd]">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-[var(--color-stale-blue)] dark:bg-[var(--color-navy)]">
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
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[var(--color-darker-blue)] dark:text-[var(--color-stale-blue)]">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Day</th>
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
                                    <tr key={index} className="bg-white border-b dark:bg-[var(--color-dark-blue)] dark:border-gray-700 border-gray-200">
                                        <td className="table-input-box">
                                            <textarea
                                                name="name"
                                                rows={1}
                                                value={item.name || ""}
                                                onChange={(event) => handleMarkerChange("gettingAround", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="address"
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleMarkerChange("gettingAround", index, event.target.name, event.target.value, event.target.type)}
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="day"
                                                type="text"
                                                value={item.day}
                                                onChange={(event) => handleMarkerChange("gettingAround", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-10 text-center"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleMarkerChange("gettingAround", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-30 text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <input
                                                name="url"
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleMarkerChange("gettingAround", index, event.target.name, event.target.value, event.target.type)}
                                                className="text-xs"
                                            />
                                        </td>
                                        <td className="table-input-box">
                                            <textarea
                                                name="comments"
                                                value={item.comments || ""}
                                                onChange={(event) => handleMarkerChange("gettingAround", index, event.target.name, event.target.value, event.target.type)}
                                                className="w-full min-w-70"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteRow(item.id, setGettingAround)}
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
                    onClick={() => addRow("gettingAround", setGettingAround)}
                    className="add-row-button">
                    <div className="flex flex-row items-center">
                        < FaPlus />
                        <span> Add Getting Around Item</span>
                    </div>
                </button>
            </div>


            <div className="flex flex-row justify-between">
                <div className="flex flex-row">
                    <SaveButton saveChanges={saveChanges} hasChanges={hasChanges} />
                    <Link to="map">
                        <button
                            className="general-button ml-5">
                            Open Map
                        </button>
                    </Link>
                </div>
                <button
                    onClick={deleteTrip}
                    className="delete-trip-button">
                    Delete entire trip
                </button>
            </div>
        </div>
    )
}