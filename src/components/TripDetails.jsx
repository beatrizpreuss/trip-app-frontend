import { useState } from "react"
import { useEffect } from "react"
import { useParams } from "react-router-dom"


export default function TripDetails() {

    const { tripId } = useParams()

    const [loading, setLoading] = useState(true)
    const [tripName, setTripName] = useState("")
    const [accommodations, setAccommodations] = useState([{ type: "", status: "", price: "", address: "", latLong: "", url: "", comments: "" }])
    const [foods, setFoods] = useState([])
    const [pointsOfInterest, setPointsOfInterest] = useState([])

    useEffect(() => {
        fetch(`https://wander-wise-backend-t1wv.onrender.com/trips/${tripId}`)
            .then(res => res.json())
            .then(data => {
                setTripName(data.trip.name)
                setAccommodations(data.accommodations)
                setFoods(data.foods)
                setPointsOfInterest(data.pointsOfInterest)
                setLoading(false)
            })
    }, [])


    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-zinc-100">
                <h1 className="text-4xl font-bold">{tripName}</h1>
                <h3 className="mt-4 mb-20">Edit an existing trip or create a new one</h3>
            </div>



            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                        List of Accommodations
                        <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400"
                            >Make a list with all the hotels, camping sites or any other accommodation places 
                            <br/> relevant to your trip. Include all details and stay organized.</p>
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
                                <span className="sr-only">Edit</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {accommodations.map((item, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <input
                                        type="text"
                                        value={item.type}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <input
                                        type="text"
                                        value={item.status}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <input
                                        type="text"
                                        value={item.price}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <input
                                        type="text"
                                        value={item.address}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <input
                                        type="text"
                                        value={item.latLong}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <input
                                        type="text"
                                        value={item.url}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <input
                                        type="text"
                                        value={item.comments}
                                    />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}