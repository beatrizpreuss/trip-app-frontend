import { useState } from "react"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { FaTrash } from "react-icons/fa"


export default function TripDetails() {

    const { tripId } = useParams()

    const [loading, setLoading] = useState(true)
    const [tripName, setTripName] = useState("")
    const [accommodations, setAccommodations] = useState([])
    const [foods, setFoods] = useState([])
    const [pointsOfInterest, setPointsOfInterest] = useState([])
    const [showAccommodations, setShowAccommodations] = useState(true)
    const [showFoods, setShowFoods] = useState(true)
    const [showPointsOfInterest, setShowPointsOfInterest] = useState(true)

    // GET DATA FROM BACKEND

    useEffect(() => {
        fetch(`https://wander-wise-backend-t1wv.onrender.com/trips/${tripId}`)
            .then(res => res.json())
            .then(data => {
                setTripName(data.trip.name)
                setAccommodations(
                    data.accommodations.map(acc => ({
                        ...acc,
                        latLong: acc.lat_long, // Match the names with backend to get data
                        url: acc.external_url,
                        comments: acc.comment
                    }))
                )
                setFoods(
                    data.foods.map(food => ({
                        ...food,
                        latLong: food.lat_long,
                        url: food.external_url,
                        comments: food.comment
                    }))
                )
                setPointsOfInterest(
                    data.points_of_interest.map(poi => ({
                        ...poi,
                        latLong: poi.lat_long,
                        url: poi.external_url,
                        comments: poi.comment
                    })))
                setLoading(false)
            })
    }, [])

    // CHANGE DATA IN THE TABLE

    const handleAccommodationsChange = (index, field, value) => {
        const updated = [...accommodations]
        updated[index][field] = value
        setAccommodations(updated)
    }

    const handleFoodsChange = (index, field, value) => {
        const updated = [...foods]
        updated[index][field] = value
        setFoods(updated)
    }

    const handlePointsOfInterestChange = (index, field, value) => {
        const updated = [...pointsOfInterest]
        updated[index][field] = value
        setPointsOfInterest(updated)
    }

    // ADD A ROW TO THE TABLE

    const addAccommodation = () => {
        setAccommodations([
            ...accommodations,
            {
                id: null,
                type: "",
                status: "",
                price: "",
                address: "",
                lat_long: "",
                external_url: "",
                comment: ""
            }
        ])
    }

    const addFood = () => {
        setFoods([
            ...foods,
            {
                id: null,
                type: "",
                address: "",
                lat_long: "",
                external_url: "",
                comment: ""
            }
        ])
    }

    const addPointOfInterest = () => {
        setPointsOfInterest([
            ...pointsOfInterest,
            {
                id: null,
                name: "",
                price: "",
                address: "",
                lat_long: "",
                external_url: "",
                comment: ""
            }
        ])
    }

    // DELETE A ROW OF THE TABLE

    const deleteAccommodation = (accId) => {
        setAccommodations(prev =>
            prev.map(acc =>
                acc.id === accId ? { ...acc, deleted: true } : acc
            )
        )
    }

    const deleteFood = (foodId) => {
        setFoods(prev =>
            prev.map(food =>
                food.id === foodId ? { ...food, deleted: true } : food
            )
        )
    }

    const deletePointOfInterest = (poiId) => {
        setPointsOfInterest(prev =>
            prev.map(poi =>
                poi.id === poiId ? { ...poi, deleted: true } : poi
            )
        )
    }

    // SAVE ALL TABLES AT ONCE (saves all changes to the backend)

    const saveChanges = () => {
        // Match the names to the backend to send data
        const mappedAccommodations = accommodations.map(acc => ({
            id: acc.id,
            type: acc.type,
            status: acc.status,
            price: acc.price,
            address: acc.address,
            lat_long: acc.latLong,
            external_url: acc.url,
            comment: acc.comments,
            deleted: acc.deleted || false
        }))

        const mappedFoods = foods.map(food => ({
            id: food.id,
            type: food.type,
            address: food.address,
            lat_long: food.latLong,
            external_url: food.url,
            comment: food.comments,
            deleted: food.deleted || false
        }))

        const mappedPointsOfInterest = pointsOfInterest.map(poi => ({
            id: poi.id,
            name: poi.name,
            price: poi.price,
            address: poi.address,
            lat_long: poi.latLong,
            external_url: poi.url,
            comment: poi.comments,
            deleted: poi.deleted || false
        }))

        fetch(`https://wander-wise-backend-t1wv.onrender.com/trips/${tripId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: tripName,
                foods: mappedFoods,
                points_of_interest: mappedPointsOfInterest,
                accommodations: mappedAccommodations
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log("Saved", data)
            })
            .catch(err => console.error("Error saving data", err))
    }

    if (loading) {
        return <p className="text-center text-lg">Loading trip details...</p>
    }

    return (

        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-zinc-100">

                <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="text-4xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-center"
                />
                <h3 className="mt-4 mb-20">Edit all the details of your trip</h3>
            </div>

            {/* Accommodations Table */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowAccommodations(prev => !prev)}>
                                    {showAccommodations ?
                                        <svg class="w-6 h-6 mr-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg class="w-6 h-6 mr-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>List of Accommodations</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400"
                            >Make a list with all the hotels, camping sites or any other accommodation places
                                <br /> relevant to your trip. Include all details and stay organized.</p>
                        </div>
                    </caption>

                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Latitude Longitude</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showAccommodations && (
                        <tbody>
                            {accommodations
                                .filter(acc => !acc.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.type || ""}
                                                onChange={(event) => handleAccommodationsChange(index, "type", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.status || ""}
                                                onChange={(event) => handleAccommodationsChange(index, "status", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.price || ""}
                                                onChange={(event) => handleAccommodationsChange(index, "price", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleAccommodationsChange(index, "address", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleAccommodationsChange(index, "latLong", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleAccommodationsChange(index, "url", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handleAccommodationsChange(index, "comments", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteAccommodation(item.id)}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addAccommodation()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-100">
                    ➕ Add Accommodation
                </button>
            </div>

            {/* Foods Table */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowFoods(prev => !prev)}>
                                    {showFoods ?
                                        <svg class="w-6 h-6 mr-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg class="w-6 h-6 mr-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>List of Foods</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400"
                            >Make a list of the restaurants you would like to try, and of possible
                                <br /> markets and stores you that can he helpfull to your trip.</p>
                        </div>
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Latitude Longitude</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showFoods && (
                        <tbody>
                            {foods
                                .filter(food => !food.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.type || ""}
                                                onChange={(event) => handleFoodsChange(index, "type", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handleFoodsChange(index, "address", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handleFoodsChange(index, "latLong", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handleFoodsChange(index, "url", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handleFoodsChange(index, "comments", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteFood(item.id)}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addFood()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-100">
                    ➕ Add Food Item
                </button>
            </div>

            {/* Points of Interest Table */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <button onClick={() => setShowPointsOfInterest(prev => !prev)}>
                                    {showPointsOfInterest ?
                                        <svg class="w-6 h-6 mr-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                        </svg> :
                                        <svg class="w-6 h-6 mr-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                        </svg>
                                    }
                                </button>
                                <span>List of Points of Interest</span>
                            </div>
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400"
                            >List all the places you would like to see, like museums, monuments,
                                <br /> parks, nature attractions, hiking trails, etc. </p>
                        </div>
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Latitude Longitude</th>
                            <th className="px-6 py-3">External URL</th>
                            <th className="px-6 py-3">Comments</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                    </thead>
                    {showPointsOfInterest && (
                        <tbody>
                            {pointsOfInterest
                                .filter(poi => !poi.deleted)
                                .map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(event) => handlePointsOfInterestChange(index, "name", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.price || ""}
                                                onChange={(event) => handlePointsOfInterestChange(index, "price", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.address || ""}
                                                onChange={(event) => handlePointsOfInterestChange(index, "address", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.latLong || ""}
                                                onChange={(event) => handlePointsOfInterestChange(index, "latLong", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(event) => handlePointsOfInterestChange(index, "url", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <input
                                                type="text"
                                                value={item.comments || ""}
                                                onChange={(event) => handlePointsOfInterestChange(index, "comments", event.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deletePointOfInterest(item.id)}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    )}
                </table>
                <button
                    onClick={() => addPointOfInterest()}
                    className="my-5 text-zinc-900 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-100">
                    ➕ Add Point of Interest
                </button>
            </div>

            <button
                onClick={saveChanges}
                className="my-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                    focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                    dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">
                Save Changes
            </button>
        </div>
    )
}