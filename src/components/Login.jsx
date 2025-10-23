import React, { useState} from 'react'
import { useAuthActions } from '../util/apiCalls'


export default function Login() {
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { loginFunction } = useAuthActions()

    const handleSubmit = async (e) => {
        e.preventDefault()
        loginFunction(email, password)
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
                                className="sign-input-box"
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
                                className="sign-input-box"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 dark:bg-gray-700 dark:border-gray-600 dark:ring-offset-gray-800" required="" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="remember" className="text-gray-500 dark:text-[#dddddd]">Remember me</label>
                                </div>
                            </div>
                            <a href="#" className="text-sm font-medium hover:underline dark:text-[#dddddd]">Forgot password?</a>
                        </div>
                        <button
                            type="submit"
                            className="general-button w-full"
                        >Sign in</button>

                        <p className="text-sm font-light text-gray-500 dark:text-[#dddddd]">
                            Don’t have an account yet? <a href="./register" className="font-medium hover:underline dark:text-[#dddddd]">Sign up</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}