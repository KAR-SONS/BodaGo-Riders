import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      return setError('Please fill in all fields')
    }

    setLoading(true)
    const { error } = await signIn(form.email, form.password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">

        <Link to="/" className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 rounded-full bg-[#FF5500] flex items-center justify-center font-extrabold text-xl">
            B
          </div>
          <span className="font-bold text-2xl">BodaGo</span>
        </Link>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your rider account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#E04A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-xl font-bold text-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#FF5500] hover:underline font-medium">
            Sign up free
          </Link>
        </p>

      </div>
    </div>
  )
}