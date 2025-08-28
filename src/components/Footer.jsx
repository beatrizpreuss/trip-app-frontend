export default function Footer() {
    return (
        <footer className="bg-zinc-100 rounded-lg shadow-sm dark:bg-zinc-900 m-4">
            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <a href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">WanderWise</span>
                    </a>
                    <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-zinc-900 sm:mb-0 dark:text-zinc-100">
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">About</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline">Contact</a>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <span className="block text-sm text-zinc-900 sm:text-center dark:text-zinc-100">© 2025 <a href="https://flowbite.com/" className="hover:underline">WanderWise™</a>. All Rights Reserved.</span>
            </div>
        </footer>
    )
}