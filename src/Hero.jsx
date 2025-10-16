import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Search, ClipboardList, Shield, CheckCircle, Sparkles, Zap, Users, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-32 left-1/4 animate-bounce delay-500">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-48 right-1/4 animate-bounce delay-1000">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-32 left-1/3 animate-bounce delay-1500">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-48 right-1/3 animate-bounce delay-2000">
          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse delay-500"></div>
          </div>
          <h1 className="font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-gray-900 mb-6 leading-tight">
            Find & Reclaim Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Belongings
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A modern, secure platform designed exclusively for college students to report lost items, 
            post found belongings, and reconnect with what matters most.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
          <Link
            to="/dashboard"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-3">
              Get Started
              <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-2xl font-bold text-lg bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            How it works
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full max-w-6xl">
          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 flex flex-col items-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center">Smart Search</h3>
            <p className="text-gray-600 text-center text-sm">Advanced filtering and instant search capabilities</p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 flex flex-col items-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center">Quick Post</h3>
            <p className="text-gray-600 text-center text-sm">Post lost or found items in under 2 minutes</p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 flex flex-col items-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center">Secure Access</h3>
            <p className="text-gray-600 text-center text-sm">College email verification for trusted community</p>
          </div>

          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 flex flex-col items-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center">Verified Claims</h3>
            <p className="text-gray-600 text-center text-sm">Secure verification process for item claims</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">500+</div>
            <div className="text-gray-600 font-semibold">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">89%</div>
            <div className="text-gray-600 font-semibold">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">24/7</div>
            <div className="text-gray-600 font-semibold">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;