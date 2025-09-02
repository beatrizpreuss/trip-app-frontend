import { Link } from "react-router-dom"

export default function NotFound() {
    return (
        <div className="m-25 mx-15">
            <div className="flex flex-col justify-center items-center dark:text-zinc-100">
                <h1 className="text-4xl font-bold">Page not found</h1>
                <h3 className="mt-4 mb-20">The page you are looking for doesn't exist</h3>
                <Link to="/">
                    <button type="button" className="text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                            focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                            dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">Go to Home
                    </button>
                </Link>
            </div>
        </div>
    )
}