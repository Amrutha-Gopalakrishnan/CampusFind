import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Work from "./Work";
import Secure from "./Secure";
import Footer from "./Footer";
import Dashboard from "./Dashboard";
import LogSignup from "./LogSignup";
import Lost from "./Lost";
import ReportFound from "./ReportFound";
import Status from "./Status";
import { supabase } from "./supabaseClient";

// Private Route wrapper
const PrivateRoute = ({ children, user }) => {
  return user ? children : <Navigate to="/login" />;
};

// Landing Page Component
const LandingPage = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <Navbar />
      <div className="px-6 py-4 text-center">
        {user && (
          <div className="flex flex-col items-center mb-4">
            <span className="text-gray-700 font-medium mb-2">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mb-2"
            >
              Log Out
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b]"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
      <Hero />
      <Work />
      <Secure />
      <Footer />
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);

  // Get current session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} setUser={setUser} />} />
        <Route path="/home" element={<LandingPage user={user} setUser={setUser} />} />

        {/* Dashboard - Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute user={user}>
              <Dashboard user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />

        {/* Lost, ReportFound, Status - Protected */}
        <Route
          path="/lost"
          element={
            <PrivateRoute user={user}>
              <Lost user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportfound"
          element={
            <PrivateRoute user={user}>
              <ReportFound user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
        <Route
          path="/status"
          element={
            <PrivateRoute user={user}>
              <Status user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />

        {/* Login & Signup */}
        <Route path="/login" element={<LogSignup initialTab="login" setUser={setUser} />} />
        <Route path="/signup" element={<LogSignup initialTab="signup" setUser={setUser} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
