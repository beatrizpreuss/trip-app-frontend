import { useLocation } from "react-router-dom"


export default function DestinationIdeas() {

    const location = useLocation()

    const ideas = location.state?.destinationIdeas || {}

    console.log(ideas)

    if (!ideas) {
        return <p>No destination ideas received yet.</p>;
    }

    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-[#dddddd]">
                    <h1 className="text-4xl font-bold">Your Destination Ideas</h1>
                    <h3 className="mt-4 mb-20">Explore these personalized travel suggestions curated just for you</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ideas.map((idea, index) => (
                <div
                    key={index}
                    className="p-6 relative rounded-lg shadow shadow-lg dark:shadow-[#a9a9a9] overflow-hidden group"
                >                    
                    <h2 className="text-2xl font-bold text-center mt-4 mb-7 text-pretty dark:text-[#dddddd]">{idea.name}</h2>
                    <p className="dark:text-gray-300 text-sm text-center mb-4">{idea.description}</p>
                    <div>
                        <h3 className="font-semibold dark:text-[#dddddd] mb-2">Highlights</h3>
                        <ul className="list-disc list-inside dark:text-[#dddddd] text-sm mb-4">
                            {idea.highlights.map((highlight, i) => (
                                <li key={i}>{highlight}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-auto">
                        <h3 className="font-semibold dark:text-[#dddddd] mb-2">Travel Practicality</h3>
                        <ul className="list-none dark:text-[#dddddd] text-sm space-y-1">
                            <li><strong>Distance: </strong>{idea.travel_practicality.distance}</li>
                            <li><strong>Transport: </strong>{idea.travel_practicality.transport}</li>
                            <li><strong>Best Time: </strong>{idea.travel_practicality.best_time_to_visit}</li>
                        </ul>
                    </div>
                    <h3 className="font-semibold dark:text-[#dddddd] mt-4 mb-2">Useful tips</h3>
                    <p className="dark:text-gray-300 text-sm mb-4">{idea.other_tips}</p>
                </div>
            ))}
            </div>
        </div>
    )

}
