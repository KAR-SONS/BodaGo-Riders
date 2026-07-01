import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, XCircle, Clock, LogOut,
  User, Phone, MapPin, Eye, X, ChevronDown
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const STATUS_FILTERS = ['pending', 'approved', 'rejected']

export default function AdminPanel() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null)
  const [actioning, setActioning] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [filter])

  async function fetchApplications() {
    setLoading(true)
    const { data, error } = await supabase
        .from('riders_approval')
        .select('*, areas(name, constituency_id, constituencies(name, county_id, counties(name)))')
        .eq('status', filter)
        .order('created_at', { ascending: false })

    if (!error && data) {
        // Generate signed URLs for each application's ID photos
        const withSignedUrls = await Promise.all(
        data.map(async (app) => ({
            ...app,
            id_front_signed: await getSignedUrl(app.id_front_url),
            id_back_signed: await getSignedUrl(app.id_back_url),
        }))
        )
        setApplications(withSignedUrls)
    }
    setLoading(false)
    }

  async function handleApprove(application) {
    setActioning(true)
    setActionError('')

    try {
      // 1. Copy to riders table
      const { error: insertError } = await supabase
        .from('riders')
        .insert({
          name: application.name,
          phone: application.phone,
          whatsapp: application.whatsapp,
          email: application.email,
          area_id: application.area_id,
          area: application.areas?.name || '',
          service_type: application.service_type,
          working_hours: application.working_hours,
          photo_url: application.photo_url,
          is_available: true,
          status: 'approved',
        })

      if (insertError) throw insertError

      // 2. Update status in riders_approval
      const { error: updateError } = await supabase
        .from('riders_approval')
        .update({ status: 'approved' })
        .eq('id', application.id)

      if (updateError) throw updateError

      // Refresh list and close modal
      await fetchApplications()
      setSelected(null)

    } catch (err) {
      setActionError(err.message || 'Something went wrong')
    } finally {
      setActioning(false)
    }
  }

  async function handleReject(application) {
    setActioning(true)
    setActionError('')

    try {
      const { error } = await supabase
        .from('riders_approval')
        .update({ status: 'rejected' })
        .eq('id', application.id)

      if (error) throw error

      await fetchApplications()
      setSelected(null)

    } catch (err) {
      setActionError(err.message || 'Something went wrong')
    } finally {
      setActioning(false)
    }
  }

  function handleSignOut() {
    sessionStorage.removeItem('bodago_admin')
    navigate('/admin')
  }

  const statusColor = {
    pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    approved: 'text-green-400 bg-green-500/10 border-green-500/30',
    rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
  }

  const statusIcon = {
    pending: <Clock size={13} />,
    approved: <CheckCircle size={13} />,
    rejected: <XCircle size={13} />,
  }

  async function getSignedUrl(path) {
    if (!path) return null
    
    // Extract just the file path from the full URL
    const parts = path.split('/rider-ids/')
    if (parts.length < 2) return path
    
    const filePath = parts[1]
    
    const { data, error } = await supabase.storage
        .from('rider-ids')
        .createSignedUrl(filePath, 3600) // expires in 1 hour

    if (error || !data) return null
    return data.signedUrl
    }

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-[#FF5500] flex items-center justify-center font-extrabold">
                B
              </div>
              <span className="font-bold text-xl text-white">BodaGo Admin</span>
            </div>
            <p className="text-gray-400 text-sm">Rider approval panel</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-xl font-semibold text-sm capitalize transition-colors border ${
                filter === s
                  ? statusColor[s]
                  : 'bg-[#1E1E1E] border-[#2A2A2A] text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <User size={48} className="mx-auto mb-4 opacity-30" />
            <p>No {filter} applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div
                key={app.id}
                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-4">
                  {app.photo_url ? (
                    <img
                      src={app.photo_url}
                      alt={app.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#2A2A2A]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#FF5500] flex items-center justify-center font-bold text-lg">
                      {app.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-lg text-white">{app.name}</p>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <MapPin size={12} />
                      <span>
                        {app.areas?.constituencies?.counties?.name} →{' '}
                        {app.areas?.constituencies?.name} →{' '}
                        {app.areas?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                      <Phone size={12} />
                      <span>{app.phone}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold mt-2 capitalize ${statusColor[app.status]}`}>
                      {statusIcon[app.status]}
                      {app.status}
                    </div>
                  </div>
                </div>

                {/* View Button */}
                <button
                  onClick={() => { setSelected(app); setActionError('') }}
                  className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#333] transition-colors px-4 py-2 rounded-xl text-sm font-semibold shrink-0 text-white"
                >
                  <Eye size={15} />
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1E1E1E]">
              <h2 className="font-bold text-lg text-white">Review Application</h2>
              <button onClick={() => setSelected(null)}>
                <X size={22} className="text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                {selected.photo_url ? (
                  <img
                    src={selected.photo_url}
                    alt={selected.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#FF5500]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#FF5500] flex items-center justify-center text-2xl font-bold">
                    {selected.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-xl text-white">{selected.name}</p>
                  <p className="text-gray-400 text-sm">{selected.email}</p>
                  <div className="flex gap-2 mt-2">
                    {selected.service_type?.map(s => (
                      <span key={s} className="bg-[#2A2A2A] text-gray-400 text-xs px-3 py-1 rounded-full capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-[#2A2A2A] rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-medium text-white">{selected.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WhatsApp</span>
                  <span className="font-medium text-white">+{selected.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Working Hours</span>
                  <span className="font-medium text-white">{selected.working_hours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">County</span>
                  <span className="font-medium text-white">{selected.areas?.constituencies?.counties?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Constituency</span>
                  <span className="font-medium text-white">{selected.areas?.constituencies?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Area</span>
                  <span className="font-medium text-white">{selected.areas?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Applied</span>
                  <span className="font-medium text-white">
                    {new Date(selected.created_at).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* ID Photos */}
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-3">Government ID</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500 text-xs mb-2">Front</p>
                    {selected.id_front_signed ? (
                      <a href={selected.id_front_signed} target="_blank" rel="noreferrer">
                        <img
                          src={selected.id_front_signed}
                          alt="ID Front"
                          className="w-full h-32 object-cover rounded-xl border border-[#2A2A2A] hover:border-[#FF5500] transition-colors"
                        />
                      </a>
                    ) : (
                      <div className="w-full h-32 bg-[#2A2A2A] rounded-xl flex items-center justify-center text-gray-600 text-xs">
                        Not uploaded
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-2">Back</p>
                    {selected.id_back_signed ? (
                      <a href={selected.id_back_signed} target="_blank" rel="noreferrer">
                        <img
                          src={selected.id_back_signed}
                          alt="ID Back"
                          className="w-full h-32 object-cover rounded-xl border border-[#2A2A2A] hover:border-[#FF5500] transition-colors"
                        />
                      </a>
                    ) : (
                      <div className="w-full h-32 bg-[#2A2A2A] rounded-xl flex items-center justify-center text-gray-600 text-xs">
                        Not uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {actionError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                  {actionError}
                </div>
              )}

              {/* Action Buttons — only for pending */}
              {selected.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(selected)}
                    disabled={actioning}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors py-3 rounded-xl font-bold disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selected)}
                    disabled={actioning}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 transition-colors py-3 rounded-xl font-bold disabled:opacity-50"
                  >
                    {actioning ? (
                      <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              )}

              {selected.status !== 'pending' && (
                <div className={`text-center py-3 rounded-xl border font-semibold capitalize ${statusColor[selected.status]}`}>
                  This application has been {selected.status}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}