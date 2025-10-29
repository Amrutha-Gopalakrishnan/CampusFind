import { Home, Search, ClipboardList, User, Menu, X, Shield, LogOut, Settings, Bell, BarChart3, Filter, Package, TrendingUp } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient"; // adjust path if needed
import { getSafeAvatarUrl } from "./utils/avatarManager";

export default function Sidebar({ active, onNavigate, user, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();

  const mountedRef = useRef(false);

  // Fetch user profile data
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    async function loadProfile() {
      try {
        const authResp = await supabase.auth.getUser();
        const authUser = authResp.data?.user || null;
        const email = authUser?.email || user?.email;
        if (!email) return;

        // Use auth user first (safe), fallback to profiles table only if needed
        if (authUser && authUser.email === email) {
          setUserProfile({ id: authUser.id, email: authUser.email });
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
          .limit(1)
          .single();

        if (error) {
          if (error.code === "42501" || /permission denied/i.test(error.message || "")) {
            console.warn("Supabase permission denied when selecting profiles. Check RLS/policies.");
            return;
          }
          console.error("Error fetching profile from profiles table:", error);
          return;
        }

        setUserProfile(data || null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    }

    loadProfile();
  }, [user]);

  // Set up realtime subscription to listen for profile updates
  useEffect(() => {
    if (!user) return;
    
    const profileSubscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `email=eq.${user.email}`
        },
        (payload) => {
          console.log('Sidebar: Profile updated via realtime:', payload.new);
          setUserProfile(payload.new);
        }
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
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => navigate("/home"),
      isExternal: true
    },
    {
      id: "found",
      label: "Report Found Item",
      icon: ClipboardList,
      action: () => onNavigate("found"),
      description: "Found someone's belongings?"
    },
    {
      id: "lost",
      label: "Report Lost Item",
      icon: ClipboardList,
      action: () => onNavigate("lost"),
      description: "Lost something important?"
    },
    {
      id: "status",
      label: "Status Enquiry",
      icon: Search,
      action: () => onNavigate("status"),
      description: "Track your reports"
    },
    {
      id: "analytics",
      label: "📊 Analytics Dashboard",
      icon: BarChart3,
      action: () => onNavigate("analytics"),
      description: "Real-time insights & AI analytics"
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      action: () => onNavigate("profile"),
      description: "Manage your account"
    },
    {
      id: "admin",
      label: "Admin Dashboard",
      icon: Shield,
      action: () => onNavigate("admin"),
      description: "Faculty access only"
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              CampusFind
            </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
            {isOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
        </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative top-0 left-0 h-screen lg:h-auto bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl lg:shadow-none
          w-80 transform transition-transform duration-300 ease-in-out z-50 lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Desktop Logo */}
        <div className="hidden lg:flex p-6 items-center gap-3 border-b border-gray-200/50">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              CampusFind
            </span>
            <div className="text-xs text-gray-500 font-medium">Lost & Found Platform</div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl shadow-lg overflow-hidden">
                        {(() => {
                          // Show actual avatar for both students and faculty
                          console.log('Sidebar: Avatar display check - userProfile:', userProfile, 'avatar_url:', userProfile?.avatar_url);
                          return userProfile?.avatar_url && !avatarError ? (
                            <img
                              src={userProfile.avatar_url}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                              onError={async (e) => {
                                console.warn('Sidebar: Avatar image failed to load:', e.target.src);
                                setAvatarError(true);
                                // Clean up invalid URL from database
                                try {
                                  await supabase
                                    .from('profiles')
                                    .update({ avatar_url: null })
                                    .eq('email', userProfile.email);
                                } catch (error) {
                                  console.error('Error cleaning up invalid avatar URL:', error);
                                }
                              }}
                            />
                          ) : null;
                        })()}
                {(() => {
                  // Show fallback initials for both students and faculty if no avatar or error
                  return (
                    <div 
                      className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ${userProfile?.avatar_url && !avatarError ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-white font-bold text-lg">
                        {userProfile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {userProfile?.full_name || user.email?.split("@")[0] || "User"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
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
                  className={`
                    w-full text-left p-4 rounded-2xl transition-all duration-300 group
                    ${isActive 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{item.label}</div>
                      {item.description && (
                        <div className={`text-xs mt-1 ${
                          isActive ? "text-white/80" : "text-gray-500"
                        }`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
              </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/50">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">CampusFind v2.0</div>
            <div className="text-xs text-gray-400">
              Secure • Fast • Reliable
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}