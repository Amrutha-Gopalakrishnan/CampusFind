import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ReportFound from "./ReportFound";
import Lost from "./Lost";
import Status from "./Status";
import Profile from "./Profile";

export default function Dashboard({ user, setUser }) {
  const [active, setActive] = useState("found"); // 'found' | 'lost' | 'status' | 'profile'

  const renderContent = () => {
    if (active === "lost") return <Lost user={user} setUser={setUser} />;
    if (active === "found") return <ReportFound user={user} setUser={setUser} />;
    if (active === "status") return <Status user={user} setUser={setUser} />;
    if (active === "profile") return <Profile user={user} setUser={setUser} />; // ✅ pass user
    return null;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} />
      {renderContent()}
    </div>
  );
}
