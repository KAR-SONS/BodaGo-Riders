import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, Phone, LogOut,
  CheckCircle, XCircle, Edit, AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [rider, setRider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [status, setStatus] = useState('') // pending | approved | rejected

  useEffect(() => {
    if (!user) return navigate('/login')
    fetchRiderData()
  }, [user])

  async function fetchRiderData() {
    setLoading(true)

    // First check riders_approval table
    const { data: approval } = await supabase
      .from('riders_approval')
      .select('*, areas(name)')
      .eq('email', user.email)
      .maybeSingle()

    if (approval) {
      setStatus(approval.status)

      // If approved, also fetch from riders table for live toggle
      if (approval.status === 'approved') {
        const { data: liveRider, error: liveError } = await supabase
          .from('riders')
          .select('*, areas(name)')
          .eq('email', user.email)
          .maybeSingle()

        if (liveRider) setRider(liveRider)
        else setRider({ ...approval, areas: null })
      }
    }

    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="font-bold text-xl mb-2 text-white">No Profile Found</h2>
          <p className="text-gray-400 text-sm mb-6">
            You haven't set up your rider profile yet.
          </p>
          <button
            onClick={() => navigate('/setup')}
            className="bg-[#FF5500] hover:bg-[#E04A00] transition-colors px-6 py-3 rounded-xl font-bold"
          >
            Set Up Profile
          </button>
        </div>
      </div>
    )
  }

  const initials = rider.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-10">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF5500] flex items-center justify-center font-extrabold">
              B
            </div>
            <span className="font-bold text-2xl text-white">BodaGo</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Status Banner */}
        {status === 'pending' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-yellow-400 font-semibold text-sm">Application Under Review</p>
              <p className="text-yellow-400/70 text-sm mt-1">
                We're verifying your ID. You'll be approved within 24 hours.
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <XCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Application Rejected</p>
              <p className="text-red-400/70 text-sm mt-1">
                Your application was not approved. Contact us on WhatsApp for more info.
              </p>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <CheckCircle size={20} className="text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-green-400 font-semibold text-sm">Account Approved</p>
              <p className="text-green-400/70 text-sm mt-1">
                You're live on BodaGo. Customers in your area can find you.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {rider.photo_url ? (
              <img
                src={rider.photo_url}
                alt={rider.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#FF5500]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#FF5500] flex items-center justify-center text-2xl font-extrabold">
                {initials}
              </div>
            )}
            <div>
              <h2 className="font-bold text-xl text-white">{rider.name}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {rider.service_type?.map(s => (
                  <span key={s} className="bg-[#2A2A2A] text-gray-400 text-sm px-3 py-1 rounded-full capitalize">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Info Rows */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center shrink-0">
                <Phone size={18} className="text-[#FF5500]" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="text-white font-medium">{rider.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center shrink-0">
                <Clock size={18} className="text-[#FF5500]" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Working Hours</p>
                <p className="text-white font-medium">{rider.working_hours}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-[#FF5500]" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Area</p>
                <p className="text-white font-medium"> {rider.areas?.name || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-white">Need help?</p>
            <p className="text-gray-400 text-xs mt-0.5">Contact BodaGo support</p>
          </div>
          <a
            href="https://wa.me/254700000000"
            className="flex items-center gap-2 bg-[#128C7E] hover:bg-[#0e7268] transition-colors px-4 py-2 rounded-xl text-sm font-semibold"
          >
            WhatsApp Us
          </a>
        </div>

      </div>
    </div>
  )
}