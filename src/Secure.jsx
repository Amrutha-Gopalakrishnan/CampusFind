import React, { useEffect, useState } from 'react'

const Secure = () => {
  const [users, setUsers] = useState(0)
  const [resolved, setResolved] = useState(0)

  useEffect(() => {
    const targetUsers = 132
    const targetResolved = 89
    const durationMs = 1200
    const steps = 40
    const interval = Math.floor(durationMs / steps)

    let u = 0
    let r = 0
    const timer = setInterval(() => {
      u = Math.min(targetUsers, u + Math.ceil(targetUsers / steps))
      r = Math.min(targetResolved, r + Math.ceil(targetResolved / steps))
      setUsers(u)
      setResolved(r)
      if (u === targetUsers && r === targetResolved) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className='mt-10 relative overflow-hidden'>
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="w-[500px] h-[500px] rounded-full bg-[#e6f3ef] blur-3xl opacity-40 absolute -top-40 -left-40" />
        <div className="w-[400px] h-[400px] rounded-full bg-[#e6f3ef] blur-3xl opacity-40 absolute -bottom-40 -right-20" />
      </div>
      <div className='relative max-w-6xl mx-auto px-6'>
        <div className='bg-[#15735b] rounded-2xl p-10 text-white shadow border border-white/10'>
          <h2 className='text-3xl font-bold text-center'>Secure College-Only Platform</h2>
          <p className='text-lg font-medium text-center mt-2'>Only verified college email holders can view and post on this platform.</p>
          <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center'>
            <div className='bg-white/10 rounded-lg p-6 border border-white/10'>
              <div className='text-4xl font-extrabold'>{users}</div>
              <div className='text-sm opacity-90'>Verified users</div>
            </div>
            <div className='bg-white/10 rounded-lg p-6 border border-white/10'>
              <div className='text-4xl font-extrabold'>{resolved}</div>
              <div className='text-sm opacity-90'>Reports resolved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Secure;
