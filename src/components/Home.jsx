import { Link } from "react-router-dom"
import mainImage from "../assets/images/home-main.jpg"
import firstSecondaryImage from "../assets/images/home-signs.jpg"
import secondSecondaryImage from "../assets/images/home-pinned-map.jpg"

export default function Home() {
    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-left dark:text-[#dddddd]">
                <h1 className="text-5xl font-bold">Plan and organize your trips</h1>
                <h3 className="mt-4 mb-10">
                    Discover new destinations with AI suggestions. <br />
                    Map out your journey and keep every detail organized.
                </h3>
            </div>
            <div className="flex flex-row gap-5 mb-10">
                <Link to="/trips">
                    <button type="button" className="w-50 h-10 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                            focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                            dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">Start planning
                    </button>
                </Link>
                <Link to="/find-destinations">
                    <button type="button" className="w-50 h-10 text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                            focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                            dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">Get ideas
                    </button>
                </Link>
            </div>
            <img src={mainImage} alt="Planning a trip"/>
            <h2 className="text-3xl font-bold mt-20 mb-10 dark:text-[#dddddd]">Let's plan—together</h2>
            <div className="flex flex-row gap-8 dark:text-[#dddddd]">
                <Link to="/find-destinations">
                    <div className="flex flex-col">
                        <img className="w-200 h-85 object-cover mb-4" src={firstSecondaryImage}/>
                        <h3 className="font-bold my-3">Need travel ideas?</h3>
                        <p>Let our AI be your guide. Based on your travel style, we’ll suggest exciting destinations tailored just for you—whether you're looking for adventure, relaxation, or something in between.</p>
                    </div>
                </Link>
                <Link to="/trips">
                    <div className="flex flex-col dark:text-[#dddddd]">
                        <img className="w-200 h-85 object-cover mb-4" src={secondSecondaryImage}/>
                        <h3 className="font-bold my-3">Already know where you are going?</h3>
                        <p>Add your trip details like destinations, prices, and transportation. We’ll organize everything into a clean, interactive map so you can focus on the fun—not the planning.</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}