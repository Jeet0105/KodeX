import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CreateProblem from './pages/CreateProblem'
import AdminProblemDashboard from './pages/AdminProblemDashboard'
import ViewProblem from './pages/ViewProblem'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path='/admin/create-problem' element={<CreateProblem />} />
          <Route path='/admin' element={<AdminProblemDashboard />} />
          <Route path="/admin/problem/:id" element={<ViewProblem />} />
        </Routes>
      </BrowserRouter>
    </>
  ) 
}

export default App
