import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"
import Footer from "./Footer"

export default function Layout() {
    return (
        <div className="bg-zinc-100 dark:bg-[#424242]"> 
        {/* these classNames above are redundant. Decide if I keep them here on in the components */}
            <NavBar />
                <main className="pt-16">
                    <Outlet />
                </main>
            <Footer />
        </div>
    )
}