import { Link } from 'react-router-dom'
import { MapPin, Zap, Shield, Users, Download, ChevronRight, Phone, MessageCircle } from 'lucide-react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

const STEPS_CUSTOMER = [
  { step: '1', title: 'Choose Your Location', desc: 'Select your county, constituency and area from the app' },
  { step: '2', title: 'Browse Riders', desc: 'See available riders near you with their working hours' },
  { step: '3', title: 'Contact Directly', desc: 'Call or WhatsApp your rider instantly — no middleman' },
]

const STEPS_RIDER = [
  { step: '1', title: 'Sign Up ', desc: 'Create your account on this site in minutes' },
  { step: '2', title: 'Complete Your Profile', desc: 'Add your details, photo and ID for verification' },
  { step: '3', title: 'Pay Subscription', desc: 'We do not charge riders by commission only a monthly fee of ksh 100' },
  { step: '4', title: 'Get Customers', desc: 'Once approved, customers in your area will find you' },
]

const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Find a rider in seconds, not minutes' },
  { icon: Shield, title: 'Verified Riders', desc: 'Every rider is ID-verified before listing' },
  { icon: Users, title: 'Community Driven', desc: 'Supporting local boda boda riders across Kenya' },
  { icon: MapPin, title: 'Nationwide', desc: 'Available across multiple counties in Kenya' },
]

const APK_DOWNLOAD_LINK = import.meta.env.VITE_APK_DOWNLOAD_LINK // Replace with your actual APK download link

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-32 pb-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full px-4 py-2 text-sm text-gray-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Now available across Kenya
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Get a Ride
          <span className="text-[#FF5500]"> Instantly</span>
          <br />
          Anywhere in Kenya
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          BodaGo connects you with trusted local motorbike riders for transport
          and deliveries. No complicated booking — just find and call.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={APK_DOWNLOAD_LINK}
            className="flex items-center gap-3 bg-[#FF5500] hover:bg-[#E04A00] transition-colors px-8 py-4 rounded-xl font-bold text-lg"
          >
            <Download size={22} />
            Download App (APK)
          </a>
          <Link
            to="/signup"
            className="flex items-center gap-3 bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#2A2A2A] transition-colors px-8 py-4 rounded-xl font-bold text-lg"
          >
            Join as a Rider
            <ChevronRight size={20} />
          </Link>
        </div>

        <p className="text-gray-600 text-md mt-4">
          Google Play version coming soon
        </p>
      </section>

      {/* Stats */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '50+', label: 'Active Riders' },
            { value: '5', label: 'Counties' },
            { value: '100%', label: 'Free for Customers' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 text-center">
              <p className="text-3xl font-extrabold text-[#00D4FF]">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why BodaGo?</h2>
        <p className="text-gray-400 text-center mb-12">Built for Kenyans, by Kenyans</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#FF5500] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#2A2A2A] flex items-center justify-center mb-4">
                <Icon size={22} className="text-[#FF5500]" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works - Customers */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#FF5500] font-semibold text-sm uppercase tracking-wider">For Customers</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS_CUSTOMER.map((item, index, arr) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#FF5500] flex items-center justify-center text-xl font-extrabold mb-4 z-10">
                {item.step}
              </div>
              {index < arr.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-full h-[2px] bg-[#2A2A2A]" />
              )}
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Download CTA */}
          <div className="mt-12 bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-xl mb-1">Ready to find a rider?</h3>
            <p className="text-gray-400 text-sm">Download the BodaGo app and get moving</p>
          </div>
          <a
            href={APK_DOWNLOAD_LINK}
            className="flex items-center gap-3 bg-[#FF5500] hover:bg-[#E04A00] transition-colors px-6 py-3 rounded-xl font-bold whitespace-nowrap"
          >
            <Download size={18} />
            Download APK
          </a>
        </div>
      </section>

      {/* How it works - Riders */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#00D4FF] font-semibold text-sm uppercase tracking-wider">For Riders</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Join as a Rider</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS_RIDER.map((item, index, arr) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#1E1E1E] border-2 border-[#00D4FF] flex items-center justify-center text-xl font-extrabold text-[#00D4FF] mb-4 z-10">
                {item.step}
              </div>
              {index < arr.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-full h-[2px] bg-[#2A2A2A]" />
              )}
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Rider CTA */}
        <div className="mt-12 bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-xl mb-1">Are you a boda boda rider?</h3>
            <p className="text-gray-400 text-sm">Join BodaGo free and start getting customers today</p>
          </div>
          <Link
            to="/signup"
            className="flex items-center gap-3 bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#00D4FF] text-[#00D4FF] transition-colors px-6 py-3 rounded-xl font-bold whitespace-nowrap"
          >
            Sign Up
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-3">Need Help?</h2>
          <p className="text-gray-400 mb-8">Reach us directly via call or WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+254700000000"
              className="flex items-center justify-center gap-3 bg-[#2A2A2A] hover:bg-[#333] transition-colors px-6 py-3 rounded-xl font-semibold"
            >
              <Phone size={18} className="text-[#FF5500]" />
              Call Us
            </a>
            <a
              href="https://wa.me/254700500431"
              className="flex items-center justify-center gap-3 bg-[#128C7E] hover:bg-[#0e7268] transition-colors px-6 py-3 rounded-xl font-semibold"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}