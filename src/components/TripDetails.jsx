import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTrip } from "./TripContext"
import { deleteTripById, getTripById, updateTripById } from "../util/apiCalls"
import { formatTripData, mapItemForBackend, mapCategoryForFrontend } from "../util/tripMappers"
import SaveButton from "./SaveButton"
import { AuthContext } from "./AuthContext"
import ExportPDF from "./ExportPDF"
import CategoryTable from "./CategoryTable"


export default function TripDetails() {
    //Pulling state from Context
    const { tripName, setTripName, tripDate, setTripDate, stays, setStays, eatDrink, setEatDrink, explore, setExplore, essentials, setEssentials, gettingAround, setGettingAround } = useTrip()

    const { tripId } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)

    //States that toggle showing each table
    const [showStays, setShowStays] = useState(true)
    const [showEatDrink, setShowEatDrink] = useState(true)
    const [showExplore, setShowExplore] = useState(true)
    const [showEssentials, setShowEssentials] = useState(true)
    const [showGettingAround, setShowGettingAround] = useState(true)

    const [showLatLon, setShowLatLon] = useState(false)

    // used to track unsaved changes to make the Save Changes button another color
    const [hasChanges, setHasChanges] = useState(false)

    //used from when the user is choosing a trip date
    const [isPicking, setIsPicking] = useState(false) 

    const { token, logout, refreshAccessToken } = useContext(AuthContext)

    // GET DATA FROM BACKEND

    useEffect(() => {
        if (!token) return

        const fetchTripDetails = async () => {
            try {
                const data = await getTripById({ tripId, token, refreshAccessToken, logout, navigate })

                if (!data) {
                    setLoading(false)
                    return
                }
                const { tripName, tripDate, stays, eatDrink, explore, essentials, gettingAround } = formatTripData(data)

                setTripName(tripName)
                setTripDate(tripDate ? tripDate : "")
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

    // CHANGE TRIP DATE

    const handleTripDateChange = (value) => {
        // user cleared the date
        if (!value) {
            setTripDate("")        // keep it a string
            setIsPicking(false)
            setHasChanges(true)
            return
        }
        // user selected a date
        const [y, m, d] = value.split("-")
        const formatted = `${d}.${m}.${y}`
        setTripDate(value)     //keep as the actual value for the backend
        setIsPicking(false)
        setHasChanges(true)
    }

    // User clicks outside the date/calendar without choosing a date
    const handleCancelPicking = () => {
        if (tripDate === "") {
            setIsPicking(false)
        }
    }


    // CHANGE DATA IN THE TABLE

    const handleMarkerChange = (category, id, field, value) => {
        const categoryMap = {
            stay: [stays, setStays],
            eatDrink: [eatDrink, setEatDrink],
            explore: [explore, setExplore],
            essentials: [essentials, setEssentials],
            gettingAround: [gettingAround, setGettingAround]
        }
        const [array, setArray] = categoryMap[category];
        if (!array || !setArray) return;

        const updated = array.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        )
        setArray(updated)
        setHasChanges(true)
    }


    // ADD A ROW TO THE TABLE

    function addRow(setCategory, extraFields = []) {
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
            token, tripId, tripName, tripDate,
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
                setShowLatLon(false)
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
            setTripDate("")

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
            <div className="flex flex-col justify-center items-center dark:text-[var(--color-stale-blue)]">
                <div className="relative w-full flex justify-center items-center">
                    <input
                        type="text"
                        value={tripName}
                        onChange={(e) => handleTripNameChange(e.target.value)}
                        className="text-center text-4xl font-bold bg-transparent border-b-1 border-gray-300 dark:border-[#a9a9a9] focus:outline-none focus:border-b-2 text-center"
                    />
                    <div className="absolute right-0">
                        {(tripDate !== "" || isPicking) ? (
                            <input
                                type="date"
                                value={tripDate ? tripDate.split('.').reverse().join('-') : ""}
                                onChange={(e) => handleTripDateChange(e.target.value)}
                                onBlur={handleCancelPicking}
                                className="text-2xl font-bold bg-transparent border-b-1 border-gray-300 dark:border-[#a9a9a9] focus:outline-none focus:border-b-2 text-center"
                            />
                        ) : (
                            <button
                                onClick={() => setIsPicking(true)}
                                className="general-button w-auto bg-[var(--color-pastel-orange)] text-[var(--color-dark-azure)]"
                            >Add Date</button>
                        )
                        }
                    </div>
                </div>
                <h3 className="mt-4">Manage all your trip details in the tables, or open the map to make changes</h3>
            </div>
            <div className="flex flex-row items-center justify-center gap-5">
                <SaveButton saveChanges={saveChanges} hasChanges={hasChanges} />
                <Link to="map">
                    <button
                        className="general-button">
                        Open Map
                    </button>
                </Link>
            </div>

            {/* Stays Table */}
            <CategoryTable
                category="stay"
                data={stays}
                setData={setStays}
                show={showStays}
                setShow={setShowStays}
                showLatLon={showLatLon}
                setShowLatLon={setShowLatLon}
                columns={[
                    { name: "name", label: "Name", type: "textarea" },
                    { name: "status", label: "Status", type: "text" },
                    { name: "price", label: "Price", type: "text" },
                    { name: "address", label: "Address", type: "text" },
                    { name: "day", label: "Day", type: "text" },
                    { name: "url", label: "External URL", type: "text" },
                    { name: "comments", label: "Comments", type: "textarea" },

                ]}
                addRow={addRow}
                extraFields={["status", "price"]}
                deleteRow={deleteRow}
                handleMarkerChange={handleMarkerChange}
            />

            {/* Eat & Drink Table */}
            <CategoryTable
                category="eatDrink"
                data={eatDrink}
                setData={setEatDrink}
                show={showEatDrink}
                setShow={setShowEatDrink}
                showLatLon={showLatLon}
                setShowLatLon={setShowLatLon}
                columns={[
                    { name: "name", label: "Name", type: "textarea" },
                    { name: "address", label: "Address", type: "text" },
                    { name: "day", label: "Day", type: "text" },
                    { name: "url", label: "External URL", type: "text" },
                    { name: "comments", label: "Comments", type: "textarea" },
                ]}
                addRow={addRow}
                extraFields={[]}
                deleteRow={deleteRow}
                handleMarkerChange={handleMarkerChange}
            />

            {/* Explore Table */}
            <CategoryTable
                category="explore"
                data={explore}
                setData={setExplore}
                show={showExplore}
                setShow={setShowExplore}
                showLatLon={showLatLon}
                setShowLatLon={setShowLatLon}
                columns={[
                    { name: "name", label: "Name", type: "textarea" },
                    { name: "price", label: "Price", type: "text" },
                    { name: "address", label: "Address", type: "text" },
                    { name: "day", label: "Day", type: "text" },
                    { name: "url", label: "External URL", type: "text" },
                    { name: "comments", label: "Comments", type: "textarea" },
                ]}
                addRow={addRow}
                extraFields={["price"]}
                deleteRow={deleteRow}
                handleMarkerChange={handleMarkerChange}
            />

            {/* Essentials Table */}
            <CategoryTable
                category="essentials"
                data={essentials}
                setData={setEssentials}
                show={showEssentials}
                setShow={setShowEssentials}
                showLatLon={showLatLon}
                setShowLatLon={setShowLatLon}
                columns={[
                    { name: "name", label: "Name", type: "textarea" },
                    { name: "address", label: "Address", type: "text" },
                    { name: "day", label: "Day", type: "text" },
                    { name: "url", label: "External URL", type: "text" },
                    { name: "comments", label: "Comments", type: "textarea" },
                ]}
                addRow={addRow}
                extraFields={[]}
                deleteRow={deleteRow}
                handleMarkerChange={handleMarkerChange}
            />

            {/* Getting Around Table */}
            <CategoryTable
                category="gettingAround"
                data={gettingAround}
                setData={setGettingAround}
                show={showGettingAround}
                setShow={setShowGettingAround}
                showLatLon={showLatLon}
                setShowLatLon={setShowLatLon}
                columns={[
                    { name: "name", label: "Name", type: "textarea" },
                    { name: "address", label: "Address", type: "text" },
                    { name: "day", label: "Day", type: "text" },
                    { name: "url", label: "External URL", type: "text" },
                    { name: "comments", label: "Comments", type: "textarea" },
                ]}
                addRow={addRow}
                extraFields={[]}
                deleteRow={deleteRow}
                handleMarkerChange={handleMarkerChange}
            />

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
                <ExportPDF
                    stays={stays}
                    eatDrink={eatDrink}
                    explore={explore}
                    essentials={essentials}
                    gettingAround={gettingAround}
                    tripDate={tripDate}
                />
                <button
                    onClick={deleteTrip}
                    className="delete-trip-button">
                    Delete entire trip
                </button>
            </div>
        </div >
    )
}