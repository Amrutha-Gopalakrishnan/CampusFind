import React from 'react'
import { Mail, Heart, Shield, Sparkles } from 'lucide-react'
import logo from './assets/logo.png'

export default function Footer() {
  return (
    <footer className="relative mt-5 border-t border-[#E0ECFF]/50 bg-gradient-to-br from-[#F8FBFF] via-[#EAF4FF] to-[#F0F8FF] backdrop-blur-sm">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-[#00C6FF]/10 to-[#3A8DFF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-[#0052CC]/10 to-[#00C6FF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0052CC] via-[#3A8DFF] to-[#00C6FF] rounded-xl flex items-center justify-center shadow-lg">
                <img src={logo} alt="CampusFind" className='w-10 h-10 object-contain' />
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#0052CC] via-[#3A8DFF] to-[#00C6FF] bg-clip-text text-transparent">
                CampusFind
              </span>
            </div>
            <p className="text-[#37475A] mb-4 max-w-md leading-relaxed">
              CampusFind is your trusted digital companion for managing lost and found items across campus — secure, verified, and built exclusively for students and faculty.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#6B7C8E]">
              <Heart className="w-4 h-4 text-[#FF4C4C]" />
              <span>Made with love for the campus community ❤️</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-[#0A2540] mb-4">Quick Links</h3>
            <div className="space-y-3">
              {[
                { name: 'Home', href: '/home' },
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Status Enquiry', href: '/status' },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="block text-[#37475A] hover:text-[#0052CC] transition-all duration-300 hover:translate-x-1 transform"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-[#0A2540] mb-4">Support</h3>
            <div className="space-y-3">
              <a
                href="mailto:campusfindsrcas@gmail.com"
                className="flex items-center gap-2 text-[#37475A] hover:text-[#0052CC] transition-colors duration-300"
              >
                <Mail className="w-4 h-4" />
                <span>Email Support</span>
              </a>
              <div className="flex items-center gap-2 text-[#37475A]">
                <Shield className="w-4 h-4" />
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E0ECFF]/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#37475A]">
            © {new Date().getFullYear()} <span className="font-semibold text-[#0052CC]">CampusFind</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-[#37475A]">
            <span>Built for SRCAS Community</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00C6FF] rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
