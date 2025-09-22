export default function Footer() {
    return (
        <footer className="bg-zinc-100 rounded-lg shadow-sm dark:bg-[#222222] m-4">
            <div className="w-full mx-auto px-11 md:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <a href="/" className="flex items-center mb-4 sm:mb-0 ">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-[#dddddd]">WanderWise</span>
                    </a>
                    <ul className="flex flex-wrap space-x-6 items-center mb-6 text-sm font-medium text-zinc-900 sm:mb-0 dark:text-[#dddddd]">
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">About</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">FAQ</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Sign up</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline">Login</a>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-[#8d8d8d] lg:my-8" />
                <span className="block text-sm text-zinc-900 sm:text-center dark:text-[#dddddd]">© 2025 <a href="/" className="hover:underline">WanderWise™</a>. All Rights Reserved.</span>
            </div>
        </footer>
    )
}