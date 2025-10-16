import React from 'react'
import { Mail, Heart, Shield, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                CampusFind
              </span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              A secure, student-friendly platform to report lost items, post found belongings, and reconnect with what matters most.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with love for the campus community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a 
                href="/home" 
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Home
              </a>
              <a 
                href="/dashboard" 
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Dashboard
              </a>
              <a 
                href="/status" 
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:translate-x-1 transform"
              >
                Status Enquiry
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Support</h3>
            <div className="space-y-3">
              <a 
                href="mailto:campusfindsrcas@gmail.com" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                <Mail className="w-4 h-4" />
                <span>Email Support</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} CampusFind. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Built for SRCAS Community</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}