export default function FormAI() {
    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-left dark:text-zinc-100">
                <h1 className="text-5xl font-bold">Discover new destinations with AI</h1>
                <h3 className="mt-4 mb-10">
                    Select your preferences and get personalized <br />
                    suggestions of destinations for your next adventure.
                </h3>
            </div>

            {/* THIS CODE DOESN'T INCLUDE DARK MODE CSS, DON'T FORGET TO DO IT*/}
            <div className="bg-zinc-100 rounded-lg px-8 py-6 mx-auto my-8 max-w-2xl 
                 relative shadow dark:shadow-zinc-500 overflow-hidden group">
                <h2 className="text-l font-bold">Let's find you a destination!</h2>
                <p className="italic mb-6 text-xs">Answer the questions below to get AI suggestions</p>
                <form>
                    <div class="my-4">
                        <label for="name" class="block text-zinc-900 mb-2">Where are you located? <span className="italic text-xs">City and Country</span></label>
                        <input type="text" id="name" name="name"
                            className="border border-zinc-400 p-2 w-full rounded-lg focus:outline-none focus:border-zinc-900" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-zinc-900 mb-2">What is the primary goal of your trip?</label>
                        <div className="flex flex-wrap -mx-2">
                            <div className="px-2 w-1/3">
                                <label for="goal-relaxation" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-relaxation" name="goal" value="relaxation" className="mr-2" />Relaxation
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="goal-adventure" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-adventure" name="goal" value="adventure" className="mr-2" />Adventure
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="goal-culture" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-culture" name="goal" value="culture" className="mr-2" />Culture
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="goal-nature" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-nature" name="goal" value="nature" className="mr-2" />Nature
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="goal-food" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-food" name="goal" value="food" className="mr-2" />Food & Drink
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="goal-wellness" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-wellness" name="goal" value="wellsness" className="mr-2" />Wellness
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="goal-nightlife" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-nightlife" name="goal" value="nightlife" className="mr-2" />Nightlife
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="goal-family" className="block text-zinc-900 mb-2">
                                    <input type="radio" id="goal-family" name="goal" value="family" className="mr-2" />Family fun
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-zinc-900 mb-2">What are your top interests?</label>
                        <div className="flex flex-wrap -mx-2">
                            <div className="px-2 w-1/3">
                                <label for="interests-beach" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-beach" name="interests[]" value="beach"
                                        className="mr-2" />Beaches / Islands
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-hiking" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-hiking" name="interests[]" value="hiking"
                                        className="mr-2" />Mountains / Hiking
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-wildlife" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-wildlife" name="interests[]" value="wildlife"
                                        className="mr-2" />Wildlife / Safari
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-history" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-history" name="interests[]" value="history"
                                        className="mr-2" />History / Museums
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-culture" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-culture" name="interests[]" value="culture"
                                        className="mr-2" />Culture & Festivals
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-gastronomy" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-gastronomy" name="interests[]" value="gastronomy"
                                        className="mr-2" />Gastronomy
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-shopping" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-shopping" name="interests[]" value="shopping"
                                        className="mr-2" />Shopping
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-sports" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-sports" name="interests[]" value="sports"
                                        className="mr-2" />Sports (skiing, surfing, diving, etc.)
                                </label>
                            </div>
                            <div className="px-2 w-1/3">
                                <label for="interests-drives" className="block text-zinc-900 mb-2">
                                    <input type="checkbox" id="interests-spodrivesrts" name="interests[]" value="drives"
                                        className="mr-2" />Road trips / Scenic drives
                                </label>
                            </div>
                        </div>

                        <div className="my-4">
                            <label className="block text-zinc-900 mb-2">How much time do you have?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/3">
                                    <label for="length-weekend" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-weekend" name="length" value="weekend" className="mr-2" />Weekend
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="length-week" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-week" name="length" value="week" className="mr-2" />A week
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="length-2weeks" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-2weeks" name="length" value="2weeks" className="mr-2" />Two weeks
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="length-month" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-month" name="length" value="month" className="mr-2" />A month
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="length-holiday" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-holiday" name="length" value="holiday" className="mr-2" />Long weekend / Holiday
                                    </label>
                                </div>
                            </div>
                        </div>


                        <div className="mb-4">
                            <label className="block text-zinc-900 mb-2">How would you like to reach your destination?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/3">
                                    <label for="length-weekend" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-weekend" name="length" value="weekend" className="mr-2" />By car
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="length-week" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-week" name="length" value="week" className="mr-2" />By public transportation
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="length-2weeks" className="block text-zinc-900 mb-2">
                                        <input type="radio" id="length-2weeks" name="length" value="2weeks" className="mr-2" />By plane
                                    </label>
                                </div>
                            </div>
                        </div>


                        <div class="my-4">
                            <label for="preferred-places" class="block text-zinc-900 mb-2">Any preferred places?</label>
                            <input type="text" id="preferred-places" name="preferred-places"
                                className="border border-zinc-400 p-2 w-full rounded-lg focus:outline-none focus:border-zinc-900" />
                        </div>
                        <div class="my-4">
                            <label for="avoid-places" class="block text-zinc-900 mb-2">Any places to avoid?</label>
                            <input type="text" id="avoid-places" name="avoid-places"
                                className="border border-zinc-400 p-2 w-full rounded-lg focus:outline-none focus:border-zinc-900" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-zinc-900 mb-2">At which time of the year do you want to travel?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/4">
                                    <label for="season-spring" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="season-spring" name="season[]" value="spring"
                                            className="mr-2" />Spring
                                    </label>
                                </div>
                                <div className="px-2 w-1/4">
                                    <label for="season-summer" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="season-summer" name="season[]" value="summer"
                                            className="mr-2" />Summer
                                    </label>
                                </div>
                                <div className="px-2 w-1/4">
                                    <label for="season-autumn" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="season-autumn" name="season[]" value="autumn"
                                            className="mr-2" />Autumn
                                    </label>
                                </div>
                                <div className="px-2 w-1/4">
                                    <label for="season-winter" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="season-winter" name="season[]" value="winter"
                                            className="mr-2" />Winter
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-zinc-900 mb-2">What is your accommodation style?</label>
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/3">
                                    <label for="acc-hotel" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="acc-hotel" name="acc[]" value="hotel"
                                            className="mr-2" />Hotel
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="acc-airbnb" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="acc-airbnb" name="acc[]" value="airbnb"
                                            className="mr-2" />AirBnB
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="acc-hostel" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="acc-hostel" name="acc[]" value="hostel"
                                            className="mr-2" />Hostel
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="acc-camping" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="acc-camping" name="acc[]" value="camping"
                                            className="mr-2" />Camping
                                    </label>
                                </div>
                                <div className="px-2 w-1/3">
                                    <label for="acc-all-inclusive" className="block text-zinc-900 mb-2">
                                        <input type="checkbox" id="acc-all-inclusive" name="acc[]" value="all-inclusive"
                                            className="mr-2" />All-inclusive
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="bg-zinc-900 text-zinc-100 px-4 py-2 rounded-lg hover:bg-zinc-800">Give me ideas</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    )
}