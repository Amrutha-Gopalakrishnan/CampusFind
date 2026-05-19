import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ReportFound from "./ReportFound";
import Lost from "./Lost";
import Status from "./Status";
import Profile from "./Profile";
import AdminDashboard from "./AdminDashBoard";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { toast } from "react-toastify";

// ============================================
// ADMIN ACCESS CONTROL (CODE LEVEL)
// ============================================
const ADMIN_EMAIL = "amruthagopal16@gmail.com";

const isAdminUser = (user) => {
  if (!user?.email) return false;
  return user.email.toLowerCase().trim() === ADMIN_EMAIL;
};

export default function Dashboard({ user, setUser }) {
  const [active, setActive] = useState("found"); // 'found' | 'lost' | 'status' | 'analytics' | 'profile' | 'admin'

  const renderContent = () => {
    if (active === "lost") return <Lost user={user} setUser={setUser} />;
    if (active === "found") return <ReportFound user={user} setUser={setUser} />;
    if (active === "status") return <Status user={user} setUser={setUser} />;
    if (active === "analytics") return <AnalyticsDashboard user={user} setUser={setUser} />;
    if (active === "profile") return <Profile user={user} setUser={setUser} />;
    
    // ✅ CODE-LEVEL ADMIN ACCESS GUARD
    if (active === "admin") {
      if (!isAdminUser(user)) {
        toast.error("Access Denied: Admin privileges required");
        setActive("found"); // Redirect to default view
        return <ReportFound user={user} setUser={setUser} />;
      }
      return <AdminDashboard user={user} setUser={setUser} />;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex">
      <Sidebar active={active} onNavigate={setActive} user={user} setUser={setUser} />
      <main className="flex-1 lg:ml-0">
        <div className="min-h-screen">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}