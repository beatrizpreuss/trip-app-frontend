import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { formToBackend } from "../util/apiCalls"
import Idea from "../assets/images/idea-icon.png"

export default function FormAI() {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        location: "",
        goal: "",
        interests: [],
        type: "",
        length: "",
        transport: [],
        preferredPlaces: "",
        avoidPlaces: "",
        season: [],
        acc: []
    })


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        const multipleAnswerQuestions = ["interests", "season", "acc"] // checkbox questions

        if (multipleAnswerQuestions.includes(name)) { // when dealing with checkboxes
            setFormData((prev) => {
                const currentKey = prev[name] || [] // which key are we dealing with?
                return {
                    ...prev,
                    [name]: checked // is the option checked?
                        ? [...currentKey, value] // if so, add to the array of answers
                        : currentKey.filter((v) => v !== value), // if not, make sure it's removed
                }
            })
        }

        else if (type === "radio") { // when dealing with radios (single choice)
            setFormData((prev) => ({ ...prev, [name]: value }))
        }

        else { // when dealing with text inputs
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        console.log("Form Submitted:", formData)
        try {
            const suggestions = await formToBackend(formData)
            navigate("/destination-ideas", {
                state: { destinationIdeas: suggestions.destinations },
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-left dark:text-[var(--color-stale-blue)]">
                <h1 className="text-5xl font-bold">Discover new destinations with AI</h1>
                <h3 className="mt-4 mb-10">
                    Select your preferences and get personalized <br />
                    suggestions of destinations for your next adventure.
                </h3>
            </div>

            <div className="bg-[#DCE4EA] rounded-lg px-8 py-6 mx-auto my-8 max-w-2xl 
                 relative shadow overflow-hidden group dark:bg-[#1E2E40] dark:text-[#dddddd]">
                <h2 className="text-l font-bold dark:text-[#dddddd]">Let's find you a destination!</h2>
                <p className="italic mb-6 text-xs dark:text-zinc-400">Answer the questions below to get AI suggestions</p>

                <form onSubmit={handleSubmit} onChange={handleChange}>
                    <div className="my-4">
                        <label htmlFor="location" className="form-question">Where are you located? <span className="italic text-xs dark:text-zinc-400">City and Country</span></label>
                        <input type="text" id="location" name="location"
                            className="form-input-box" required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">What is the primary goal of your trip?</label>
                        <div className="flex flex-wrap -mx-2">
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-relaxation" className="form-label">
                                    <input
                                        type="radio" id="goal-relaxation" name="goal" value="relaxation" className="mr-2" />Relaxation
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-adventure" className="form-label">
                                    <input type="radio" id="goal-adventure" name="goal" value="adventure" className="mr-2" />Adventure
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-culture" className="form-label">
                                    <input type="radio" id="goal-culture" name="goal" value="culture" className="mr-2" />Culture
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-nature" className="form-label">
                                    <input type="radio" id="goal-nature" name="goal" value="nature" className="mr-2" />Nature
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-food" className="form-label">
                                    <input type="radio" id="goal-food" name="goal" value="food" className="mr-2" />Food & Drink
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-wellness" className="form-label">
                                    <input type="radio" id="goal-wellness" name="goal" value="wellsness" className="mr-2" />Wellness
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-nightlife" className="form-label">
                                    <input type="radio" id="goal-nightlife" name="goal" value="nightlife" className="mr-2" />Nightlife
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="goal-family" className="form-label">
                                    <input type="radio" id="goal-family" name="goal" value="family" className="mr-2" />Family fun
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">What are your top interests?</label>
                        <div className="flex flex-wrap -mx-2">
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-beach" className="form-label">
                                    <input type="checkbox" id="interests-beach" name="interests" value="beach"
                                        className="mr-2" />Beaches / Islands
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-hiking" className="form-label">
                                    <input type="checkbox" id="interests-hiking" name="interests" value="hiking"
                                        className="mr-2" />Mountains / Hiking
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-wildlife" className="form-label">
                                    <input type="checkbox" id="interests-wildlife" name="interests" value="wildlife"
                                        className="mr-2" />Wildlife / Safari
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-history" className="form-label">
                                    <input type="checkbox" id="interests-history" name="interests" value="history"
                                        className="mr-2" />History / Museums
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-culture" className="form-label">
                                    <input type="checkbox" id="interests-culture" name="interests" value="culture"
                                        className="mr-2" />Culture & Festivals
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-gastronomy" className="form-label">
                                    <input type="checkbox" id="interests-gastronomy" name="interests" value="gastronomy"
                                        className="mr-2" />Gastronomy
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-shopping" className="form-label">
                                    <input type="checkbox" id="interests-shopping" name="interests" value="shopping"
                                        className="mr-2" />Shopping
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-sports" className="form-label">
                                    <input type="checkbox" id="interests-sports" name="interests" value="sports"
                                        className="mr-2" />Sports (skiing, surfing, diving, etc.)
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label htmlFor="interests-drives" className="form-label">
                                    <input type="checkbox" id="interests-spodrivesrts" name="interests" value="drives"
                                        className="mr-2" />Road trips / Scenic drives
                                </label>
                            </div>
                        </div>

                        <div className="my-4">
                            <label className="form-label">What type of destinations are you most interested in?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/3">
                                    <label htmlFor="type-famous" className="form-label">
                                        <input
                                            type="radio" id="type-famous" name="type" value="famous" className="mr-2" />Famous and popular spots
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="type-hidden" className="form-label">
                                        <input type="radio" id="type-hidden" name="type" value="hidden" className="mr-2" />Hidden gems and off-the-beaten-path places
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="type-mix" className="form-label">
                                        <input type="radio" id="goal-type-mix" name="type" value="mix" className="mr-2" />A mix of both
                                    </label>
                                </div>

                            </div>
                        </div>

                        <div className="my-4">
                            <label className="form-label">How much time do you have?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/3">
                                    <label htmlFor="length-weekend" className="form-label">
                                        <input type="radio" id="length-weekend" name="length" value="weekend" className="mr-2" />Weekend
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="length-week" className="form-label">
                                        <input type="radio" id="length-week" name="length" value="week" className="mr-2" />A week
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="length-2weeks" className="form-label">
                                        <input type="radio" id="length-2weeks" name="length" value="2weeks" className="mr-2" />Two weeks
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="length-month" className="form-label">
                                        <input type="radio" id="length-month" name="length" value="month" className="mr-2" />A month
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="length-holiday" className="form-label">
                                        <input type="radio" id="length-holiday" name="length" value="holiday" className="mr-2" />Long weekend / Holiday
                                    </label>
                                </div>
                            </div>
                        </div>


                        <div className="mb-4">
                            <label className="form-label">How would you like to reach your destination?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/3">
                                    <label htmlFor="transport" className="form-label">
                                        <input type="checkbox" id="transport-car" name="transport" value="car" className="mr-2" />By car
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="transport" className="form-label">
                                        <input type="checkbox" id="transport-public" name="transport" value="public" className="mr-2" />By public transportation
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="transport" className="form-label">
                                        <input type="checkbox" id="transport-plane" name="transport" value="plane" className="mr-2" />By plane
                                    </label>
                                </div>
                            </div>
                        </div>


                        <div className="my-4">
                            <label htmlFor="preferred" className="form-label">Any preferred places?</label>
                            <input type="text" id="preferred-places" name="preferred"
                                className="form-input-box" />
                        </div>
                        <div className="my-4">
                            <label htmlFor="avoid" className="form-label">Any places to avoid?</label>
                            <input type="text" id="avoid-places" name="avoid"
                                className="form-input-box" />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">At which time of the year do you want to travel?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/4">
                                    <label htmlFor="season-spring" className="form-label">
                                        <input type="checkbox" id="season-spring" name="season" value="spring"
                                            className="mr-2" />Spring
                                    </label>
                                </div>
                                <div className="px-2 w-1/4">
                                    <label htmlFor="season-summer" className="form-label">
                                        <input type="checkbox" id="season-summer" name="season" value="summer"
                                            className="mr-2" />Summer
                                    </label>
                                </div>
                                <div className="px-2 w-1/4">
                                    <label htmlFor="season-autumn" className="form-label">
                                        <input type="checkbox" id="season-autumn" name="season" value="autumn"
                                            className="mr-2" />Autumn
                                    </label>
                                </div>
                                <div className="px-2 w-1/4">
                                    <label htmlFor="season-winter" className="form-label">
                                        <input type="checkbox" id="season-winter" name="season" value="winter"
                                            className="mr-2" />Winter
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">What is your accommodation style?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/3">
                                    <label htmlFor="acc-hotel" className="form-label">
                                        <input type="checkbox" id="acc-hotel" name="acc" value="hotel"
                                            className="mr-2" />Hotel
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="acc-airbnb" className="form-label">
                                        <input type="checkbox" id="acc-airbnb" name="acc" value="airbnb"
                                            className="mr-2" />AirBnB
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="acc-hostel" className="form-label">
                                        <input type="checkbox" id="acc-hostel" name="acc" value="hostel"
                                            className="mr-2" />Hostel
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="acc-camping" className="form-label">
                                        <input type="checkbox" id="acc-camping" name="acc" value="camping"
                                            className="mr-2" />Camping
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label htmlFor="acc-all-inclusive" className="form-label">
                                        <input type="checkbox" id="acc-all-inclusive" name="acc" value="all-inclusive"
                                            className="mr-2" />All-inclusive
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <button type="submit" className="relative flex flex-row general-button bg-[var(--color-crimson)] items-center mr-10 pl-15 dark:text-[var(--color-stale-blue)]">
                                <img src={Idea} className="w-20 absolute -left-7 top-1/2 -translate-y-1/2"/>
                                <span>Give me ideas</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {loading && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-sm z-50">
                    <div className="w-10 h-10 border-4 border-[var(--color-crimson)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-zinc-900 dark:text-zinc-100">We are finding the best destinations for you.</p>
                    <p className="mt-4 text-sm text-zinc-900 dark:text-zinc-100">This might take a few minutes.</p>
                </div>
            )}
        </div>

    )
}