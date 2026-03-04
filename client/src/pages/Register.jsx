import { useForm } from "react-hook-form"
import { FcGoogle } from "react-icons/fc"
import Footer from "../components/Footer"
import { toast } from "react-toastify"
import api from "../utils/api"
import { useNavigate } from "react-router"

function Register() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm()
    const navigate = useNavigate()

    const onSubmit = async (data) => {
        try {
            const res = await api.post("/api/v1/auth/register", data);
            toast.success(res.data.message || "Registration successful!")
            navigate("/login")
            reset()
        } catch (err) {
            console.error(err)
            toast.error(err.message || "Registration failed. Please try again.")
        }
    }

    const handleGoogleSignUp = () => {
        //Todo: Implement Google OAuth flow
        // Tode: setup firebase project and integrate
        toast.error("Google Sign-Up is not implemented yet.")
    }

    return (
        <div className="bg-[#0B0617] text-white min-h-screen flex flex-col">
            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">

                    {/* LEFT SIDE */}
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-6">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                KodeX
                            </span>
                        </h1>

                        <h2 className="text-5xl font-bold leading-tight">
                            Master the{" "}
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Algorithms
                            </span>{" "}
                            of tomorrow.
                        </h2>

                        <p className="text-gray-400 mt-6 text-lg">
                            Join an elite DSA ecosystem built for serious developers.
                            From fundamentals to competitive mastery.
                        </p>
                    </div>

                    {/* RIGHT SIDE - FORM */}
                    <div className="bg-[#140A2A] border border-purple-800/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
                        <h2 className="text-3xl font-semibold mb-2">
                            Create Account
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Start your journey into high-level algorithms.
                        </p>

                        {/* Google Button */}
                        <button
                            onClick={handleGoogleSignUp}
                            className="w-full flex items-center justify-center gap-3 bg-[#1A1235] hover:bg-[#22184A] border border-purple-700/30 py-3 rounded-lg transition mb-6 cursor-pointer"
                        >
                            <FcGoogle size={22} />
                            <span className="font-medium">Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-grow h-px bg-purple-800/30"></div>
                            <span className="px-4 text-sm text-gray-400">OR</span>
                            <div className="flex-grow h-px bg-purple-800/30"></div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                            {/* Username */}
                            <div>
                                <label className="text-sm text-gray-400">Username</label>
                                <input
                                    type="text"
                                    {...register("username", {
                                        required: "Username is required",
                                        minLength: {
                                            value: 3,
                                            message: "Minimum 3 characters",
                                        },
                                    })}
                                    className="w-full mt-2 px-4 py-3 rounded-lg bg-[#0F0820] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                    placeholder="john_doe"
                                />
                                {errors.username && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm text-gray-400">Email</label>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                    className="w-full mt-2 px-4 py-3 rounded-lg bg-[#0F0820] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm text-gray-400">Password</label>
                                <input
                                    type="password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Minimum 6 characters",
                                        },
                                    })}
                                    className="w-full mt-2 px-4 py-3 rounded-lg bg-[#0F0820] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition font-semibold text-lg shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? "Creating..." : "Create Account →"}
                            </button>
                        </form>

                        <p className="text-gray-400 text-sm mt-6 text-center">
                            Already have an account?{" "}
                            <span onClick={() => navigate("/login")} className="text-purple-400 hover:underline cursor-pointer">
                                Log in
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Register