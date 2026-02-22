import Features from "../components/features"
import Footer from "../components/Footer"
import Hero from "../components/hero"
// import Modules from "../components/modules"
import Navbar from "../components/Navbar"


function home() {
    return (
        <div>
            <div className="bg-[#0B0617] text-white min-h-screen">
                <Navbar />
                <Hero />
                <Features />
                <Footer />
                {/* <Modules /> */}
            </div>
        </div>
    )
}

export default home