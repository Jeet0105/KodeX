import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { useState } from "react"
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiSend,
  FiMenu,
  FiX,
  FiChevronLeft,
} from "react-icons/fi"

const sidebarLinks = [
  { to: "/admin",             icon: FiGrid,     label: "Dashboard", end: true },
  { to: "/admin/users",       icon: FiUsers,    label: "Users" },
  { to: "/admin/problems",    icon: FiFileText,  label: "Problems" },
  { to: "/admin/submissions", icon: FiSend,     label: "Submissions" },
]

export default function AdminLayout() {
  const { user } = useSelector((state) => state.user)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-[#0B0617] text-white overflow-hidden">

      {/* ═══ MOBILE OVERLAY ═══ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "rgba(11,6,23,0.97)",
          backdropFilter: "blur(20px)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06]">
          {!collapsed && (
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap">
                Kode<span className="text-violet-500">X</span>
              </span>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center mx-auto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
          )}

          {/* Close on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Admin badge */}
        <div className={`px-4 pt-4 pb-2 ${collapsed ? "px-2" : ""}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600/10 border border-violet-500/20">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600/15 text-violet-300 shadow-sm shadow-violet-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                } ${collapsed ? "justify-center px-0" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-violet-600/20 text-violet-300"
                        : "text-gray-500 group-hover:text-gray-300 group-hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block border-t border-white/[0.06] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all text-sm cursor-pointer"
          >
            <FiChevronLeft
              size={16}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User info */}
        <div className={`border-t border-white/[0.06] p-3 ${collapsed ? "px-2" : ""}`}>
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${collapsed ? "justify-center" : ""}`}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full ring-2 ring-violet-500/30 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() ?? "A"}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-white/[0.06] bg-[#0B0617]/80 backdrop-blur-md flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/[0.04]"
          >
            <FiMenu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-gray-400">
              Welcome back,{" "}
              <span className="text-white font-semibold">{user?.username}</span>
            </h2>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.04] transition-all"
          >
            ← Back to Site
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
