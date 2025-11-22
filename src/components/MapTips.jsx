import { useState, useContext, useRef, useEffect } from "react"
import { getTipsByTripId, popupToBackend } from "../util/apiCalls"
import { AuthContext } from "./AuthContext"
import { useNavigate } from "react-router-dom"

export default function MapTips({ tripId }) {

    const [tips, setTips] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { token, logout, refreshAccessToken } = useContext(AuthContext)
    const navigate = useNavigate
    const controllerRef = useRef(null) // allow for cancellation of tip request

    // Reset popup to initial state
    const resetPopup = () => {
        controllerRef.current?.abort() // Abort any ongoing request
        setTips("")
        setIsOpen(false)
    }


    // Backend call (popupToBackend comes from apiCalls.js and it sends the info from the popups to the backend)
    // suggestionsParams are the lat, long, radius that come from TripMap (based on the existing markers)
    const fetchTips = async () => {
        // Abort any existing request
        controllerRef.current?.abort()
        // Create a new controller for the current request
        const controller = new AbortController()
        controllerRef.current = controller

        setLoading(true)
        setTips("")

        try {
            const info = await getTipsByTripId({ token, tripId, signal: controller.signal, refreshAccessToken, logout, navigate })
            if (!controller.signal.aborted) { // only update if not aborted
                console.log("Backend response in MapTips:", info)
                setTips(info.tips)
            }
        } catch (err) {
            if (err.name === "AbortError") {
                console.log("Fetch tips aborted")
            } else {
                console.error("Failed to fetch tips:", err)
                setTips("api_unreachable")
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false)
        }
    }

    // Clean up when component unmounts
    useEffect(() => {
        return () => controllerRef.current?.abort();
    }, [])


    return (
        <div className="flex justify-center">
            {/* Suggestions button */}

            <button className="general-button bg-[var(--color-pastel-orange)] text-[var(--color-dark-azure)]"
                onClick={() => {
                    fetchTips()
                    setIsOpen(true)
                }}>
                Get Tips
            </button>

            {/* Popup */}
            {isOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/80 z-[5000] dark:bg-[#222222]/80">
                    <div className="relative bg-white rounded-xl shadow-lg p-6 w-96 z-[5001] dark:text-[#dddddd] dark:bg-[#222222]">
                        {/* Close button always visible */}
                        <button
                            onClick={resetPopup}
                            className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-[#dddddd] text-lg font-bold"
                            aria-label="Close popup"
                        >
                            ✕
                        </button>
                        {/* If no results yet, show questions */}
                        {loading && (
                            <div className="flex flex-col justify-center items-center">
                                <div className="w-10 h-10 border-4 border-[var(--color-crimson)] border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-zinc-900 dark:text-zinc-100">Fetching tips...</p>
                                <p className="mt-4 text-sm text-zinc-900 dark:text-zinc-100">This might take a few minutes.</p>
                            </div>
                        )}


                        {!loading && tips.length > 0 && (
                            // First, handle values when there are issues
                            tips === "No results found" ? (
                                <div className="mt-5 mr-30">No tips found</div> // actual no suggestions found
                            ) : ["backend_unreachable", "api_unreachable"].includes(tips) ? (
                                <div className="mt-5 mr-30">
                                    Could not connect to the service
                                </div> // issues with backend or api (or internet connection, etc)
                            ) : (
                                // Otherwise, render the real suggestions safely
                                <div className="max-h-64 overflow-y-auto border rounded p-4   bg-white dark:bg-[#222222]">
                                    <h3 className="text-center font-bold mb-2">💡 Tips for your trip 🌎</h3>
                                    <ul className="list-disc list-inside space-y-2">
                                        {tips.map(t => (
                                            <li key={t} className="text-sm text-gray-800 dark:text-gray-200 break-words">
                                                {t || ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        )}

                        {!loading && ["backend_unreachable", "openai_unreachable"].includes(tips) && (
                            <div className="mt-5 mr-30 text-red-500">
                                Could not connect to the service
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}