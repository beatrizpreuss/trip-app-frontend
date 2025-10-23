import { Link } from "react-router-dom"
import mainImage from "../assets/images/home-main.jpg"
import firstSecondaryImage from "../assets/images/home-signs.jpg"
import secondSecondaryImage from "../assets/images/home-pinned-map.jpg"

export default function Home() {
    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-left dark:text-[#dddddd]">
                <h1 className="text-5xl font-bold">Plan and organize your trips</h1>
                <h3 className="my-4">
                    Discover new destinations with AI suggestions. <br />
                    Map out your journey and keep every detail organized.
                </h3>
            </div>
            <div className="flex flex-row gap-5 mb-10">
                <Link to="/trips">
                    <button type="button" className="general-button">Start planning
                    </button>
                </Link>
                <Link to="/find-destinations">
                    <button type="button" className="general-button">Get ideas
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