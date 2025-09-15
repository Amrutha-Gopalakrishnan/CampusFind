import React from 'react'

export default function Footer() {
  return (
    <footer className='mt-16 border-t'>
      <div className='max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600'>
        <div>
          © {new Date().getFullYear()} CampusFind. All rights reserved.
        </div>
        <div className='flex gap-4'>
          <a href='/home' className='hover:text-[#15735b]'>Home</a>
          <a href='/dashboard' className='hover:text-[#15735b]'>Dashboard</a>
          <a href='mailto:support@campusfind.ac.in' className='hover:text-[#15735b]'>Support</a>
        </div>
      </div>
    </footer>
  )
}

