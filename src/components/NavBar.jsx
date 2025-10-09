import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { NavLink } from 'react-router-dom'

export default function NavBar() {
    const [showDropdown, setShowDropdown] = useState(false)

    return (
        <>
            <nav className="bg-zinc-100 dark:bg-[#222222] fixed w-full z-20 top-0 start-0 border-b border-zinc-200 dark:border-zinc-600">
                <div className="w-full flex flex-wrap items-center justify-between px-15 py-4">
                    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold zinc-100 space-nowrap dark:text-[#dddddd]">WanderWise</span>
                    </a>


                    <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                        
                        <>
                            <button type="button" className="hidden md:block text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                            focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                            dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">Login
                            </button>
                        </>
                        
                        <button onClick={() => { setShowDropdown(!showDropdown) }}
                            data-collapse-toggle="navbar-sticky" type="button"
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-zinc-500 
                            rounded-lg md:hidden hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 
                            dark:text-zinc-400 dark:hover:bg-zinc-900 dark:focus:ring-zinc-600"
                            aria-controls="navbar-sticky" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                            </svg>
                        </button>
                        <ThemeToggle />
                    </div>

                    <div className={`${showDropdown ? "" : "hidden"} items-center justify-between w-full md:flex md:w-auto md:order-1`} id="navbar-sticky">
                        <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-zinc-100 rounded-lg 
                            bg-zinc-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-zinc-100 
                            dark:bg-[#222222] md:dark:bg-[#222222] dark:border-zinc-700">
                            <li>
                                <NavLink to="/"
                                    className={({ isActive }) =>
                                        `block py-2 px-3 text-zinc-900 bg-zinc-50 rounded-sm md:bg-transparent md:text-zinc-900 
                                    md:hover:font-bold md:p-0 md:dark:text-[#dddddd] dark:text-[#dddddd] dark:bg-[#222222]
                                    ${isActive ? "font-bold" : ""}`}>Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/find-destinations"
                                    className={({ isActive }) =>
                                        `block py-2 px-3 text-zinc-900 bg-zinc-50 rounded-sm md:bg-transparent md:text-zinc-900
                                    md:hover:font-bold md:p-0 md:dark:text-[#dddddd] dark:text-[#dddddd] dark:bg-[#222222]
                                    ${isActive ? "font-bold" : ""}`}>Destinations
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/trips"
                                    className={({ isActive }) =>
                                        `block py-2 px-3 text-zinc-900 bg-zinc-50 rounded-sm md:bg-transparent md:text-zinc-900 
                                    md:hover:font-bold md:p-0 md:dark:text-[#dddddd] dark:text-[#dddddd] dark:bg-[#222222]
                                    ${isActive ? "font-bold" : ""}`}>My Trips
                                </NavLink>
                            </li>
                            <>
                                <button type="button" className="md:hidden text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 
                            focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 text-center 
                            dark:bg-[#dddddd] dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800">Login
                                </button>
                            </>
                            {/* <li>
                                <NavLink to="/" 
                                    className={({isActive}) => 
                                    `block py-2 px-3 text-zinc-900 bg-zinc-50 rounded-sm md:bg-transparent md:text-zinc-900 
                                    md:hover:font-bold md:p-0 md:dark:text-[#dddddd] dark:text-[#dddddd] dark:bg-[#222222]
                                    ${isActive ? "font-bold" : ""}`}>Contact
                                </NavLink>
                            </li> */}
                        </ul>
                    </div>

                </div>
            </nav>
        </>
    )
}