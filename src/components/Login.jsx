import React, { useState, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../util/config'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok) {
                login(data.access_token)
                navigate('/trips')
            } else {
                alert(data.msg)
            }
        } catch (error) {
            console.error('Error logging in:', error)
        }
    }

    return (

        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:text-[#dddddd] dark:bg-[#222222]">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-[#dddddd]">
                        Sign in to your account
                    </h1>
                    <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-[#dddddd]"
                            >Your email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-[#8d8d8d] dark:border-gray-600 dark:placeholder-[#dddddd] dark:text-[#222222] dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-[#dddddd]"
                            >Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-[#8d8d8d] dark:border-gray-600 dark:placeholder-[#dddddd] dark:text-[#222222] dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="remember" className="text-gray-500 dark:text-[#dddddd]">Remember me</label>
                                </div>
                            </div>
                            <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-[#dddddd]">Forgot password?</a>
                        </div>
                        <button
                            type="submit"
                            className="w-full text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 
                    font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-zinc-800"
                        >Sign in</button>

                        <p className="text-sm font-light text-gray-500 dark:text-[#dddddd]">
                            Don’t have an account yet? <a href="./register" className="font-medium text-primary-600 hover:underline dark:text-[#dddddd]">Sign up</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}



export default Login