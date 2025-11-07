export default function About() {

    return (
        <>
        <div className="mt-25 mx-15">
            <div className="flex flex-row">


                <div className="flex flex-col justify-center items-left w-3/5 dark:text-[#dddddd]">
                    <div>
                        <h1 className="text-4xl font-bold">🌍 About WanderWise</h1>
                        <h2 className="mt-4 mb-10 text-2xl">Find your next destination. Plan it your way.</h2>
                    </div>
                    <div className="w-8/10 bg-zinc-200 p-8 rounded-lg">
                        <p className="align-center"> At WanderWise, we believe every great trip starts with inspiration —
                            and a little help organizing it. Whether you’re dreaming of your next getaway or
                            already have a place in mind, we make travel planning effortless and inspiring.
                        </p>
                    </div>
                    <div className="w-8/10">
                        <h2 className="text-xl font-bold mt-10 mb-5">💫 Our Mission</h2>
                        <p> To make travel discovery and planning intuitive, personal, and inspiring — so you spend
                            less time researching and more time experiencing the world.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col w-1/2 gap-10 mt-10">

                    <div className="flex flex-col">
                        <h3 className="font-bold my-3 text-xl">✈️ Don’t know where to go?</h3>
                        <p> Answer a few quick questions about your interests, travel style, and where you live,
                            and we’ll suggest destinations that fit you. From world-famous landmarks to off-the-beaten-path
                            gems, you’ll discover places that match your vibe — not just the ones trending online.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold my-3 text-xl">🗺️ Already have a destination in mind?</h3>
                        <p> Create an account and start building your trip. Add your favorite places, organize them
                            by category, and visualize everything on an interactive map.
                        </p>
                        <div>
                            <span>With AI-powered suggestions, you can explore new spots around your chosen locations or get
                                tailored travel tips based on your itinerary — making your trip smarter, smoother, and uniquely yours.
                            </span>
                        </div>
                    </div>
                </div>


            </div>
        </div>

        <div className="flex flex-col mt-15 bg-zinc-200 px-15 py-7">
            <h3 className="text-sm font-bold mb-2">Built with passion and curiosity by Beatriz Preuss. </h3>
            <p className="text-sm">
                This platform was created as my final project during my Software Engineering course at MasterSchool, 
                inspired by my love for travel and technology — and the idea that great adventures start with great planning.
            </p>
        </div>
        </>
    )
}