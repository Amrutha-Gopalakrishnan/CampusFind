
import {
  Home,
  Search,
  ClipboardList,
  User,
  Menu,
  X,
  Shield,
  LogOut,
  BarChart3,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import logo from "./assets/logo.png";
import { getSafeAvatarUrl } from "./utils/avatarManager";

export default function Sidebar({ active, onNavigate, user, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();

  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    async function loadProfile() {
      try {
        const authResp = await supabase.auth.getUser();
        const authUser = authResp.data?.user || null;
        const email = authUser?.email || user?.email;
        if (!email) return;

        if (authUser && authUser.email === email) {
          setUserProfile({ id: authUser.id, email: authUser.email });
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
          .single();

        setUserProfile(data || null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const profileSubscription = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `email=eq.${user.email}`,
        },
        (payload) => setUserProfile(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const menuItems = [
    { id: "home", label: "Home", icon: Home, action: () => navigate("/home") },
    {
      id: "found",
      label: "Report Found Item",
      icon: ClipboardList,
      action: () => onNavigate("found"),
    },
    {
      id: "lost",
      label: "Report Lost Item",
      icon: ClipboardList,
      action: () => onNavigate("lost"),
    },
    {
      id: "status",
      label: "Status Enquiry",
      icon: Search,
      action: () => onNavigate("status"),
    },
    {
      id: "analytics",
      label: "Analytics Dashboard",
      icon: BarChart3,
      action: () => onNavigate("analytics"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      action: () => onNavigate("profile"),
    },
    {
      id: "admin",
      label: "Admin Dashboard",
      icon: Shield,
      action: () => onNavigate("admin"),
    },
  ];

  return (
    <>
      {/* 📱 Mobile Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CampusFind" className="w-8 h-8" />
            <span className="text-xl font-bold text-[#3B4CCA]">CampusFind</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-[#E9EEFF]"
          >
            {isOpen ? (
              <X size={22} className="text-[#3B4CCA]" />
            ) : (
              <Menu size={22} className="text-[#3B4CCA]" />
            )}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🧭 Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-screen bg-white/90 backdrop-blur-md border-r border-gray-200 shadow-xl
          w-72 transform transition-transform duration-300 z-50 ${
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-200">
          <img src={logo} alt="CampusFind" className="w-10 h-10 rounded-lg" />
          <div>
            <h2 className="text-lg font-bold text-[#3B4CCA]">CampusFind</h2>
            <p className="text-xs text-gray-500">Lost & Found System</p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B4CCA] to-[#5A4FCF] text-white flex items-center justify-center text-lg font-semibold">
                {userProfile?.full_name?.charAt(0)?.toUpperCase() ||
                  user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {userProfile?.full_name || user.email.split("@")[0]}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-white font-semibold rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 transition-all duration-300"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-5 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#3B4CCA] to-[#5A4FCF] text-white shadow-md"
                    : "hover:bg-[#E9EEFF] text-gray-700"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-white/20"
                      : "bg-[#E9EEFF] text-[#3B4CCA] group-hover:bg-[#DDE4FF]"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 py-4 text-center">
          <p className="text-xs text-gray-500">CampusFind v2.0</p>
          <p className="text-[11px] text-gray-400">Secure • Smart • Reliable</p>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
