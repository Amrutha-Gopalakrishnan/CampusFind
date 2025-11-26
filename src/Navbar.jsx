import React, { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "./supabaseClient";
import logo from './assets/logo.png'

const Navbar = memo(({ user, setUser }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/50 backdrop-blur-2xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)] font-[Inter]">
      <nav className="max-w-6xl mx-auto px-3 py-3 flex justify-between items-center">
        {/* Logo + Title */}
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          {/* Custom Logo Image */}
          <div className="relative">
            <img
              src={logo}
              alt="CampusFind Logo"
              className="w-12 h-12 object-contain rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full animate-ping"></div>
          </div>

          {/* Brand Name */}
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
            CampusFind
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 hover:opacity-90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 hover:opacity-90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all duration-300"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                className="px-6 py-2.5 rounded-xl font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:scale-105 transition-all duration-300"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-blue-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X size={24} className="text-gray-700" />
          ) : (
            <Menu size={24} className="text-gray-700" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-xl border-t border-white/30 px-6 py-4 space-y-3 animate-fadeIn">
          {user ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                className="w-full px-6 py-3 rounded-xl font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all duration-300"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </button>

              <button
                className="w-full px-6 py-3 rounded-xl font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-300"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/signup");
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
});

export default Navbar;
