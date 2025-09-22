import React, { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from './assets/Logo.png'

const Navbar = memo(() => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-white/90 shadow backdrop-blur-lg">
      <nav className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={logo} alt="CampusFind" className="w-10 h-10 object-contain" />
          <span className="text-3xl font-extrabold text-[#15735b] tracking-tight">CampusFind</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/dashboard"
            className="px-5 py-2 rounded-lg font-semibold bg-[#15735b] text-white shadow hover:bg-[#125e4b] transition-colors"
          >
            Get Started
          </Link>
          <button
            className="px-5 py-2 rounded-lg font-semibold bg-white text-[#15735b] border border-[#15735b] shadow hover:bg-[#e6f3ef] transition-colors"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="px-5 py-2 rounded-lg font-semibold bg-[#e6f3ef] text-[#15735b] border border-[#15735b] shadow hover:bg-[#d9eee7] transition-colors"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </nav>
    </header>
  )
})

export default Navbar