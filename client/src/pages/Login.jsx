import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { toast } from "react-toastify"
import api from "../utils/api"
import { useDispatch } from "react-redux"
import { setUser } from "../redux/userSlice.js"

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/api/v1/auth/login", data)

      toast.success(res.data.message || "Login successful")

      // Update Redux state
      dispatch(setUser(res.data.user))
      
      // Redirect
      navigate("/dashboard")
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed"
      toast.error(message)
    }
  }

  const handleGoogleLogin = () => {
    toast.info("Google login not implemented yet.")
  }

  return (
    <div className="min-h-screen flex bg-[#0B0617] text-white">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1A0F2E] to-[#0B0617] p-16 flex-col justify-center">

        <div className="flex items-center gap-3 mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-3 rounded-xl">
            <span className="font-bold text-xl">⌘</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">KODEX</h1>
        </div>

        <h2 className="text-5xl font-bold leading-tight">
          Master your <span className="text-purple-500">DSA</span> journey.
        </h2>

        <p className="text-gray-400 mt-6 text-lg">
          Optimized algorithms for professional performance.
          From <span className="text-purple-400">O(1)</span> to{" "}
          <span className="text-purple-400">O(n!).</span>
        </p>

        <div className="mt-12 bg-[#140A2A] border border-purple-700/30 rounded-xl p-6 font-mono text-sm text-purple-300 shadow-lg">
          <p className="text-gray-500 text-xs mb-2">
            // dynamic_programming.cpp
          </p>
          <pre>
{`int fib(int n) {
  if (memo[n] != -1) return memo[n];
  return memo[n] = fib(n-1) + fib(n-2);
}`}
          </pre>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-semibold mb-2">
            Welcome back, Coder.
          </h2>
          <p className="text-gray-400 mb-8">
            Please enter your details to sign in.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Email */}
            <div>
              <label className="text-sm text-gray-400">
                Email Address
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                })}
                placeholder="john@example.com"
                className="w-full mt-2 px-4 py-3 rounded-lg bg-[#140A2A] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-400">
                Password
              </label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-3 rounded-lg bg-[#140A2A] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
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
              {isSubmitting
                ? "Logging in..."
                : "Login to Dashboard →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow h-px bg-purple-800/30"></div>
            <span className="px-4 text-sm text-gray-400">
              OR CONTINUE WITH
            </span>
            <div className="flex-grow h-px bg-purple-800/30"></div>
          </div>

          {/* Google Only */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#140A2A] border border-purple-700/30 py-3 rounded-lg hover:bg-[#1B0F33] transition"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  )
}

export default Login