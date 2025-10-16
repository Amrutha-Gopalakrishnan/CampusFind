import React, { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Sparkles, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "./supabaseClient";

const Navbar = memo(({ user, setUser }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
            CampusFind
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 border border-gray-200 hover:border-blue-200"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-all duration-300"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-6 py-4 space-y-3">
          {user ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
                className="block w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="block w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="block w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <button
                className="block w-full px-6 py-3 rounded-xl font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 border border-gray-200 hover:border-blue-200"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
              <button
                className="block w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-all duration-300"
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