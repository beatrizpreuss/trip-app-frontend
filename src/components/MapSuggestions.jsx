import { useState } from "react"
import { popupToBackend } from "../util/apiCalls";

export default function MapAISuggestions({ tripId, suggestionsParams, onAddMarker }) {
    // Popup + flow states
    const [isOpen, setIsOpen] = useState(false);
    const [currentNode, setCurrentNode] = useState("start") // start or category
    const [branchStep, setBranchStep] = useState(0) // question index inside branch
    const [answers, setAnswers] = useState({})
    const [selectedOptions, setSelectedOptions] = useState([])
    const [textInput, setTextInput] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [selectedSuggestions, setSelectedSuggestions] = useState([])

    const [loading, setLoading] = useState(false)

    // Question structure (linear per category)
    const questionTree = {
        start: {
            text: "Which part of your trip do you need suggestions for?",
            options: ["stays", "eatDrink", "explore", "essentials", "gettingAround"],
            type: "single"
        },
        stays: [
            {
                key: "style",
                text: "What accommodation style are you looking for?",
                options: ["Camping", "Hostel", "Budget Hotel", "Mid-range Hotel", "Luxury Hotel", "B&B", "All-inclusive"],
                type: "multi"
            },
            {
                key: "company",
                text: "Who are you traveling with?",
                options: ["Solo", "Partner", "Kids", "Pets"],
                type: "multi"
            }
        ],
        eatDrink: [
            { key: "cuisine", text: "What type of cuisine are you interested in?" }, // open question
            {
                key: "diningStyle",
                text: "Do you prefer casual or fine dining?",
                options: ["Casual", "Fine"],
                type: "single"
            }
        ],
        explore: [
            {
                key: "activityType",
                text: "Do you prefer indoor or outdoor?",
                options: ["Indoor", "Outdoor"],
                type: "single"
            },
            {
                key: "friendly",
                text: "Should it be kid-friendly or pet-friendly?",
                options: ["Yes, both", "Kid-friendly", "Pet-friendly", "No"],
                type: "single"
            }
        ],
        essentials: [
            {
                key: "type",
                text: "What type of essential do you need?",
                options: ["Supermarket", "Pharmacy", "ATM", "Hospital", "Other"],
                type: "single"
            }
        ],
        gettingAround: [
            {
                key: "type",
                text: "What do you need?",
                options: ["Train stations", "Bus stops", "Parking spots", "Bike rentals", "Charging Stations", "Car rental"],
                type: "multi"
            }
        ]
    }

    // Make the names that will show in the questionnaire look better
    const optionLabels = {
        stays: "Stays",
        eatDrink: "Eat & Drink",
        explore: "Places to explore",
        essentials: "Essentials",
        gettingAround: "Getting Around"
    }

    // Determine current question
    let currentQuestion = null
    if (currentNode === "start") {
        currentQuestion = questionTree.start
    } else if (suggestions.length === 0) {
        currentQuestion = questionTree[currentNode][branchStep]
    }

    // Reset popup to initial state
    const resetPopup = () => {
        setIsOpen(false)
        setCurrentNode("start")
        setBranchStep(0)
        setAnswers({})
        setSuggestions([])
        setTextInput("")
        setSelectedOptions([])
    }

    // Handle questionnaire answers from popup (each answer goes to selectedOptions) This function doesn't add the answers to the final answers, what does that is the submitAnswer function
    const handleOptionClick = (option, type) => {

        //if the current question has no options, it means it's an open question (text input)
        if (!currentQuestion.options) {
            setSelectedOptions([option]) // option is the typed text

            // multipe-choice questions (toggle what is selected and what's not, and add it to selectedOptions state)
        } else if (type === "multi") {
            let newOptions
            if (selectedOptions.includes(option)) { // if the clicked option is already selected (already in selectedOptions), deselect
                setSelectedOptions(selectedOptions.filter(opt => opt !== option)) // if the option in the list is different from the option we are talking about, include it in selectedOptions
            } else {
                setSelectedOptions([...selectedOptions, option]) // if the clicked option is not selected (not in selectedOptions), select
            }

            // Single-choice questions
        } else {
            setSelectedOptions([option])
        }
    }


    // When "Next" is clicked, it submits the answer saved in selectedOptions, adding it to the dictionary in the "answers" state
    const submitAnswer = (selectedOptions) => {
        if (currentNode === "start") { //question 1: definition of category
            setAnswers({ category: selectedOptions[0] }) //add this answer to the answer state along with the key ("category")
            setCurrentNode(selectedOptions[0]) //move currentNode state to the category
            setBranchStep(0) //set first question of the category branch
            setSelectedOptions([]) //clear selectedOptions state for the next question
            return
        }
        const question = questionTree[currentNode][branchStep] //find the right question
        const newAnswers = {
            ...answers, // leave the answers I already have
            [question.key]: question.type === "multi" ? selectedOptions : selectedOptions[0] //set new answer (if type of question is "multi", answer is an array, otherwise, answer is a string)
        };
        setAnswers(newAnswers) //change answer state
        console.log("Selected options:", selectedOptions)
        setSelectedOptions([]) //clear selectedOptions state for the next question

        // Move to next question or fetch suggestions
        if (branchStep + 1 < questionTree[currentNode].length) { //if there are still questions (branchStep + 1 exists inside the category list), move to next question
            setBranchStep(branchStep + 1)
        } else { //if there are no more questions, fetch suggestions
            setLoading(true)
            console.log("Fetching suggestions with answers", newAnswers)
            fetchSuggestions(newAnswers).finally(() => {
                setLoading(false)
            })
        }
    }


    // Backend call (popupToBackend comes from apiCalls.js and it sends the info from the popups to the backend)
    // suggestionsParams are the lat, long, radius that come from TripMap (based on the existing markers)
    const fetchSuggestions = async (finalAnswers) => {
        console.log("fetchSuggestions called, final answers:", finalAnswers)
        if (!suggestionsParams) {
            console.error("suggestionsParams is undefined!")
            return
        }
        try {
            const info = await popupToBackend(tripId, finalAnswers, suggestionsParams)
            console.log("Backend response in MapAISuggestions:", info)
            setSuggestions(info)
        } catch (err) {
            console.error("Failed to fetch suggestions:", err)
        }
    }


    // User picks one suggestion → add marker
    const handleSelectSuggestion = (suggestion) => {
        const category = answers.category
        const lat = suggestion.lat ?? suggestion.center?.lat
        const lon = suggestion.lon ?? suggestion.center?.lon

        if (lat == null || lon == null) {
            console.error("No valid coordinates found for ", suggestion)
        }
        const newMarker = {
            id: `temp-${Date.now()}`,
            latLong: [lat, lon],
            name: suggestion.tags?.name || "Suggestion",
            status: "",
            price: "",
            address: suggestion.tags?.addr_street || "",
            day: 1,
            url: suggestion.tags?.website || "",
            comments: ""
        }
        console.log("handleSelectSuggestion:", newMarker)

        onAddMarker(category, newMarker)
        setSelectedSuggestions(prev => [...prev, suggestion])
    }

    return (
        <div>
            {/* Suggestions button */}

            <button
                onClick={() => setIsOpen(true)}
                className="w-50 my-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 
                    font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-zinc-800">
                Get Suggestions
            </button>

            {/* Popup */}
            {isOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/80 z-[1000] dark:bg-[#222222]/80">
                    <div className="relative bg-white rounded-xl shadow-lg p-6 w-96 z-[1001] dark:text-[#dddddd] dark:bg-[#222222]">
                        {/* Close button always visible */}
                        <button
                            onClick={resetPopup}
                            className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-[#dddddd] text-lg font-bold"
                            aria-label="Close popup"
                        >
                            ✕
                        </button>
                        {/* If no results yet, show questions */}
                        {loading ? (
                            <div className="mt-5 mr-30">Fetching suggestions...</div>
                        ) : (
                            suggestions.length === 0 ? (
                                <div>
                                    <p className="mb-4 font-semibold">{currentQuestion.text}</p>

                                    {/* Questions with options */}
                                    {currentQuestion.options ? (
                                        <div className="flex flex-col gap-2">
                                            {currentQuestion.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleOptionClick(opt, currentQuestion.type)}
                                                    className={`px-4 py-2 rounded shadow mb-2 ${selectedOptions.includes(opt) ? "bg-[#a9a9a9] text-white" : "bg-[#dddddd] dark:bg-[#8d8d8d] dark:text-[#dddddd]"}`}
                                                >
                                                    {optionLabels[opt] || opt}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    if (selectedOptions.length > 0) {
                                                        submitAnswer(selectedOptions)
                                                    }
                                                }}
                                                className="my-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 
                                            font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-zinc-800"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    ) : (
                                        /* Questions with text input */
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type your answer"
                                                className="border rounded px-2 py-1 flex-grow"
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                            />
                                            <button
                                                onClick={() => submitAnswer([textInput.trim()])}
                                                disabled={textInput.trim() === ""}
                                                className="text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm 
                                            px-4 py-2 text-center dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-zinc-800"
                                            >
                                                OK
                                            </button>
                                        </div>
                                    )}
                                    {/* Cancel Button */}
                                    <button
                                        onClick={resetPopup}
                                        className=" my-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm
                            px-4 py-2 text-center dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-zinc-800"
                                    >
                                        Cancel
                                    </button>
                                </div>

                            ) : (
                                (suggestions?.length > 0) ? (
                                    <ul className="max-h-64 overflow-y-auto border rounded p-2 space-y-2">
                                        {suggestions.map(s => (
                                            <li key={s.id} className="flex justify-between items-center last:border-b-0">
                                                <a href={s.tags?.website || s.tags["contact:website"]} target="_blank" className={`flex flex-col ${(s.tags?.website || s.tags?.["contact:website"]) ? "hover:text-blue-500" : ""}`}>
                                                    <span className="text-sm text-wrap truncate font-bold">{s.tags?.name || "(unnamed)"}</span>
                                                    <span className="text-xs text-wrap truncate">{s.description || ""}</span>
                                                </a>


                                                <button
                                                    onClick={() => handleSelectSuggestion(s)}
                                                    className=" my-5 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm
                                                        px-4 py-2 text-center dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-zinc-800"
                                                >{selectedSuggestions.some(sel => sel.id === s.id) ? "Added" : "Add"}</button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="mt-5 mr-30">No suggestions found</div>
                                )
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
