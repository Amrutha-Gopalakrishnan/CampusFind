import React, { useEffect, useState } from 'react'
import { Shield, Lock, Users, CheckCircle, Sparkles, Zap } from 'lucide-react'

const Secure = () => {
  const [users, setUsers] = useState(0)
  const [resolved, setResolved] = useState(0)
  const [security, setSecurity] = useState(0)

  useEffect(() => {
    const targetUsers = 500
    const targetResolved = 89
    const targetSecurity = 100
    const durationMs = 2000
    const steps = 60
    const interval = Math.floor(durationMs / steps)

    let u = 0
    let r = 0
    let s = 0
    const timer = setInterval(() => {
      u = Math.min(targetUsers, u + Math.ceil(targetUsers / steps))
      r = Math.min(targetResolved, r + Math.ceil(targetResolved / steps))
      s = Math.min(targetSecurity, s + Math.ceil(targetSecurity / steps))
      setUsers(u)
      setResolved(r)
      setSecurity(s)
      if (u === targetUsers && r === targetResolved && s === targetSecurity) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className='relative overflow-hidden py-20'>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className='relative max-w-7xl mx-auto px-6'>
        {/* Main Security Card */}
        <div className='relative bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 rounded-3xl p-12 shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden'>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          
          {/* Header */}
          <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h2 className='text-4xl font-black text-gray-900 mb-2'>Secure Campus Platform</h2>
                <p className='text-lg text-gray-600 font-medium'>Verified college community access only</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
            <div className='group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className='text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent'>{users}+</div>
                  <div className='text-sm text-gray-600 font-semibold'>Verified Users</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">College email verified members only</p>
            </div>

            <div className='group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className='text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent'>{resolved}%</div>
                  <div className='text-sm text-gray-600 font-semibold'>Success Rate</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Items successfully reunited</p>
            </div>

            <div className='group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className='text-3xl font-black bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent'>{security}%</div>
                  <div className='text-sm text-gray-600 font-semibold'>Security Score</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Enterprise-grade protection</p>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Security Features</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">College email verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Secure data storage</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Trusted campus community</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Instant notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Verified user profiles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Secure;