import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import logo from './assets/logo.png'

const Navbar = memo(() => {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className='max-w-6xl mx-auto px-4 py-2.5 flex gap-3 justify-between items-center'>
        <div className='flex items-center gap-3'>
          <img src={logo} alt="CampusFind" className='w-30 h-30 md:w-30 md:h-30 object-contain shrink-0' />
          <h1 className='text-2xl md:text-3xl text-[#15735b] font-bold leading-none'>CampusFind</h1>
        </div>

          
          <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/dashboard"
            className="btn flex bg-[#e6f3ef] text-[#15735b] px-4 py-2 font-semibold border border-transparent rounded-md hover:bg-[#15735b] hover:text-white transition-colors"
          >
            Get Started
          </Link>
           
            <button className='btn flex bg-[#e6f3ef] px-4 py-2  text-[#15735b] font-semibold border border-transparent rounded-md hover:bg-[#15735b] hover:text-white transition-colors'>Login</button>
   
            <button className='btn flex bg-[#e6f3ef] px-4 py-2  text-[#15735b] font-semibold border border-transparent rounded-md hover:bg-[#15735b] hover:text-white transition-colors'>SignUp</button>
   
        </div>
      </nav>
    </div>
  )
})

export default Navbar