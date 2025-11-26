import React, { useEffect, useState } from 'react'
import { Shield, Lock, Users, CheckCircle, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const Secure = () => {
  const [users, setUsers] = useState(0)
  const [resolved, setResolved] = useState(0)
  const [security, setSecurity] = useState(0)

  useEffect(() => {
    const targetUsers = 500
    const targetResolved = 92
    const targetSecurity = 100
    const durationMs = 2000
    const steps = 60
    const interval = Math.floor(durationMs / steps)

    let u = 0, r = 0, s = 0
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
    <section 
      id="security"
      className="relative overflow-hidden py-20 bg-gradient-to-br from-[#F8FBFF] via-[#EAF4FF] to-[#F0F8FF]"
    >
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#00C6FF]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#3A8DFF]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative bg-white/80 rounded-3xl p-12 shadow-2xl border border-white/20 backdrop-blur-md overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-4xl font-black text-[#0A2540] mb-3">
              Your Campus, Secured with Confidence 🔒
            </h2>
            <p className="text-lg text-[#37475A] max-w-2xl mx-auto">
              CampusFind ensures that your lost & found ecosystem stays <strong>safe, verified,</strong> and <strong>accessible</strong> only to your campus community.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: <Users />, value: users + '+', label: 'Verified Students', color: 'from-[#0052CC] to-[#3A8DFF]' },
              { icon: <CheckCircle />, value: resolved + '%', label: 'Resolved Reports', color: 'from-[#3A8DFF] to-[#00C6FF]' },
              { icon: <Lock />, value: security + '%', label: 'Data Security', color: 'from-[#00C6FF] to-[#0052CC]' }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="group bg-white/60 rounded-2xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    {React.cloneElement(item.icon, { className: 'w-6 h-6 text-white' })}
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#0A2540]">{item.value}</div>
                    <div className="text-sm text-[#37475A] font-semibold">{item.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#0A2540] mb-4">Campus Security Highlights</h3>
              <ul className="space-y-4">
                {[
                  { text: 'Exclusive access via college email verification', icon: Shield },
                  { text: 'AES-256 encrypted data protection', icon: Lock },
                  { text: 'Real-time alert for found items', icon: Sparkles }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0052CC] to-[#00C6FF] rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[#37475A] font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#0A2540] mb-4">Why CampusFind?</h3>
              <ul className="space-y-4">
                {[
                  { text: 'Simplified lost & found experience', icon: CheckCircle },
                  { text: 'Fast campus-wide notifications', icon: Zap },
                  { text: 'Trusted by verified faculty & students', icon: Users }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#00C6FF] to-[#0052CC] rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[#37475A] font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Secure
