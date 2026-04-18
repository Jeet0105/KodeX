import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
  } = useForm();

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: isSubmittingOtp },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm();

  const onEmailSubmit = async (data) => {
    try {
      const res = await api.post("/api/v1/auth/forgot-password", data);
      toast.success(res.data.message || "OTP sent to your email");
      setEmail(data.email);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const onOtpSubmit = async (data) => {
    try {
      const res = await api.post("/api/v1/auth/verify-otp", {
        email,
        otp: data.otp,
      });
      toast.success(res.data.message || "OTP verified");
      setOtp(data.otp);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      const res = await api.post("/api/v1/auth/reset-password", {
        email,
        otp,
        newPassword: data.newPassword,
      });
      toast.success(res.data.message || "Password reset successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0617] text-white">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1A0F2E] to-[#0B0617] p-16 flex-col justify-center">
        <div className="flex items-center gap-1 mb-12">
          <img src="/logo.png" alt="KodeX Logo" className="w-8 h-8 object-contain" />
          <span className="text-2xl font-bold tracking-wide">
            Kode<span className="text-purple-500 text-3xl font-extrabold">X</span>
          </span>
        </div>
        <h2 className="text-5xl font-bold leading-tight">
          Recover your <span className="text-purple-500">access.</span>
        </h2>
        <p className="text-gray-400 mt-6 text-lg">
          Securely reset your password and get back to your code.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-2">Forgot Password</h2>

          {step === 1 && (
            <>
              <p className="text-gray-400 mb-8">
                Enter your email address to receive a 6-digit OTP. It will expire in 2 minutes.
              </p>
              <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400">Email Address</label>
                  <input
                    type="email"
                    {...registerEmail("email", { required: "Email is required" })}
                    placeholder="john@example.com"
                    className="w-full mt-2 px-4 py-3 rounded-lg bg-[#140A2A] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                  />
                  {emailErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{emailErrors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingEmail}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition font-semibold text-lg shadow-lg disabled:opacity-50"
                >
                  {isSubmittingEmail ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-gray-400 mb-8">
                We've sent a 6-digit OTP to <span className="text-purple-400">{email}</span>.
              </p>
              <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400">Enter OTP</label>
                  <input
                    type="text"
                    {...registerOtp("otp", { 
                      required: "OTP is required",
                      minLength: { value: 6, message: "OTP must be 6 digits" },
                      maxLength: { value: 6, message: "OTP must be 6 digits" }
                    })}
                    placeholder="123456"
                    className="w-full mt-2 px-4 py-3 rounded-lg bg-[#140A2A] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-center tracking-[1em] font-mono text-xl"
                  />
                  {otpErrors.otp && (
                    <p className="text-red-400 text-sm mt-1">{otpErrors.otp.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingOtp}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition font-semibold text-lg shadow-lg disabled:opacity-50"
                >
                  {isSubmittingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-gray-400 mb-8">Enter your new secure password.</p>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400">New Password</label>
                  <input
                    type="password"
                    {...registerPassword("newPassword", { 
                      required: "Password is required",
                      minLength: { value: 8, message: "Must be at least 8 characters" }
                    })}
                    placeholder="••••••••"
                    className="w-full mt-2 px-4 py-3 rounded-lg bg-[#140A2A] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-400 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400">Confirm Password</label>
                  <input
                    type="password"
                    {...registerPassword("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: val => {
                        if (watch('newPassword') != val) {
                          return "Your passwords do no match";
                        }
                      }
                    })}
                    placeholder="••••••••"
                    className="w-full mt-2 px-4 py-3 rounded-lg bg-[#140A2A] border border-purple-700/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition font-semibold text-lg shadow-lg disabled:opacity-50"
                >
                  {isSubmittingPassword ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
          <div className="mt-6 text-center">
             <button onClick={() => navigate("/login")} className="text-gray-400 hover:text-white transition text-sm">
                ← Back to Login
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
