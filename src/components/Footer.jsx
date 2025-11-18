import Logo from '../assets/images/logo.png'

export default function Footer() {
    
    return (
        <footer className="bg-[var(--color-stale-blue)] rounded-lg shadow-smm-4">
            <div className="w-full mx-auto px-11 md:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <a href="/" className="flex items-center mb-4 sm:mb-0 ">
                        <img src={Logo} className="logo w-30" />
                    </a>
                    <ul className="flex flex-wrap space-x-6 items-center mb-6 text-sm font-medium text-zinc-900 sm:mb-0">
                        <li>
                            <a href="/about" className="hover:underline me-4 md:me-6">About</a>
                        </li>
                        <li>
                            <a href="/register" className="hover:underline me-4 md:me-6">Sign up</a>
                        </li>
                        <li>
                            <a href="/login" className="hover:underline">Login</a>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-[var(--color-dark-azure)] sm:mx-auto dark:border-[#8d8d8d] lg:my-8" />
                <span className="block text-sm text-zinc-900 sm:text-center">© 2025 <a href="/" className="hover:underline">WanderWise™</a>. All Rights Reserved.</span>
            </div>
        </footer>
    )
}