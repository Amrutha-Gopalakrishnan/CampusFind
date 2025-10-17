import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
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
import NotFound from "./NotFound";
import { supabase, handleAuthError } from "./supabaseClient";

// Private Route wrapper
const PrivateRoute = ({ children, user }) => {
  console.log("PrivateRoute: user =", user);
  return user ? children : <Navigate to="/login" />;
};

// Landing Page Component
const LandingPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    if (!user) return;
    
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        setUserProfile(data);
        // Show welcome alert with user info
        const userName = data.full_name || user.email?.split("@")[0] || "User";
        const regNumber = data.reg_number || user.email || "Register Number";
        toast.success(`Welcome back ${userName}!\n\nName: ${userName}\nRegister Number: ${regNumber}\nEmail: ${user.email}`);
      } else {
        // Show fallback alert if no profile data
        const userName = user.email?.split("@")[0] || "User";
        toast.success(`Welcome back ${userName}!\n\nName: ${userName}\nEmail: ${user.email}`);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Navbar user={user} setUser={setUser} />
      <Hero />
      <Work />
      <Secure />
      <Footer />
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);

  // Get current session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          await handleAuthError(error);
          setUser(null);
          return;
        }
        
        console.log("App: Initial session:", session?.user);
        setUser(session?.user || null);
      } catch (error) {
        console.error("Failed to get session:", error);
        await handleAuthError(error);
        setUser(null);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("App: Auth state changed:", event, session?.user);
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Debug user state changes
  useEffect(() => {
    console.log("App: User state updated:", user);
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
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

          {/* Fallback - Handle any unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;