import { Link } from "react-router-dom"

export default function NotFound() {
    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-zinc-100">
                <h1 className="text-4xl font-bold">Page not found</h1>
                <h3 className="mt-4 mb-20">The page you are looking for doesn't exist</h3>
                <Link to="/">
                    <button type="button" className="general-button">Go to Home
                    </button>
                </Link>
            </div>
        </div>
    )
}