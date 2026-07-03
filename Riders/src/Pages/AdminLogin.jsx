import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('bodago_admin', 'true')
      navigate('/admin/panel')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-[#FF5500] flex items-center justify-center font-extrabold text-xl mx-auto mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 text-sm mt-1">BodaGo rider approval panel</p>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Admin Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter admin password"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#E04A00] transition-colors py-3 rounded-xl font-bold"
            >
              Access Panel
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}