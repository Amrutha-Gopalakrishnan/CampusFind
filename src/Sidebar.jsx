import { Home, Search, ClipboardList, User } from "lucide-react";
import React from 'react'
import logo from './assets/Logo.png'
export default function Sidebar({ active, onNavigate }) {
  return (
    <div className="w-60 bg-white h-screen shadow-md flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center gap-3">
          <img src={logo} alt="CampusFind" className='w-8 h-8 object-contain shrink-0' />
          <h1 className="text-lg font-semibold text-gray-800">CampusFind</h1>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <a
                href="/home"
                className={`w-full  px-6 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
                  'text-gray-700 hover:bg-[#e6f3ef]'
                }`}
              >
                <Home size={18}/> Home
              </a>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('lost')}
                className={`w-full text-left px-6 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
                  active === 'lost' ? 'text-[#15735b] bg-[#e6f3ef]' : 'text-gray-700 hover:bg-[#e6f3ef]'
                }`}
              >
                <ClipboardList size={18}/> Lost Belongings
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('found')}
                className={`w-full text-left px-6 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
                  active === 'found' ? 'text-[#15735b] bg-[#e6f3ef]' : 'text-gray-700 hover:bg-[#e6f3ef]'
                }`}
              >
                <ClipboardList size={18}/> Found Other’s Belongings
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('status')}
                className={`w-full text-left px-6 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
                  active === 'status' ? 'text-[#15735b] bg-[#e6f3ef]' : 'text-gray-700 hover:bg-[#e6f3ef]'
                }`}
              >
                <Search size={18}/> Status Enquiry
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('profile')}
                className={`w-full text-left px-6 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
                  active === 'profile' ? 'text-[#15735b] bg-[#e6f3ef]' : 'text-gray-700 hover:bg-[#e6f3ef]'
                }`}
              >
                <User size={18}/> Profile
              </button>
            </li>
          </ul>
        </nav>
      </div>

      
    </div>
  );
}
