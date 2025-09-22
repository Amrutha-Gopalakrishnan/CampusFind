import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Search, ClipboardList, Shield, CheckCircle } from 'lucide-react';
import logo from './assets/logo.png';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#e6f3ef] via-white to-[#f8fafc] min-h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="w-[700px] h-[700px] rounded-full bg-[#e6f3ef] blur-3xl opacity-50 absolute -top-56 -left-56" />
        <div className="w-[500px] h-[500px] rounded-full bg-[#e6f3ef] blur-3xl opacity-40 absolute -bottom-40 -right-20" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-8 py-20 flex flex-col items-center">
        <img src={logo} alt="CampusFind" className="mx-auto mb-8 w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-lg" />
        <h1 className="font-extrabold text-5xl md:text-7xl tracking-tight text-gray-900 mb-4 text-center drop-shadow-lg">
          Find & Reclaim Your <span className="text-[#15735b]">Belongings</span>
        </h1>
        <p className="mt-2 text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto text-center">
          A secure, student-friendly platform to report lost items, post found belongings, and reconnect with what matters most.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-[#15735b] text-white shadow-xl hover:bg-[#125e4b] transition-colors text-lg"
          >
            Get Started
            <FaArrowRight />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white text-[#15735b] border border-[#15735b] shadow hover:bg-[#e6f3ef] transition-colors text-lg"
          >
            How it works
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
          <div className="bg-white border rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-2xl transition-shadow">
            <Search size={36} className="text-[#15735b]" />
            <span className="text-lg font-semibold text-gray-700">Search & Track</span>
          </div>
          <div className="bg-white border rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-2xl transition-shadow">
            <ClipboardList size={36} className="text-[#15735b]" />
            <span className="text-lg font-semibold text-gray-700">Post in Minutes</span>
          </div>
          <div className="bg-white border rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-2xl transition-shadow">
            <Shield size={36} className="text-[#15735b]" />
            <span className="text-lg font-semibold text-gray-700">College-only Access</span>
          </div>
          <div className="bg-white border rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-2xl transition-shadow">
            <CheckCircle size={36} className="text-[#15735b]" />
            <span className="text-lg font-semibold text-gray-700">Verified Claims</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
