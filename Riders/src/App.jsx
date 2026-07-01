import React from 'react'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Home from './Pages/Home'
import Signup from './Pages/Signup'
import ProfileSetup from './Pages/ProfileSetup'
import Dashboard from './Pages/Dashboard'
import { AuthProvider,useAuth } from './context/AuthContext'
import Login from './Pages/Login'
import AdminLogin from './Pages/AdminLogin'
import AdminPanel from './Pages/AdminPanel'

const App = () => {
  function ProtectedRoute({ children }) {
    const { user } = useAuth()
    return user ? children : <Navigate to="/login" />
  }

  function AdminRoute({ children }) {
    const isAdmin = sessionStorage.getItem('bodago_admin') === 'true'
    return isAdmin ? children : <Navigate to="/admin" />
  }
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/login' element={<Login/>}/>
        <Route path="/setup" element={
            <ProtectedRoute><ProfileSetup /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
        
        <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={
            <AdminRoute><AdminPanel /></AdminRoute>
          } />
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App