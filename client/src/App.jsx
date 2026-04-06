import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CreateProblem from './pages/CreateProblem'
import AdminProblemDashboard from './pages/AdminProblemDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ProblemsPage from './pages/ProblemsPage'
import ProblemSolvePage from './pages/ProblemSolvePage'
import ViewProblem from './pages/ViewProblem'

/* ── Admin panel ── */
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSubmissions from './pages/admin/AdminSubmissions'
import UserLayout from './pages/user/UserLayout'
import UserDashboard from './pages/user/UserDashboard'
import UserSubmissions from './pages/user/UserSubmissions'
import UserProfile from './pages/user/UserProfile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* ── Public problem routes ── */}
        <Route path="/problems"
          element={<ProtectedRoute>
            <ProblemsPage />
          </ProtectedRoute>}
        />
        <Route path="/problems/:id"
          element={<ProtectedRoute>
            <ProblemSolvePage />
          </ProtectedRoute>}
        />

        {/* ═══ ADMIN PANEL (nested routes under sidebar layout) ═══ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="problems" element={<AdminProblemDashboard />} />
          <Route path="create-problem" element={<CreateProblem />} />
          <Route path="problem/:id" element={<ViewProblem />} />
          <Route path="submissions" element={<AdminSubmissions />} />
        </Route>

        {/* ═══ USER DASHBOARD ═══ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="problems" element={<UserSubmissions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App