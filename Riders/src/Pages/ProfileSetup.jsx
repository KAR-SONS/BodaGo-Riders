import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, MapPin, Clock, Upload, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const WORKING_HOURS = [
  '5am - 10pm',
  '6am - 9pm',
  '6am - 10pm',
  '7am - 8pm',
  '8am - 6pm',
  '24 Hours',
  'Custom',
]

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Location
  const [counties, setCounties] = useState([])
  const [constituencies, setConstituencies] = useState([])
  const [areas, setAreas] = useState([])

  // Form
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    county_id: '',
    constituency_id: '',
    area_id: '',
    service_type: [],
    working_hours: '',
    custom_hours: '',
  })

  // Files
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [idFront, setIdFront] = useState(null)
  const [idFrontPreview, setIdFrontPreview] = useState(null)
  const [idBack, setIdBack] = useState(null)
  const [idBackPreview, setIdBackPreview] = useState(null)

  useEffect(() => {
    if (!user) navigate('/signup')
    fetchCounties()
  }, [user])

  useEffect(() => {
    if (form.county_id) fetchConstituencies(form.county_id)
  }, [form.county_id])

  useEffect(() => {
    if (form.constituency_id) fetchAreas(form.constituency_id)
  }, [form.constituency_id])

  async function fetchCounties() {
    const { data } = await supabase.from('counties').select('*').order('name')
    if (data) setCounties(data)
  }

  async function fetchConstituencies(countyId) {
    const { data } = await supabase
      .from('constituencies')
      .select('*')
      .eq('county_id', countyId)
      .order('name')
    if (data) setConstituencies(data)
  }

  async function fetchAreas(constituencyId) {
    const { data } = await supabase
      .from('areas')
      .select('*')
      .eq('constituency_id', constituencyId)
      .order('name')
    if (data) setAreas(data)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setError('')

    // Reset downstream selections
    if (name === 'county_id') {
      setForm(prev => ({ ...prev, county_id: value, constituency_id: '', area_id: '' }))
      setConstituencies([])
      setAreas([])
    }
    if (name === 'constituency_id') {
      setForm(prev => ({ ...prev, constituency_id: value, area_id: '' }))
      setAreas([])
    }
  }

  function toggleService(service) {
    setForm(prev => ({
      ...prev,
      service_type: prev.service_type.includes(service)
        ? prev.service_type.filter(s => s !== service)
        : [...prev.service_type, service]
    }))
  }

  function handleFile(e, type) {
    const file = e.target.files[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (type === 'photo') { setPhoto(file); setPhotoPreview(preview) }
    if (type === 'idFront') { setIdFront(file); setIdFrontPreview(preview) }
    if (type === 'idBack') { setIdBack(file); setIdBackPreview(preview) }
  }

  async function uploadFile(file, bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  // Step 1 validation
  function validateStep1() {
    if (!form.name.trim()) return setError('Please enter your full name')
    if (!form.phone.trim()) return setError('Please enter your phone number')
    if (!form.whatsapp.trim()) return setError('Please enter your WhatsApp number')
    if (form.service_type.length === 0) return setError('Please select at least one service')
    if (!form.working_hours) return setError('Please select your working hours')
    setError('')
    setStep(2)
  }

  // Step 2 validation
  function validateStep2() {
    if (!form.county_id) return setError('Please select your county')
    if (!form.constituency_id) return setError('Please select your constituency')
    if (!form.area_id) return setError('Please select your area')
    setError('')
    setStep(3)
  }

  async function handleSubmit() {
    if (!photo) return setError('Please upload your profile photo')
    if (!idFront) return setError('Please upload the front of your ID')
    if (!idBack) return setError('Please upload the back of your ID')

    setLoading(true)
    setError('')

    try {
      const userId = user.id
      const timestamp = Date.now()

      const photoUrl = await uploadFile(photo, 'rider-photos', `${userId}/photo_${timestamp}`)
      const idFrontUrl = await uploadFile(idFront, 'rider-ids', `${userId}/id_front_${timestamp}`)
      const idBackUrl = await uploadFile(idBack, 'rider-ids', `${userId}/id_back_${timestamp}`)

      const finalHours = form.working_hours === 'Custom' ? form.custom_hours : form.working_hours

      const { error } = await supabase.from('riders_approval').insert({
        email: user.email,
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp.startsWith('0')
          ? '254' + form.whatsapp.slice(1)
          : form.whatsapp,
        area_id: parseInt(form.area_id),
        service_type: form.service_type,
        working_hours: finalHours,
        photo_url: photoUrl,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        status: 'pending',
      })

      if (error) throw error
      setSuccess(true)

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-white">Application Submitted!</h1>
          <p className="text-gray-400 leading-relaxed mb-8">
            Your profile is under review. We'll verify your ID and approve your account within 24 hours. You'll be able to log in and start getting customers once approved.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#E04A00] transition-colors px-6 py-3 rounded-xl font-bold"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] px-6 py-20">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 rounded-full bg-[#FF5500] flex items-center justify-center font-extrabold text-xl mx-auto mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-white">Set Up Your Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Step {step} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#FF5500]' : 'bg-[#2A2A2A]'}`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 space-y-5">
            <h2 className="font-bold text-lg mb-2 text-white">Personal Information</h2>

            {/* Name */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Full Name</label>
              <div className="relative">
                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Kamau"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Phone Number</label>
              <div className="relative">
                <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0712345678"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">WhatsApp Number</label>
              <div className="relative">
                <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="0712345678"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">Enter in 07XX format — we'll convert it automatically</p>
            </div>

            {/* Service Type */}
            <div>
              <label className="text-sm text-gray-400 mb-3 block">Service Type</label>
              <div className="flex gap-3">
                {['transport', 'delivery'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-sm capitalize transition-colors ${
                      form.service_type.includes(s)
                        ? 'bg-[#FF5500] border-[#FF5500] text-white'
                        : 'bg-[#2A2A2A] border-[#3A3A3A] text-gray-400 hover:border-[#FF5500]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Working Hours</label>
              <div className="relative">
                <Clock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  name="working_hours"
                  value={form.working_hours}
                  onChange={handleChange}
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-[#FF5500] transition-colors appearance-none"
                >
                  <option value="" disabled>Select your hours</option>
                  {WORKING_HOURS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom hours input */}
            {form.working_hours === 'Custom' && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Specify Hours</label>
                <input
                  type="text"
                  name="custom_hours"
                  value={form.custom_hours}
                  onChange={handleChange}
                  placeholder="e.g. 9am - 5pm"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                />
              </div>
            )}

            <button
              type="button"
              onClick={validateStep1}
              className="w-full flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#E04A00] transition-colors py-3 rounded-xl font-bold text-lg mt-2"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 space-y-5">
            <h2 className="font-bold text-lg mb-2 text-white">Your Location</h2>

            {/* County */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">County</label>
              <div className="relative">
                <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  name="county_id"
                  value={form.county_id}
                  onChange={handleChange}
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-[#FF5500] transition-colors appearance-none"
                >
                  <option value="" disabled>Select county</option>
                  {counties.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Constituency */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Constituency</label>
              <div className="relative">
                <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  name="constituency_id"
                  value={form.constituency_id}
                  onChange={handleChange}
                  disabled={!form.county_id}
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-[#FF5500] transition-colors appearance-none disabled:opacity-40"
                >
                  <option value="" disabled>Select constituency</option>
                  {constituencies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Area / Stage</label>
              <div className="relative">
                <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  name="area_id"
                  value={form.area_id}
                  onChange={handleChange}
                  disabled={!form.constituency_id}
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-[#FF5500] transition-colors appearance-none disabled:opacity-40"
                >
                  <option value="" disabled>Select area</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-[#3A3A3A] text-gray-400 hover:border-white hover:text-white transition-colors font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={validateStep2}
                className="flex-2 w-full flex items-center justify-center gap-3 bg-[#FF5500] hover:bg-[#E04A00] transition-colors py-3 rounded-xl font-bold"
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Photos & ID */}
        {step === 3 && (
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="font-bold text-lg text-white">Photos & ID Verification</h2>
              <p className="text-gray-400 text-sm mt-1">Your ID is kept private and only used for verification</p>
            </div>

            {/* Profile Photo */}
            <div>
              <label className="text-sm text-gray-400 mb-3 block">Profile Photo</label>
              <label className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${photoPreview ? 'border-[#FF5500]' : 'border-[#3A3A3A] hover:border-[#FF5500]'}`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto" />
                  ) : (
                    <>
                      <Upload size={28} className="text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Tap to upload photo</p>
                      <p className="text-gray-600 text-xs mt-1">JPG or PNG</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'photo')} />
              </label>
            </div>

            {/* ID Front */}
            <div>
              <label className="text-sm text-gray-400 mb-3 block">National ID — Front</label>
              <label className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${idFrontPreview ? 'border-[#FF5500]' : 'border-[#3A3A3A] hover:border-[#FF5500]'}`}>
                  {idFrontPreview ? (
                    <img src={idFrontPreview} alt="ID Front" className="h-32 object-contain mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload size={28} className="text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Tap to upload front of ID</p>
                      <p className="text-gray-600 text-xs mt-1">JPG or PNG</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'idFront')} />
              </label>
            </div>

            {/* ID Back */}
            <div>
              <label className="text-sm text-gray-400 mb-3 block">National ID — Back</label>
              <label className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${idBackPreview ? 'border-[#FF5500]' : 'border-[#3A3A3A] hover:border-[#FF5500]'}`}>
                  {idBackPreview ? (
                    <img src={idBackPreview} alt="ID Back" className="h-32 object-contain mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload size={28} className="text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Tap to upload back of ID</p>
                      <p className="text-gray-600 text-xs mt-1">JPG or PNG</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'idBack')} />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl border border-[#3A3A3A] text-gray-400 hover:border-white hover:text-white transition-colors font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-xl font-bold"
              >
                {loading ? 'Submitting...' : 'Submit'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}