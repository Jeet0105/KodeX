import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, NavLink } from 'react-router-dom'
import { clearUser } from '../redux/userSlice'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

export default function Navbar() {
  const { user } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    await signOut(auth)       // sign out from Firebase
    dispatch(clearUser())     // clear user from Redux store
    navigate('/')             // redirect to home
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06]"
      style={{ background: "rgba(8,6,18,0.85)", backdropFilter: "blur(12px)", fontFamily: "'Syne', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');`}</style>

      <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">

        {/* Logo */}
        <div
          className="flex items-center gap-1.5 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Kode<span className="text-violet-500">X</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/problems", label: "Problems" },
            { to: "/about", label: "About" },
            { to: "/dashboard", label: "Dashboard" },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                  ? "text-white bg-white/[0.08]"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {user?.role === "admin" && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                  ? "text-violet-300 bg-violet-600/15"
                  : "text-violet-400 hover:text-violet-300 hover:bg-violet-600/10"
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2.5 cursor-pointer group px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-violet-500 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-transparent group-hover:ring-violet-400 transition-all">
                    {user.username?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                )}
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors hidden md:block">
                  {user.username}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="text-sm font-medium cursor-pointer text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-gray-400 hover:text-white text-sm font-medium cursor-pointer transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-semibold cursor-pointer transition-all px-4 py-2 rounded-lg text-white hover:opacity-90 hover:-translate-y-px"
                style={{ background: "linear-gradient(135deg, #6d28d9, #a855f7)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}
              >
                Get Started
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  )
}