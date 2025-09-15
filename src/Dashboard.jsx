import React, { useState } from 'react'
import Sidebar from './Sidebar'
import ReportFound from './ReportFound'
import Lost from './Lost'
import Status from './Status'
import Profile from './Profile'

export default function Dashboard() {
  const [active, setActive] = useState('found') // 'found' | 'lost' | 'status' | 'profile'

  const renderContent = () => {
    if (active === 'lost') return <Lost />
    if (active === 'found') return <ReportFound />
    if (active === 'status') return <Status />
    if (active === 'profile') return <Profile />
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} />
      {renderContent()}
    </div>
  )
}

