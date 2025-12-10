import { useState, useContext, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import { Link, NavLink } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import { useUser } from "./UserContext"
import Logo from '../assets/images/logo.png'


export default function NavBar() {
    const [showDropdown, setShowDropdown] = useState(false)
    const { token, logout } = useContext(AuthContext) //comes from AuthContext
    const { user, setUser } = useUser() //comes from UserContext


    return (
        <>
            <nav className="bg-[var(--color-stale-blue)] fixed w-full z-20 top-0 start-0 shadow shadow-zinc-100 dark:border-zinc-600">
                <div className="w-full flex flex-wrap items-center justify-between px-15 py-2">
                    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src={Logo} className="logo" />
                    </a>

                    <div className="flex flex-row items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">

                        {token ? (
                            <div className="flex flex-row items-center">
                                <Link
                                    to="/profile"
                                    className="relative md:mr-5 inline-flex items-center justify-center w-8 h-8 overflow-hidden bg-white rounded-full dark:bg-gray-600">
                                    <span className="font-bold text-[var(--color-crimson)] dark:text-[#dddddd]">{user?.username?.[0] ?? ""}</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setUser("")
                                        logout()
                                    }}
                                    className="hidden md:block general-button m-0 w-25"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:block general-button m-0 w-25"
                            >
                                Login
                            </Link>
                        )}


                        <button onClick={() => { setShowDropdown(!showDropdown) }}
                            data-collapse-toggle="navbar-sticky" type="button"
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-zinc-500 rounded-lg md:hidden hover:bg-zinc-100
                            focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:text-zinc-600 dark:hover:bg-zinc-900 dark:focus:ring-zinc-600"
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
                            md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 
                            dark:border-zinc-700">
                            <li>
                                <NavLink to="/"
                                    className={({ isActive }) => `navbar-option ${isActive ? "bg-[#A5B7C4]" : ""}`}>Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/find-destinations"
                                    className={({ isActive }) => `navbar-option ${isActive ? "bg-[#A5B7C4]" : ""}`}>Destinations
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/trips"
                                    className={({ isActive }) => `navbar-option ${isActive ? "bg-[#A5B7C4]" : ""}`}>My Trips
                                </NavLink>
                            </li>
                        </ul>


                        {token ? (
                            <button
                                onClick={() => {
                                    setUsername("")
                                    logout()
                                }}
                                className="general-button w-full my-2 block md:hidden"
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="flex flex-row justify-center">
                                <Link
                                    to="/login"
                                    className="general-button block md:hidden w-25"
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                
            {/* <hr className="border-zinc-100 dark:border-[#8d8d8d]" /> */}
            </nav>
        </>
    )
}