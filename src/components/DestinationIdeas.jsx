import { useState } from "react"
import { useLocation, Link } from "react-router-dom"


export default function DestinationIdeas() {

    const location = useLocation()
    const [currentIndex, setCurrentIndex] = useState(0) // for the carousel

    const ideas = location.state?.destinationIdeas || {}

    console.log(ideas)

    if (!ideas) {
        return <p>No destination ideas received yet.</p>;
    }

    //functioning of carousel
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? ideas.length - 1 : prev - 1))
    }
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === ideas.length - 1 ? 0 : prev + 1))
    }
    const goToSlide = (index) => setCurrentIndex(index)


    return (
        <div className="my-20 md:mx-15 mx-5">
            <div className="flex flex-col justify-center items-center dark:text-[#dddddd]">
                <h1 className="text-4xl font-bold">Your Destination Ideas</h1>
                <h3 className="mt-4 mb-15">Explore these personalized travel suggestions curated just for you</h3>
            </div>



            <div id="default-carousel" className="flex flex-col relative w-full md:w-2/3 mx-auto" data-carousel="slide">
                {/*<!-- Carousel wrapper -->*/}
                <div className="relative flex justify-center h-auto shadow shadow-lg rounded-lg bg-[var(--color-light-blue)] dark:bg-[var(--color-darker-blue)]">
                    {/*<!-- Items -->*/}
                    {ideas.map((idea, index) => (
                        <div
                            key={index}
                            className={`transition-opacity duration-500 ease-in-out mb-10
                                 ${index === currentIndex ? "opacity-100" : "opacity-0 hidden pointer-events-none h-0 w-0"}
                                 `}
                        >
                            <div className="p-6 relative rounded-lg overflow-hidden group bg-[var(--color-light-blue)] dark:bg-[var(--color-darker-blue)]">
                                <h2 className="text-2xl font-bold text-center mt-4 mb-7 text-pretty dark:text-[var(--color-stale-blue)]">{idea.name}</h2>
                                <p className="dark:text-gray-300 text-sm text-center mb-4">{idea.description}</p>
                                <div className="flex flex-col gap-5 md:flex-row mx-10">
                                    <div className="rounded-lg shadow bg-zinc-100 p-5 dark:bg-[var(--color-dark-blue)]">
                                        <h3 className="font-semibold text-center dark:text-[var(--color-stale-blue)] mb-2">Highlights</h3>
                                        <ul className="list-disc list-inside dark:text-[var(--color-stale-blue)] text-sm mb-4">
                                            {idea.highlights.map((highlight, i) => (
                                                <li key={i}>{highlight}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="rounded-lg shadow bg-zinc-100 p-5 dark:bg-[var(--color-dark-blue)]">
                                        <h3 className="font-semibold text-center dark:text-[var(--color-stale-blue)] mb-2">Travel Practicality</h3>
                                        <ul className="list-none dark:text-[var(--color-stale-blue)] text-sm space-y-1">
                                            <li><strong>Distance: </strong>{idea.travel_practicality.distance}</li>
                                            <li><strong>Transport: </strong>{idea.travel_practicality.transport}</li>
                                            <li><strong>Best Time: </strong>{idea.travel_practicality.best_time_to_visit}</li>
                                        </ul>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-center dark:text-[var(--color-stale-blue)] mt-4 mb-2">Useful tips</h3>
                                <p className="dark:text-gray-300 text-center text-sm mb-4">{idea.other_tips}</p>
                                {/* Google Maps link */}
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        idea.name.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "").trim()
                                    )}`} // this regEx removes the emoji from the URL
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-sm mt-3 block text-center"
                                >
                                    View on Google Maps
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                {/*<!-- Slider indicators -->*/}
                <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
                    {ideas.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-[var(--color-dark-azure)]" : "bg-white dark:bg-[var(--color-stale-blue)]"}`}
                        ></button>
                    ))}
                </div>
                {/*<!-- Slider controls -->*/}
                <button onClick={prevSlide} type="button" className="absolute top-0 start-0 z-30 flex items-center h-full px-4 cursor-pointer group focus:outline-none">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900/30 dark:bg-zinc-100/30 group-hover:bg-zinc-800/50 dark:group-hover:bg-zinc-300/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                        <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
                        </svg>
                        <span className="sr-only">Previous</span>
                    </span>
                </button>
                <button onClick={nextSlide} type="button" className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900/30 dark:bg-zinc-100/30 group-hover:bg-zinc-800/50 dark:group-hover:bg-zinc-300/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                        <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                        </svg>
                        <span className="sr-only">Next</span>
                    </span>
                </button>
            </div>
            <div className="flex justify-center">
            <Link to="../trips" target="_blank">
                <button
                    className="general-button bg-[var(--color-pastel-orange)] text-[var(--color-dark-azure)]"
                >
                    Create your trip
                </button>
            </Link>
            </div>


        </div >
    )

}
