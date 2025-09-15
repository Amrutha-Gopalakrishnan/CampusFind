import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Search, ClipboardList, Shield, CheckCircle } from 'lucide-react'

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="w-[600px] h-[600px] rounded-full bg-[#e6f3ef] blur-3xl opacity-70 absolute -top-40 -left-40" />
        <div className="w-[500px] h-[500px] rounded-full bg-[#e6f3ef] blur-3xl opacity-70 absolute -bottom-40 -right-20" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className='font-bold text-5xl md:text-6xl tracking-tight'>
            CampusFind
            <br />
            Finding Your <span className='text-[#15735b]'>Belongings</span>
          </h1>
          <p className='mt-5 text-lg md:text-xl text-gray-700'>
            A secure platform for college students to report lost items, post found belongings,
            and reclaim their possessions with ease.
          </p>

          <div className='mt-8 flex items-center justify-center gap-4'>
            <Link
              to="/home"
              className="btn inline-flex items-center gap-2 bg-[#15735b] text-white px-5 py-3 font-semibold rounded-md hover:bg-[#125e4b]"
            >
              Get Started
              <FaArrowRight />
            </Link>
            <a
              href="#how-it-works"
              className='btn inline-flex items-center gap-2 bg-[#e6f3ef] text-[#15735b] px-5 py-3 font-semibold rounded-md hover:bg-[#d9eee7]'
            >
              How it works
            </a>
          </div>
        </div>

        <div className='mt-14 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm'>
            <Search size={20} className='text-[#15735b]' />
            <span className='text-sm font-medium text-gray-700'>Search and track</span>
          </div>
          <div className='bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm'>
            <ClipboardList size={20} className='text-[#15735b]' />
            <span className='text-sm font-medium text-gray-700'>Post in minutes</span>
          </div>
          <div className='bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm'>
            <Shield size={20} className='text-[#15735b]' />
            <span className='text-sm font-medium text-gray-700'>College-only access</span>
          </div>
          <div className='bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm'>
            <CheckCircle size={20} className='text-[#15735b]' />
            <span className='text-sm font-medium text-gray-700'>Verified claims</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero;
