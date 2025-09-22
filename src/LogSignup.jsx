import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";
import { supabase } from "./supabaseClient";

const LogSignup = ({ initialTab = "login" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loginData, setLoginData] = useState({ regNo: "", email: "" });
  const [signupData, setSignupData] = useState({ name: "", regNo: "", deptYear: "", collegeEmail: "" });
  const [user, setUser] = useState(null);

  // Sync initial tab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Check current session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Handle form changes
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

  // Handle login/signup submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.regNo, // Using regNo as password for simplicity; change as needed
      });
      if (error) return alert(error.message);
      setUser(data.user);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.collegeEmail,
        password: signupData.regNo, // Using regNo as password for simplicity; change as needed
      });
      if (error) return alert(error.message);
      alert("Signup successful! Please verify your email.");
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLoginData({ regNo: "", email: "" });
    setSignupData({ name: "", regNo: "", deptYear: "", collegeEmail: "" });
  };

  // If user is logged in, show logged-in message
  const navigate = useNavigate();
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f3ef] via-white to-[#f8fafc] py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <img src={logo} alt="CampusFind" className="w-20 h-20 object-contain mx-auto mb-2" />
          <p className="text-green-700 font-semibold mb-4">✅ Logged in as {user.email}</p>
          <button
            className="w-full py-3 mt-2 rounded-lg bg-[#15735b] text-white font-bold text-lg shadow hover:bg-[#125e4b] transition-colors"
            onClick={handleLogout}
          >
            Log Out
          </button>
          <button
            className="w-full py-3 mt-4 rounded-lg bg-[#1e40af] text-white font-bold text-lg shadow hover:bg-[#1e3a8a] transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Default login/signup UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f3ef] via-white to-[#f8fafc] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="CampusFind" className="w-20 h-20 object-contain mb-2" />
          <div className="text-center text-gray-700 font-semibold text-base mb-2">
            A secure platform for students to report and reclaim lost belongings.
          </div>
        </div>

        <div className="flex mb-8">
          <button
            className={`flex-1 py-2 rounded-l-2xl font-bold text-lg transition-colors ${
              activeTab === "login" ? "bg-[#15735b] text-white" : "bg-gray-100 text-[#15735b]"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-r-2xl font-bold text-lg transition-colors ${
              activeTab === "signup" ? "bg-[#15735b] text-white" : "bg-gray-100 text-[#15735b]"
            }`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "login" ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Register Number</label>
              <input
                type="text"
                name="regNo"
                value={loginData.regNo}
                onChange={handleLoginChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15735b]"
                placeholder="Enter your register number"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15735b]"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-lg bg-[#15735b] text-white font-bold text-lg shadow hover:bg-[#125e4b] transition-colors"
            >
              Login
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15735b]"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Register Number</label>
              <input
                type="text"
                name="regNo"
                value={signupData.regNo}
                onChange={handleSignupChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15735b]"
                placeholder="Enter your register number"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Department & Year</label>
              <input
                type="text"
                name="deptYear"
                value={signupData.deptYear}
                onChange={handleSignupChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15735b]"
                placeholder="e.g. CSE 3rd Year"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">College Email</label>
              <input
                type="email"
                name="collegeEmail"
                value={signupData.collegeEmail}
                onChange={handleSignupChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15735b]"
                placeholder="Enter your college email"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-lg bg-[#15735b] text-white font-bold text-lg shadow hover:bg-[#125e4b] transition-colors"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LogSignup;

