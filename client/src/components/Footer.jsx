import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="w-full bg-[#0B0617] text-gray-400 border-t border-gray-800">

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

                <div className="flex flex-col lg:flex-row lg:justify-between gap-16">

                    {/* LEFT SIDE - BRAND */}
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg" />
                            <span className="text-xl font-semibold text-white">
                                Kode<span className="text-purple-500">X</span>
                            </span>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed">
                            Engineering the next generation of technical interview preparation.
                        </p>
                    </div>

                    {/* RIGHT SIDE - LINK COLUMNS */}
                    <div className="flex flex-col sm:flex-row gap-16">

                        {/* Platform */}
                        <div className="min-w-[140px]">
                            <h4 className="text-xs font-semibold text-gray-300 mb-5 tracking-widest">
                                PLATFORM
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/problems" className="hover:text-white transition">Problems</Link></li>
                                <li><Link to="/contests" className="hover:text-white transition">Contests</Link></li>
                                <li><Link to="/discuss" className="hover:text-white transition">Discuss</Link></li>
                            </ul>
                        </div>

                        {/* Community */}
                        <div className="min-w-[140px]">
                            <h4 className="text-xs font-semibold text-gray-300 mb-5 tracking-widest">
                                COMMUNITY
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                                <li><a href="#" className="hover:text-white transition">Discord</a></li>
                                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="min-w-[140px]">
                            <h4 className="text-xs font-semibold text-gray-300 mb-5 tracking-widest">
                                LEGAL
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition">Terms</Link></li>
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 mt-16 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">

                    <p className="text-center sm:text-left">
                        © {new Date().getFullYear()} KodeX Platform. Engineered for excellence.
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wide text-xs">
                            System Status:
                        </span>
                        <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            All Systems Operational
                        </span>
                    </div>

                </div>

            </div>
        </footer>
    );
}

export default Footer;