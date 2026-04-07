import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useState } from "react"
import { clearUser } from "../../redux/userSlice"
import api from "../../utils/api"
import { toast } from "react-toastify"
import {
  FiGrid,
  FiFileText,
  FiAward,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiBell,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiLogOut,
  FiZap,
  FiUser,
} from "react-icons/fi"

const sidebarLinks = [
  { to: "/dashboard",        icon: FiGrid,          label: "Dashboard", end: true },
  { to: "/dashboard/problems", icon: FiFileText,      label: "Problems" },
  { to: "/dashboard/profile",  icon: FiUser,          label: "Profile" },
  { to: "/discussions",      icon: FiMessageSquare, label: "Discussions" },
  { to: "/dashboard/leaderboard", icon: FiBarChart2,     label: "Leaderboard" },
]

export default function UserLayout() {
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout")
      dispatch(clearUser())
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      console.error("Logout Error:", error)
      toast.error("Logout failed. Please try again.")
      // Even if API fails, we often want to clear user state and redirect
      dispatch(clearUser())
      navigate("/login")
    }
  }

  return (
    <div className="flex h-screen bg-[#0B0617] text-white overflow-hidden font-inter">

      {/* ═══ MOBILE OVERLAY ═══ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[80px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "rgba(11,6,23,0.98)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-white/[0.06]">
          {(!collapsed || mobileOpen) ? (
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => navigate("/")}
            >
              <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span className="font-bold text-xl text-white tracking-tight whitespace-nowrap">
                Kode<span className="text-violet-500">X</span>
              </span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.05]"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {sidebarLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600/15 text-violet-400 shadow-sm shadow-violet-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                } ${collapsed && !mobileOpen ? "justify-center px-0" : ""}`
              }
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    collapsed && !mobileOpen ? "w-10 h-10" : ""
                }`}
              >
                <Icon size={20} />
              </div>
              {(!collapsed || mobileOpen) && <span>{label}</span>}
              {(!collapsed || mobileOpen) && false && ( // Placeholder for active indicator
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shadow-glow shadow-violet-500/50" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-1">
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed && !mobileOpen ? "justify-center px-0" : ""}`}
            >
              <FiLogOut size={20} />
              {(!collapsed || mobileOpen) && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className="hidden lg:block border-t border-white/[0.06] p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all text-sm group"
          >
            <FiChevronLeft
              size={18}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
        {/* Top bar */}
        <header className="flex items-center justify-between h-20 px-6 border-b border-white/[0.06] bg-[#0B0617]/8 backdrop-blur-xl z-30 sticky top-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.05]"
            >
                <FiMenu size={22} />
            </button>
            
            {/* Search */}
            <div className="relative group flex-1 hidden sm:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-violet-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search problems, topics..." 
                className="w-full h-11 pl-12 pr-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all">
              <FiBell size={22} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B0617]" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none capitalize">{user?.username || "Quest"}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                    <FiZap size={10} className="text-violet-400" />
                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-tighter">Level {Math.floor((user?.totalPoints || 0) / 10) + 1}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-black/20 ring-2 ring-white/[0.06] group cursor-pointer relative">
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-lg">
                        {user?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Outlet />
          
          {/* Footer inside main to scroll with content if needed, or stick it */}
          <footer className="p-8 border-t border-white/[0.04] mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-gray-500 font-medium">
                <p>© 2024 KodeX DSA Platform. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-white transition-colors">Help Center</a>
                    <a href="#" className="hover:text-white transition-colors">API Docs</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                </div>
            </div>
          </footer>
        </main>

        {/* Decoration effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </div>
    </div>
  )
}
