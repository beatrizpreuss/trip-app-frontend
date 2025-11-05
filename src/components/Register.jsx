import { useState } from 'react'
import { useAuthActions } from '../util/apiCalls'


export default function Register() {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { registerFunction } = useAuthActions()

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            alert("Passwords do not match")
            return
        }
        await registerFunction(username, email, password)
    }


    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:text-[#dddddd] dark:bg-[#222222]">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-[#dddddd]">
                        Create your account
                    </h1>
                    <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
                    <div className="mb-5">
                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your username</label>
                            <input type="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                id="username"
                                className="sign-input-box"
                                placeholder="username"
                                required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                            <input type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                className="sign-input-box"
                                placeholder="name@company.com"
                                required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                            <input type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                className="sign-input-box"
                                required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="repeat-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Repeat password</label>
                            <input type="password"
                                id="repeat-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="sign-input-box"
                                required />
                        </div>
                        {/* <div className="flex items-start mb-5">
                            <div className="flex items-center h-5">
                                <input id="terms" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required />
                            </div>
                            <label htmlFor="terms" className="ml-3 text-sm font-light text-gray-500 dark:text-[#dddddd]">I agree with the <a href="#" className="font-medium text-primary-600 hover:underline dark:text-[#dddddd]">terms and conditions</a></label>
                        </div> */}
                        <button type="submit" className="general-button w-full">Register new account</button>
                    </form>
                </div>
            </div>
        </div>

    )
}