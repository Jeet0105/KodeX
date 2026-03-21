import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CreateProblem from './pages/CreateProblem'
import AdminProblemDashboard from './pages/AdminProblemDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ProblemsPage from './pages/ProblemsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/problems"
          element={
            <ProtectedRoute adminOnly>
              <AdminProblemDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-problem"
          element={
            <ProtectedRoute adminOnly>
              <CreateProblem />
            </ProtectedRoute>
          }
        />
        <Route path="/problems"
          element={<ProtectedRoute>
            <ProblemsPage />
          </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App