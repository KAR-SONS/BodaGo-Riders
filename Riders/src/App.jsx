import React from 'react'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Home from './Pages/Home'
import Signup from './Pages/Signup'
import ProfileSetup from './Pages/ProfileSetup'
import Dashboard from './Pages/Dashboard'
import { AuthProvider } from './context/AuthContext'
import Login from './Pages/Login'

const App = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/setup' element={<ProfileSetup />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App