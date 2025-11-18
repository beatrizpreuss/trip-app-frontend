import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"
import Footer from "./Footer"

export default function Layout() {
    return (
        <div className="bg-[zinc-100] dark:bg-[var(--color-steel-navy)]"> 
        {/* these classNames above are redundant. Decide if I keep them here on in the components */}
            <NavBar />
                <main className="py-16">
                    <Outlet />
                </main>
            <Footer />
        </div>
    )
}