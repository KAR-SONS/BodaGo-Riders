import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-md border-b border-[#2A2A2A]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FF5500] flex items-center justify-center font-extrabold text-lg">
            B
          </div>
          <span className="font-bold text-xl">BodaGo</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/signup"
            className="text-gray-400 hover:text-white transition-colors font-medium hidden sm:block"
          >
            Rider Signup
          </Link>
          <a
          
            href="YOUR_APK_DOWNLOAD_LINK"
            className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#E04A00] transition-colors px-4 py-2 rounded-xl font-semibold text-sm"
          >
            <Download size={16} />
            Get App
          </a>
        </div>
      </div>
    </nav>
  )
}