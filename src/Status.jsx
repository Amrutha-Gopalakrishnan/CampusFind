import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Search, Filter, LogOut, ArrowRight, Eye, Calendar, User, Hash, Building, Phone, Clock, Sparkles } from "lucide-react";

export default function Status({ user, setUser }) {
  const [tab, setTab] = useState("lost"); // 'lost' | 'found'
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fast data fetch with optimized profile attachments
  const fetchData = async () => {
    setLoading(true);
    try {
      // First, fetch items data quickly
      const [lostRes, foundRes] = await Promise.allSettled([
        supabase.from("lost_items").select("*").order('created_at', { ascending: false }).limit(30),
        supabase.from("found_items").select("*").order('created_at', { ascending: false }).limit(30)
      ]);

      const lostData = lostRes.status === 'fulfilled' ? (lostRes.value.data || []) : [];
      const foundData = foundRes.status === 'fulfilled' ? (foundRes.value.data || []) : [];

      // Get unique emails for batch profile fetching
      const allEmails = [...new Set([
        ...lostData.map(item => item.owner_email).filter(Boolean),
        ...foundData.map(item => item.owner_email).filter(Boolean)
      ])];

      // Batch fetch all profiles at once (much faster than individual queries)
      let profilesMap = {};
      if (allEmails.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email, full_name, avatar_url")
          .in("email", allEmails);
        
        // Create a map for fast lookup
        profilesMap = (profiles || []).reduce((acc, profile) => {
          acc[profile.email] = profile;
          return acc;
        }, {});
      }

      // Process items with profile data
      const processedLost = lostData.map(item => {
        const profile = profilesMap[item.owner_email];
        return {
          ...item,
          uploader_name: item.name || profile?.full_name || item.owner_email?.split("@")[0] || "Anonymous",
          uploader_avatar: profile?.avatar_url || null
        };
      });

      const processedFound = foundData.map(item => {
        const profile = profilesMap[item.owner_email];
        return {
          ...item,
          uploader_name: item.name || profile?.full_name || item.owner_email?.split("@")[0] || "Anonymous",
          uploader_avatar: profile?.avatar_url || null
        };
      });

      setLostItems(processedLost);
      setFoundItems(processedFound);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLostItems([]);
      setFoundItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // ✅ Realtime subscription with optimized profile fetching
    const lostSub = supabase
      .channel("lost_items_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lost_items" },
        async (payload) => {
          // Quick profile fetch for new item
          let profile = null;
          if (payload.new.owner_email) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("email", payload.new.owner_email)
              .limit(1);
            profile = profilesData?.[0];
          }
          
          const newItem = {
            ...payload.new,
            uploader_name: payload.new.name || profile?.full_name || payload.new.owner_email?.split("@")[0] || "Anonymous",
            uploader_avatar: profile?.avatar_url || null
          };
          setLostItems((prev) => [newItem, ...prev]);
        }
      )
      .subscribe();

    const foundSub = supabase
      .channel("found_items_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "found_items" },
        async (payload) => {
          // Quick profile fetch for new item
          let profile = null;
          if (payload.new.owner_email) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("email", payload.new.owner_email)
              .limit(1);
            profile = profilesData?.[0];
          }
          
          const newItem = {
            ...payload.new,
            uploader_name: payload.new.name || profile?.full_name || payload.new.owner_email?.split("@")[0] || "Anonymous",
            uploader_avatar: profile?.avatar_url || null
          };
          setFoundItems((prev) => [newItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lostSub);
      supabase.removeChannel(foundSub);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const items = tab === "lost" ? lostItems : foundItems;
  const filteredItems = items.filter(item => 
    !searchTerm || 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.register_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Helper: last 4 chars of UUID for Post ID
  const getPostId = (uuid) => uuid?.slice(-4).toUpperCase() || "-";

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200";
      case "Found":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
      case "Lost":
        return "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200";
      default:
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">Status Enquiry</h2>
              <p className="text-gray-600 font-medium">Track and monitor lost & found items</p>
            </div>
          </div>
          
          {user && (
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="px-4 py-2 text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 shadow-lg  rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tabs and Search */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setTab("lost")}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  tab === "lost"
                    ? "text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 shadow-lg shadow-lg"
                    : "bg-white/80 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                Lost Items
              </button>
              <button
                onClick={() => setTab("found")}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  tab === "found"
                    ? "text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 shadow-lg shadow-lg"
                    : "bg-white/80 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                Found Items
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span>Total {tab} items: {items.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              <span>Filtered results: {filteredItems.length}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Post ID
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Uploader
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Reg Number
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Department
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Updated
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/40 divide-y divide-gray-200/50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 font-medium">Loading items...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/60 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {getPostId(item.id)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {item.uploader_avatar ? (
                            <img
                              src={item.uploader_avatar}
                              alt={`${item.uploader_name} Avatar`}
                              className="w-10 h-10 object-cover rounded-xl border-2 border-white shadow-lg"
                              onError={(e) => {
                                console.warn('Avatar failed to load:', e.target.src);
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${item.uploader_avatar ? 'hidden' : 'flex'}`}
                          >
                            {item.uploader_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.uploader_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.title || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.register_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.department || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${getStatusColor(item.status)}`}>
                          {item.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(item.created_at).toLocaleString() || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                          <Eye className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-700 mb-2">No items found</div>
                          <div className="text-gray-500">Try adjusting your search criteria</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}