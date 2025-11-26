import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";
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

// 🔹 Splash Screen Component
const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // show for 2 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0F172A] text-white z-50"
    >
      <motion.img
        src="/logo.png" // your logo with transparent background
        alt="CampusFind Logo"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-44 h-44 object-contain mb-4 drop-shadow-xl"
      />

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg md:text-xl font-semibold tracking-wide text-center text-slate-200"
      >
        “Find it. Return it. Simplify Campus Life.”
      </motion.h1>
    </motion.div>
  );
};

// Private Route wrapper
const PrivateRoute = ({ children, user }) => {
  console.log("PrivateRoute: user =", user);
  return user ? children : <Navigate to="/login" />;
};

// Landing Page Component
const LandingPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

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
        const userName = data.full_name || user.email?.split("@")[0] || "User";
        const regNumber = data.reg_number || user.email || "Register Number";
        toast.success(`Welcome back ${userName}!\n\nName: ${userName}\nRegister Number: ${regNumber}\nEmail: ${user.email}`);
      } else {
        const userName = user.email?.split("@")[0] || "User";
        toast.success(`Welcome back ${userName}!\n\nName: ${userName}\nEmail: ${user.email}`);
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
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
  const [showSplash, setShowSplash] = useState(true);

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
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(session?.user || null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("App: User state updated:", user);
  }, [user]);

  // ✅ Show splash only once on load
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
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
