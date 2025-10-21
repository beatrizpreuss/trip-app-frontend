import { useState } from 'react'
import { useAuthActions } from '../util/apiCalls'


export default function Register() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { registerFunction } = useAuthActions()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await registerFunction(email, password)
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
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                            <input type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light"
                                placeholder="name@company.com"
                                required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                            <input type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light"
                                required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="repeat-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Repeat password</label>
                            <input type="password"
                                id="repeat-password"
                                className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light"
                                required />
                        </div>
                        <div className="flex items-start mb-5">
                            <div className="flex items-center h-5">
                                <input id="terms" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required />
                            </div>
                            <label htmlFor="terms" className="ml-3 text-sm font-light text-gray-500 dark:text-[#dddddd]">I agree with the <a href="#" className="font-medium text-primary-600 hover:underline dark:text-[#dddddd]">terms and conditions</a></label>
                        </div>
                        <button type="submit" className="w-full text-zinc-100 bg-zinc-900 hover:bg-zinc-800 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 
                    font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#dddddd] dark:hover:bg-zinc-300 dark:focus:ring-zinc-800 dark:text-zinc-800">Register new account</button>
                    </form>
                </div>
            </div>
        </div>

    )
}