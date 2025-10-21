import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Shield, LogOut, ArrowRight, Eye, Calendar, User, Hash, Building, Phone, Clock, Search, Filter, CheckCircle, AlertCircle, Sparkles, Edit, Trash2, Save, X } from "lucide-react";
import { useAlert, useConfirm, CustomAlert, CustomConfirm } from "./CustomAlert";
import { deleteItemWithImage } from "./utils/imageDeletion";

const LockIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

export default function AdminDashboard({ user, setUser }) {
  const { alert, success, error, warning, info, hideAlert } = useAlert();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
  const [authUser, setAuthUser] = useState(user || null);
  const [isFaculty, setIsFaculty] = useState(false);
  const [tab, setTab] = useState("lost"); // 'lost' | 'found' | 'cleanup'
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [isProcessingRealtime, setIsProcessingRealtime] = useState(false);
  const [profileCache, setProfileCache] = useState(new Map());

  // Check if user is faculty based on email pattern
  const checkFacultyStatus = (email) => {
    if (!email) return false;
    
    // Special test email for admin access
    if (email === "ammugopal1116@gmail.com") {
      return true;
    }
    
    // Faculty emails contain names (letters), student emails contain only numbers
    const emailPrefix = email.split("@")[0];
    return /[a-zA-Z]/.test(emailPrefix); // Contains letters = faculty
  };

  useEffect(() => {
    setAuthUser(user || null);
    if (user?.email) {
      setIsFaculty(checkFacultyStatus(user.email));
    }
  }, [user]);

  useEffect(() => {
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthUser(data.user);
        setIsFaculty(checkFacultyStatus(data.user.email));
      }
    };
    syncUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
      if (session?.user?.email) {
        setIsFaculty(checkFacultyStatus(session.user.email));
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Fetch profile data for uploaders
  const attachProfileData = async (rows) => {
    if (!rows || rows.length === 0) return [];
    
    // Get emails that are not in cache
    const emails = [...new Set(rows.map(row => row.owner_email))];
    const emailsToFetch = emails.filter(email => !profileCache.has(email));
    
    // Fetch only missing profiles
    if (emailsToFetch.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email, full_name, avatar_url")
        .in("email", emailsToFetch);
      
      if (profiles) {
        const newCache = new Map(profileCache);
        profiles.forEach(profile => {
          newCache.set(profile.email, profile);
        });
        setProfileCache(newCache);
      }
    }
    
    // Process image URLs in parallel for better performance
    const imagePromises = rows.map(row => 
      row.image_url ? toSignedUrlIfNeeded(row.image_url) : Promise.resolve(null)
    );
    const imageUrls = await Promise.all(imagePromises);
    
    return rows.map((row, index) => {
      const profile = profileCache.get(row.owner_email);

      // Get display name - prefer full_name, fallback to name field, then email username
      let displayName = row.name || "-";
      if (profile?.full_name) {
        displayName = profile.full_name;
      } else if (row.owner_email) {
        displayName = row.owner_email.split("@")[0];
      }

      return { 
        ...row, 
        uploader_avatar: profile?.avatar_url || null,
        uploader_name: displayName,
        item_image_url: imageUrls[index]
      };
    });
  };

  // Helper: create signed URL for item images
  const toSignedUrlIfNeeded = async (urlOrPath) => {
    if (!urlOrPath) return null;
    if (urlOrPath.includes("/object/public/")) return urlOrPath;

    let objectPath = urlOrPath;
    const marker = "/object/public/lost-found-images/";
    if (urlOrPath.includes(marker)) {
      objectPath = urlOrPath.split(marker)[1];
    } else if (urlOrPath.startsWith("http")) {
      try {
        const u = new URL(urlOrPath);
        objectPath = u.pathname.split("/").pop();
      } catch (_) {}
    }

    const { data, error } = await supabase.storage
      .from("lost-found-images")
      .createSignedUrl(objectPath, 60 * 60); // 1 hour
    if (error) return urlOrPath;
    return data?.signedUrl || urlOrPath;
  };

  // Fetch data for admin dashboard
  const fetchData = async (showLoading = false) => {
    if (!isFaculty) return;
    
    if (showLoading) setLoading(true);
    try {
      const { data: lost } = await supabase.from("lost_items").select("*");
      const { data: found } = await supabase.from("found_items").select("*");

      const lostWithProfiles = await attachProfileData(lost);
      const foundWithProfiles = await attachProfileData(found);

      setLostItems(lostWithProfiles);
      setFoundItems(foundWithProfiles);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    if (isFaculty) {
      fetchData();

      // Realtime subscriptions for faculty
      const lostSub = supabase
        .channel("admin_lost_items")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "lost_items" },
          async (payload) => {
            if (isProcessingRealtime) return; // Prevent concurrent processing
            setIsProcessingRealtime(true);
            try {
              // Check if profile is in cache, if not fetch it
              if (!profileCache.has(payload.new.owner_email)) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("email, full_name, avatar_url")
                  .eq("email", payload.new.owner_email)
                  .maybeSingle();
                
                if (profile) {
                  setProfileCache(prev => new Map(prev).set(profile.email, profile));
                }
              }
              
              const rowWithProfile = (await attachProfileData([payload.new]))[0];
              setLostItems((prev) => [rowWithProfile, ...prev]);
            } catch (error) {
              console.error('Error processing INSERT event:', error);
            } finally {
              setIsProcessingRealtime(false);
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "lost_items" },
          async (payload) => {
            if (isProcessingRealtime) return; // Prevent concurrent processing
            setIsProcessingRealtime(true);
            try {
              // Check if profile is in cache, if not fetch it
              if (!profileCache.has(payload.new.owner_email)) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("email, full_name, avatar_url")
                  .eq("email", payload.new.owner_email)
                  .maybeSingle();
                
                if (profile) {
                  setProfileCache(prev => new Map(prev).set(profile.email, profile));
                }
              }
              
              const rowWithProfile = (await attachProfileData([payload.new]))[0];
              setLostItems((prev) =>
                prev.map((item) => (item.id === payload.new.id ? rowWithProfile : item))
              );
            } catch (error) {
              console.error('Error processing UPDATE event:', error);
            } finally {
              setIsProcessingRealtime(false);
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "lost_items" },
          (payload) => {
            console.log('Lost item deleted via realtime:', payload.old.id);
            setLostItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        )
        .subscribe();

      const foundSub = supabase
        .channel("admin_found_items")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "found_items" },
          async (payload) => {
            if (isProcessingRealtime) return; // Prevent concurrent processing
            setIsProcessingRealtime(true);
            try {
              // Check if profile is in cache, if not fetch it
              if (!profileCache.has(payload.new.owner_email)) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("email, full_name, avatar_url")
                  .eq("email", payload.new.owner_email)
                  .maybeSingle();
                
                if (profile) {
                  setProfileCache(prev => new Map(prev).set(profile.email, profile));
                }
              }
              
              const rowWithProfile = (await attachProfileData([payload.new]))[0];
              setFoundItems((prev) => [rowWithProfile, ...prev]);
            } catch (error) {
              console.error('Error processing INSERT event:', error);
            } finally {
              setIsProcessingRealtime(false);
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "found_items" },
          async (payload) => {
            if (isProcessingRealtime) return; // Prevent concurrent processing
            setIsProcessingRealtime(true);
            try {
              // Check if profile is in cache, if not fetch it
              if (!profileCache.has(payload.new.owner_email)) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("email, full_name, avatar_url")
                  .eq("email", payload.new.owner_email)
                  .maybeSingle();
                
                if (profile) {
                  setProfileCache(prev => new Map(prev).set(profile.email, profile));
                }
              }
              
              const rowWithProfile = (await attachProfileData([payload.new]))[0];
              setFoundItems((prev) =>
                prev.map((item) => (item.id === payload.new.id ? rowWithProfile : item))
              );
            } catch (error) {
              console.error('Error processing UPDATE event:', error);
            } finally {
              setIsProcessingRealtime(false);
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "found_items" },
          (payload) => {
            console.log('Found item deleted via realtime:', payload.old.id);
            setFoundItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(lostSub);
        supabase.removeChannel(foundSub);
      };
    }
  }, [isFaculty]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const items = tab === "lost" ? lostItems : foundItems;
  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.register_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper: last 4 chars of UUID for Post ID
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

  // Edit item function
  const handleEditItem = (item) => {
    setEditingItem(item.id);
    setEditFormData({
      title: item.title || "",
      description: item.description || "",
      name: item.name || "",
      department: item.department || "",
      register_number: item.register_number || "",
      phone_number: item.phone_number || item.phone || "",
      status: item.status || "Pending"
    });
  };

  // Cancel edit function
  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  // Save edit function
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const tableName = tab === "lost" ? "lost_items" : "found_items";
    
    try {
      // Only update fields that exist in the database schema
      const updateData = {
        title: editFormData.title,
        description: editFormData.description,
        name: editFormData.name,
        department: editFormData.department,
        register_number: editFormData.register_number,
        phone_number: editFormData.phone_number,
        status: editFormData.status
      };

      // Remove undefined/null values to avoid database errors
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log('Updating item with data:', updateData);
      console.log('Table:', tableName, 'ID:', editingItem);

      // Try the update with select to get better error information
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", editingItem)
        .select();

      if (error) {
        console.error('Update error details:', error);
        
        // If it's a 400 error, try updating without empty fields
        if (error.code === 'PGRST204' || error.message.includes('400')) {
          const cleanUpdateData = {};
          Object.keys(updateData).forEach(key => {
            if (updateData[key] && updateData[key].trim() !== '') {
              cleanUpdateData[key] = updateData[key];
            }
          });
          
          console.log('Retrying with clean data:', cleanUpdateData);
          
          const { data: retryData, error: retryError } = await supabase
            .from(tableName)
            .update(cleanUpdateData)
            .eq("id", editingItem)
            .select();
            
          if (retryError) {
            error("Failed to update item: " + retryError.message, 'Update Failed');
            console.error('Retry error:', retryError);
            return;
          }
          
          console.log('Retry successful:', retryData);
        } else {
          error("Failed to update item: " + error.message, 'Update Failed');
          return;
        }
      } else {
        console.log('Update successful:', data);
      }

      // Update local state
      if (tab === "lost") {
        setLostItems(prev => 
          prev.map(item => 
            item.id === editingItem 
              ? { ...item, ...updateData }
              : item
          )
        );
      } else {
        setFoundItems(prev => 
          prev.map(item => 
            item.id === editingItem 
              ? { ...item, ...updateData }
              : item
          )
        );
      }

      success("Item updated successfully!", 'Success');
      setEditingItem(null);
      setEditFormData({});
    } catch (err) {
      error("Failed to update item: " + err.message, 'Update Failed');
      console.error('Update error:', err);
    }
  };

  // Helper function to delete image from storage
  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      console.log('Deleting image from storage:', fileName);
      
      const { error } = await supabase.storage
        .from('lost-found-images')
        .remove([fileName]);
      
      if (error) {
        console.error('Error deleting image from storage:', error);
        // Don't throw error, just log it as it's not critical
      } else {
        console.log('Image deleted from storage successfully');
      }
    } catch (error) {
      console.error('Error in deleteImageFromStorage:', error);
    }
  };

  // Enhanced delete item function with image cleanup
  const handleDeleteItem = async (itemId) => {
    // Check if this item is already being deleted
    if (deletingItems.has(itemId)) {
      warning("This item is already being deleted. Please wait...", 'Deletion in Progress');
      return;
    }

    // Check if there are other items being deleted
    if (deletingItems.size > 0) {
      warning("Another item is currently being deleted. This deletion may take a moment longer.", 'Multiple Deletions');
    }

    const confirmed = await showConfirm(
      "Are you sure you want to delete this item? This action cannot be undone and will remove it from the database permanently.",
      { 
        title: 'Delete Item', 
        confirmText: 'Delete', 
        cancelText: 'Cancel',
        type: 'danger'
      }
    );
    
    if (!confirmed) return;

    // Add to deleting set
    setDeletingItems(prev => new Set([...prev, itemId]));

    const tableName = tab === "lost" ? "lost_items" : "found_items";
    
    try {
      console.log(`Starting deletion of item ${itemId} from ${tableName}`);
      
      // Get the item owner email for proper deletion
      const currentItems = tab === "lost" ? lostItems : foundItems;
      const itemToDelete = currentItems.find(item => item.id === itemId);
      
      if (!itemToDelete) {
        error("Item not found in current view", 'Delete Failed');
        return;
      }
      
      // Use the enhanced deletion function
      const result = await deleteItemWithImage(tableName, itemId, itemToDelete.owner_email);
      
      if (result.success) {
        // Update local state
        if (tab === "lost") {
          setLostItems(prev => {
            const filtered = prev.filter(item => item.id !== itemId);
            console.log('Updated lost items:', filtered.length);
            return filtered;
          });
        } else {
          setFoundItems(prev => {
            const filtered = prev.filter(item => item.id !== itemId);
            console.log('Updated found items:', filtered.length);
            return filtered;
          });
        }
        
        // Show success message with image deletion info
        if (result.imageDeletionResult.success) {
          success("Item and image deleted successfully!", 'Success');
        } else {
          warning(`Item deleted, but image deletion failed: ${result.imageDeletionResult.message}`, 'Partial Success');
        }
      } else {
        error(`Failed to delete item: ${result.message}`, 'Delete Failed');
      }
    } catch (err) {
      console.error('Unexpected error during item deletion:', err);
      error("Failed to delete item: " + err.message, 'Delete Failed');
    } finally {
      // Remove from deleting set
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Student access denied component
  if (!isFaculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/20 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <LockIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Admin Access Only</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This dashboard is restricted to faculty members only. Student accounts cannot access administrative functions.
          </p>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              Please contact your administrator if you believe you should have access to this section.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6 lg:p-8">
      {/* Custom Alert Component */}
      <CustomAlert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        duration={alert.duration}
        onClose={hideAlert}
      />
      
      <CustomConfirm
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        type={confirm.type}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 font-medium">Manage lost and found items - Faculty Access</p>
          </div>
        </div>
        {authUser && (
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
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("lost")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                tab === "lost"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/80 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => setTab("found")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                tab === "found"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
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
              placeholder="Search by title, description, or ID..."
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
        {tab !== "profiles" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Uploader Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Register Number
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Item Image
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last Updated
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/40 divide-y divide-gray-200/50">
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center py-12">
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
                            alt="Uploader Avatar"
                            className="w-10 h-10 object-cover rounded-xl border-2 border-white shadow-lg"
                            onError={(e) => {
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
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.uploader_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={editFormData.description || editFormData.title || ""}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          placeholder="Description"
                        />
                      ) : (
                        <div className="truncate" title={item.description || item.title}>
                          {item.description || item.title || "-"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={editFormData.department || ""}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          placeholder="Department"
                        />
                      ) : (
                        item.department || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={editFormData.register_number || ""}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, register_number: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          placeholder="Register Number"
                        />
                      ) : (
                        item.register_number || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={editFormData.phone_number || ""}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          placeholder="Phone Number"
                        />
                      ) : (
                        item.phone_number || item.phone || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.item_image_url ? (
                        <img
                          src={item.item_image_url}
                          alt="Item"
                          className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-lg"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <select
                          value={editFormData.status || "Pending"}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="px-2 py-1 rounded border border-gray-300 text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Found">Found</option>
                          <option value="Lost">Lost</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${getStatusColor(item.status)}`}>
                          {item.status || "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(item.created_at).toLocaleString() || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={editFormData.name || ""}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          placeholder="Contact Name"
                        />
                      ) : (
                        item.name || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingItem === item.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center py-12">
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
        )}

      {/* Admin Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Admin Dashboard
        </h3>
        <p className="text-sm text-gray-700">
          This dashboard provides comprehensive oversight of all lost and found items.
          Faculty members can monitor student submissions and track item statuses in real-time.
        </p>
      </div>
    </div>
  );
}