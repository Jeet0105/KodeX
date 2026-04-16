import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import api from "../../utils/api"
import { setUser } from "../../redux/userSlice"
import { toast } from "react-toastify"
import { FiUser, FiMail, FiZap, FiCamera, FiSave, FiX, FiCheck, FiAward, FiLock } from "react-icons/fi"

export default function UserProfile() {
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const [username, setUsername] = useState(user?.username || "")
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("username", username)
      if (avatarFile) {
        formData.append("avatarUrl", avatarFile)
      }

      const res = await api.put("/api/v1/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      dispatch(setUser(res.data.user))
      toast.success("Profile updated successfully")
      setAvatarFile(null)
      setAvatarPreview(null)
      setIsEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setUsername(user?.username || "")
    setAvatarFile(null)
    setAvatarPreview(null)
    setIsEditing(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match")
    }
    setPasswordLoading(true)
    try {
      const res = await api.put("/api/v1/users/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      })
      toast.success(res.data.message || "Password updated successfully")
      setPasswords({ current: "", new: "", confirm: "" })
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-10 font-inter">
      
      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-violet-600/10 via-transparent to-transparent p-8 md:p-10 group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden ring-4 ring-white/[0.05] shadow-2xl group/avatar transition-transform hover:scale-[1.02]">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30 border border-white/20">
                    <FiZap size={20} className="text-white" />
                </div>
            </div>

            {/* Info Section */}
            <div className="text-center md:text-left space-y-4">
                <div>
                   <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{user?.username}</h1>
                   <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <span className="text-sm font-bold text-violet-400 uppercase tracking-widest bg-violet-500/10 px-3 py-0.5 rounded-full border border-violet-500/20">
                            LEVEL {Math.floor((user?.totalPoints || 0) / 10) + 1}
                        </span>
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-tighter">
                            {user?.totalPoints} Experience Points
                        </span>
                   </div>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Email Address</span>
                        <span className="text-gray-300 font-medium">{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Decoration */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* ═══ EDIT FORM ═══ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/[0.03] text-gray-400 border border-white/[0.06]">
                    <FiUser size={20} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Account Details</h3>
            </div>
            {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white text-sm font-bold transition-all border border-white/[0.06] active:scale-95"
                >
                  Edit Profile
                </button>
            ) : (
                <div className="flex items-center gap-3">
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group"
                    >
                      <FiX size={18} className="group-hover:text-red-400 transition-colors" />
                      Discard
                    </button>
                    <button 
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center gap-2"
                    >
                      {loading ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                          <FiSave size={18} />
                      )}
                      Save Changes
                    </button>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Username field */}
            <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Username</label>
                <div className={`relative transition-all duration-300 ${isEditing ? "scale-[1.01]" : ""}`}>
                    <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? "text-violet-400" : "text-gray-600"}`} size={18} />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Username"
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white outline-none transition-all ${isEditing ? "focus:border-violet-500/50 focus:bg-white/[0.04]" : "opacity-60 cursor-not-allowed"}`}
                    />
                </div>
            </div>

            {/* Email field (readonly) */}
            <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email (Read-only)</label>
                <div className="relative opacity-60">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="email" 
                      value={user?.email}
                      disabled
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-gray-300 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Avatar File field */}
            <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Avatar Image</label>
                <div className={`relative transition-all duration-300 ${isEditing ? "scale-[1.005]" : ""}`}>
                    <FiCamera className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? "text-violet-400" : "text-gray-600"}`} size={18} />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white outline-none transition-all ${isEditing ? "focus:border-violet-500/50 focus:bg-white/[0.04]" : "opacity-60 cursor-not-allowed"}
                      file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 file:transition-colors`}
                    />
                </div>
                {isEditing && (
                    <p className="text-[10px] font-medium text-gray-500 ml-1">Upload a real file (JPG, PNG, WebP) directly to Cloudinary.</p>
                )}
            </div>
        </div>
      </section>

      {/* ═══ PASSWORD CHANGE ═══ */}
      {!user?.isGoogleUser && (
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.03] text-gray-400 border border-white/[0.06]">
                      <FiLock size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Security</h3>
              </div>
          </div>
          
          <form onSubmit={handlePasswordChange} className="p-6 md:p-8 rounded-3xl border border-white/[0.06] bg-white/[0.01] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current password */}
                <div className="space-y-3 md:col-span-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input 
                          type="password" 
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          required
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white outline-none focus:border-violet-500/50 focus:bg-white/[0.04] transition-all cursor-text"
                        />
                    </div>
                </div>

                {/* New password */}
                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input 
                          type="password" 
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          required
                          minLength={8}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white outline-none focus:border-violet-500/50 focus:bg-white/[0.04] transition-all cursor-text"
                        />
                    </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input 
                          type="password" 
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          required
                          minLength={8}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white outline-none focus:border-violet-500/50 focus:bg-white/[0.04] transition-all cursor-text"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
               <button 
                 type="submit"
                 disabled={passwordLoading}
                 className="px-6 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-bold transition-all border border-white/[0.06] active:scale-95 flex items-center gap-2 block"
                 style={{ display: "flex" }} // explicitly flex
               >
                 {passwordLoading ? (
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : (
                     <FiLock size={16} />
                 )}
                 Update Password
               </button>
            </div>
          </form>
        </section>
      )}

      {/* ═══ BADGES & ACHIEVEMENTS (Decorative) ═══ */}
      <section className="space-y-6 pt-4">
           <h3 className="text-sm font-black text-gray-700 uppercase tracking-[0.3em] text-center">Achievements</h3>
           <div className="flex flex-wrap justify-center gap-6 opacity-30 grayscale pointer-events-none">
                {[1,2,3,4].map(idx => (
                    <div key={idx} className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <FiAward size={24} className="text-gray-600" />
                    </div>
                ))}
           </div>
           <p className="text-center text-[10px] font-bold text-gray-700 uppercase tracking-widest">Locked for Season 1</p>
      </section>

    </div>
  )
}
