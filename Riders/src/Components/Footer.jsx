import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[#2A2A2A] px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF5500] flex items-center justify-center font-bold">
            B
          </div>
          <span className="font-bold">BodaGo</span>
        </div>

        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} BodaGo. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm text-gray-400">
          <Link to="/signup" className="hover:text-white transition-colors">Join as Rider</Link>
          <a href="https://wa.me/254700000000" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}