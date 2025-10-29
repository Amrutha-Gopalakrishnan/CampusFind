import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { User, Camera, Save, Edit, Trash2, Eye, MapPin, Calendar, Hash, Phone, Mail, GraduationCap, Building, Sparkles, Upload, CheckCircle, AlertCircle, X, RefreshCw, Shield } from "lucide-react";
import { useAlert, useConfirm, CustomAlert, CustomConfirm } from "./CustomAlert";
import { uploadAvatarWithValidation, getSafeAvatarUrl, useAvatarManager } from "./utils/avatarManager";
import { deleteItemWithImage, deleteAvatarWithCleanup } from "./utils/imageDeletion";

export default function Profile({ user }) {
  const { alert, success, error, warning, info, hideAlert } = useAlert();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
  const { isCleaning, cleanupStats, performCleanup } = useAvatarManager();
  const [profile, setProfile] = useState({ 
    fullName: "", 
    email: user?.email || "", 
    phone: "", 
    altPhone: "", 
    role: "Student", 
    avatar_url: "",
    department: "",
    reg_number: "",
    dept_year: ""
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [activeTab, setActiveTab] = useState("profile");
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deletingItems, setDeletingItems] = useState(new Set());

  // --- Fetch profile ---
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
      const { data, error } = await supabase.rpc('get_user_profile');
      if (error) {
        console.error("Profile fetch error:", error);
        setLoading(false);
        return;
      }
        if (data && data.length > 0) {
          const profileData = data[0];
            console.log('Profile.jsx: Profile loaded with avatar:', profileData.avatar_url);
            console.log('Profile.jsx: Full profile data:', profileData);
          setProfile({ 
            fullName: profileData.full_name, 
            email: profileData.email, 
            phone: profileData.phone || "", 
            altPhone: profileData.alt_phone || "", 
            role: profileData.role || "Student", 
            avatar_url: profileData.avatar_url || "",
            department: profileData.department || "",
            reg_number: profileData.reg_number || "",
            dept_year: profileData.dept_year || ""
          });
            if (profileData.avatar_url) {
              // Check if the avatar URL looks like a deleted file (contains specific patterns)
              if (profileData.avatar_url.includes('dcaa5e7c-199a-4dc6-88a8-e7257e49469c') || 
                  profileData.avatar_url.includes('1760597506073') ||
                  profileData.avatar_url.includes('1760598516360')) {
                console.log('Profile.jsx: Detected invalid avatar URL, cleaning up...');
                // Clean up the invalid URL immediately
                setTimeout(async () => {
                  await cleanupInvalidAvatar();
                }, 1000);
              } else {
                setAvatarPreview(profileData.avatar_url);
                console.log('Profile.jsx: Avatar preview set to:', profileData.avatar_url);
                console.log('Profile.jsx: Avatar URL is valid:', !!profileData.avatar_url);
              }
            } else {
              setAvatarPreview(null);
              console.log('Profile.jsx: No avatar URL, preview cleared');
            }
        } else {
          console.log('Profile.jsx: No profile data found - profile may not exist');
          // If no profile exists, we should create one
          console.log('Profile.jsx: Attempting to create profile for user:', user.email);
          
          // Determine user role based on email pattern
          const emailPrefix = user.email?.split("@")[0] || "";
          const isFacultyEmail = /[a-zA-Z]/.test(emailPrefix) || user.email === "ammugopal1116@gmail.com";
          const userRole = isFacultyEmail ? "Faculty" : "Student";
          
          console.log('Profile.jsx: Email analysis:', {
            email: user.email,
            emailPrefix: emailPrefix,
            hasLetters: /[a-zA-Z]/.test(emailPrefix),
            isTestEmail: user.email === "ammugopal1116@gmail.com",
            isFacultyEmail: isFacultyEmail,
            userRole: userRole
          });
          
          // Create a basic profile entry
          const { error: createError } = await supabase.rpc('create_user_profile', {
            user_id: user.id,
            user_email: user.email,
            user_name: user.email?.split("@")[0] || "User",
            user_role: userRole,
            user_department: null,
            user_reg_number: null,
            user_dept_year: null,
            user_phone: null,
            user_alt_phone: null,
            user_avatar_url: null
          });
          
          if (createError) {
            console.error('Profile creation error:', createError);
          } else {
            console.log('Profile created successfully');
            // Retry fetching the profile
            const { data: retryData, error: retryError } = await supabase.rpc('get_user_profile');
            if (!retryError && retryData && retryData.length > 0) {
              const profileData = retryData[0];
              setProfile({ 
                fullName: profileData.full_name, 
                email: profileData.email, 
                phone: profileData.phone || "", 
                altPhone: profileData.alt_phone || "", 
                role: profileData.role || "Student", 
                avatar_url: profileData.avatar_url || "",
                department: profileData.department || "",
                reg_number: profileData.reg_number || "",
                dept_year: profileData.dept_year || ""
              });
            }
          }
        }
      } catch (err) {
        console.error('Profile.jsx: Error in fetchProfile:', err);
      }
      setLoading(false);
    };
    fetchProfile();
    
    // Set up realtime subscription to listen for profile updates
    const profileSubscription = supabase
      .channel('profile_changes_profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `email=eq.${user.email}`
        },
        (payload) => {
          console.log('Profile.jsx: Profile updated via realtime:', payload.new);
          const profileData = payload.new;
          setProfile(prev => ({ 
            ...prev,
            fullName: profileData.full_name, 
            email: profileData.email, 
            phone: profileData.phone || "", 
            altPhone: profileData.alt_phone || "", 
            role: profileData.role || "Student", 
            avatar_url: profileData.avatar_url || "",
            department: profileData.department || "",
            reg_number: profileData.reg_number || "",
            dept_year: profileData.dept_year || ""
          }));
          if (profileData.avatar_url) {
            setAvatarPreview(profileData.avatar_url);
          } else {
            setAvatarPreview(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [user]);

  // --- Fetch lost/found items only for students ---
  useEffect(() => {
    if (!user || profile.role === "Faculty") return;

    const fetchItems = async () => {
      setItemsLoading(true);
      const { data: lostData } = await supabase.from("lost_items").select("*").eq("owner_email", user.email);
      const { data: foundData } = await supabase.from("found_items").select("*").eq("owner_email", user.email);
      
      // Attach signed URLs to lost items
      if (lostData) {
        const lostWithUrls = await Promise.all(
          lostData.map(async (item) => ({
            ...item,
            image_display_url: await toSignedUrlIfNeeded(item.image_url),
          }))
        );
        setLostItems(lostWithUrls);
      }

      // Attach signed URLs to found items
      if (foundData) {
        const foundWithUrls = await Promise.all(
          foundData.map(async (item) => ({
            ...item,
            image_display_url: await toSignedUrlIfNeeded(item.image_url),
          }))
        );
        setFoundItems(foundWithUrls);
      }
      
      setItemsLoading(false);
    };

    fetchItems();
  }, [user, profile.role]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  // Force refresh profile data
  const forceRefreshProfile = async () => {
    setLoading(true);
    try {
      // Clear all avatar-related state
      setAvatarPreview(null);
      
      // Clear any cached images
      const avatarImages = document.querySelectorAll('img[alt="Avatar"]');
      avatarImages.forEach(img => {
        img.style.display = 'none';
      });
      
      // Fetch fresh profile data
      const { data, error } = await supabase.rpc('get_user_profile');
      if (!error && data && data.length > 0) {
        const profileData = data[0];
        setProfile({ 
          fullName: profileData.full_name, 
          email: profileData.email, 
          phone: profileData.phone || "", 
          altPhone: profileData.alt_phone || "", 
          role: profileData.role || "Student", 
          avatar_url: profileData.avatar_url || "",
          department: profileData.department || "",
          reg_number: profileData.reg_number || "",
          dept_year: profileData.dept_year || ""
        });
        
        if (profileData.avatar_url) {
          setAvatarPreview(profileData.avatar_url);
        } else {
          setAvatarPreview(null);
        }
      }
    } catch (err) {
      console.error('Force refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clean up invalid avatar URLs from database
  const cleanupInvalidAvatar = async () => {
    try {
      console.log('Cleaning up invalid avatar URL from database...');
      const { error } = await supabase.rpc('update_user_profile', {
        new_full_name: profile.fullName,
        new_department: profile.department || null,
        new_reg_number: profile.reg_number || null,
        new_dept_year: profile.dept_year || null,
        new_phone: profile.phone || null,
        new_alt_phone: profile.altPhone || null,
        new_avatar_url: null
      });

      if (error) {
        console.error('Failed to cleanup avatar URL:', error);
      } else {
        console.log('Avatar URL cleaned up successfully');
        // Update local state
        setProfile(prev => ({ ...prev, avatar_url: "" }));
        setAvatarPreview(null);
      }
    } catch (err) {
      console.error('Cleanup avatar error:', err);
    }
  };

  // Enhanced avatar upload function with validation
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Delete old avatar if it exists
      if (profile.avatar_url) {
        await deleteOldAvatar(profile.avatar_url);
      }

      // Use the enhanced upload function with validation
      const uploadResult = await uploadAvatarWithValidation(file, user.id);
      
      console.log('Avatar uploaded successfully:', uploadResult.publicUrl);

      // Update profile state immediately
      setAvatarPreview(uploadResult.publicUrl);
      setProfile(prev => ({ ...prev, avatar_url: uploadResult.publicUrl }));
      
      // Save to database
      const { error: updateError } = await supabase.rpc('update_user_profile', {
        new_full_name: profile.fullName,
        new_department: profile.department || null,
        new_reg_number: profile.reg_number || null,
        new_dept_year: profile.dept_year || null,
        new_phone: profile.phone || null,
        new_alt_phone: profile.altPhone || null,
        new_avatar_url: uploadResult.publicUrl
      });

      if (updateError) {
        console.error('Database update error:', updateError);
        error('Avatar uploaded but failed to save to profile: ' + updateError.message, 'Database Error');
        return;
      }

      success('Avatar updated successfully!', 'Success');
      
      // Verify the avatar URL was saved correctly
      const { data: verifyData, error: verifyError } = await supabase.rpc('get_user_profile');
      if (!verifyError && verifyData && verifyData.length > 0) {
        const savedProfile = verifyData[0];
        
        // Update local state with verified data
        setProfile(prev => ({ ...prev, avatar_url: savedProfile.avatar_url }));
        setAvatarPreview(savedProfile.avatar_url);
      }

    } catch (error) {
      console.error('Avatar upload error:', error);
      error('Failed to upload avatar: ' + error.message, 'Upload Error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Saving profile with data:', {
        fullName: profile.fullName,
        department: profile.department,
        reg_number: profile.reg_number,
        dept_year: profile.dept_year,
        phone: profile.phone,
        altPhone: profile.altPhone,
        avatar_url: profile.avatar_url
      });

    const { error } = await supabase.rpc('update_user_profile', {
      new_full_name: profile.fullName,
      new_department: profile.department || null,
      new_reg_number: profile.reg_number || null,
      new_dept_year: profile.dept_year || null,
      new_phone: profile.phone || null,
      new_alt_phone: profile.altPhone || null,
      new_avatar_url: profile.avatar_url || null
    });

      if (error) {
        console.error('Profile save error:', error);
        error("Failed to update profile: " + error.message, 'Update Failed');
        return;
      }

      console.log('Profile saved successfully to database');
      success("Profile updated successfully!", 'Success');

      // Verify the save by fetching the updated profile
      const { data: verifyData, error: verifyError } = await supabase.rpc('get_user_profile');
      if (!verifyError && verifyData && verifyData.length > 0) {
        const savedProfile = verifyData[0];
        console.log('Profile verification - saved data:', {
          full_name: savedProfile.full_name,
          department: savedProfile.department,
          reg_number: savedProfile.reg_number,
          dept_year: savedProfile.dept_year,
          phone: savedProfile.phone,
          alt_phone: savedProfile.alt_phone,
          avatar_url: savedProfile.avatar_url
        });
      }

    } catch (err) {
      console.error('Profile save error:', err);
      error("Failed to update profile: " + err.message, 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete old avatar from storage
  const deleteOldAvatar = async (avatarUrl) => {
    if (!avatarUrl) return;
    
    try {
      // Extract filename from URL - handle different URL formats
      let fileName;
      if (avatarUrl.includes('/storage/v1/object/public/avatars/')) {
        // Supabase public URL format
        fileName = avatarUrl.split('/storage/v1/object/public/avatars/')[1];
      } else if (avatarUrl.includes('/avatars/')) {
        // Direct path format
        fileName = avatarUrl.split('/avatars/')[1];
      } else {
        // Fallback - get last part of URL
        const urlParts = avatarUrl.split('/');
        fileName = urlParts[urlParts.length - 1];
      }
      
      console.log('Deleting old avatar:', fileName);
      
      const { error } = await supabase.storage
        .from('avatars')
        .remove([fileName]);
      
      if (error) {
        console.error('Error deleting old avatar:', error);
        // Don't throw error, just log it as it's not critical
      } else {
        console.log('Old avatar deleted successfully');
      }
    } catch (error) {
      console.error('Error in deleteOldAvatar:', error);
    }
  };

  // Enhanced delete avatar function with cleanup
  const handleDeleteAvatar = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete your avatar?",
      "This will remove your profile picture from storage.",
      "Delete Avatar",
      "Cancel"
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      console.log('Starting avatar deletion for user:', user.id);
      
      // Use the enhanced avatar deletion function
      const result = await deleteAvatarWithCleanup(user.id, profile.avatar_url);
      
      if (result.success) {
        // Update local state immediately
        setProfile(prev => ({ ...prev, avatar_url: "" }));
        setAvatarPreview(null);

        // Show success message with image deletion info
        if (result.imageDeletionResult.success) {
          success("Avatar deleted successfully!", 'Avatar Deleted');
        } else {
          warning(`Avatar removed from profile, but image deletion failed: ${result.imageDeletionResult.message}`, 'Partial Success');
        }
        
        // Clear any cached images by updating the image src with cache-busting
        const avatarImages = document.querySelectorAll('img[alt="Avatar"]');
        avatarImages.forEach(img => {
          img.style.display = 'none';
        });
        
        console.log('Avatar deleted - UI updated immediately');
      } else {
        error(`Failed to delete avatar: ${result.message}`, 'Delete Failed');
      }

    } catch (error) {
      console.error('Delete avatar error:', error);
      error("Failed to delete avatar: " + error.message, 'Delete Failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get post ID
  const getPostId = (uuid) => uuid?.slice(-4).toUpperCase() || "-";

  // Helper function to create signed URL for images
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

  // Edit item function
  const handleEditItem = (table, item) => {
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

    const tableName = activeTab === "lost" ? "lost_items" : "found_items";
    
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

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", editingItem)
        .eq("owner_email", user.email)
        .select();

      if (error) {
        console.error('Update error details:', error);
        error("Failed to update item: " + error.message, 'Update Failed');
        return;
      }

      console.log('Update successful:', data);

      // Update local state
      if (tableName === "lost_items") {
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
  const handleDeleteItem = async (table, id) => {
    // Check if this item is already being deleted
    if (deletingItems.has(id)) {
      warning("This item is already being deleted. Please wait...", 'Deletion in Progress');
      return;
    }

    // Check if there are other items being deleted
    if (deletingItems.size > 0) {
      warning("Another item is currently being deleted. This deletion may take a moment longer.", 'Multiple Deletions');
    }

    const confirmed = await showConfirm(
      "Are you sure you want to delete this item? This action cannot be undone.",
      { 
        title: 'Delete Item', 
        confirmText: 'Delete', 
        cancelText: 'Cancel',
        type: 'danger'
      }
    );
    
    if (!confirmed) return;
    
    // Add to deleting set
    setDeletingItems(prev => new Set([...prev, id]));
    
    try {
      console.log(`Starting deletion of item ${id} from ${table}`);
      
      // Use the enhanced deletion function
      const result = await deleteItemWithImage(table, id, user.email);
      
      if (result.success) {
        // Update local state
        if (table === "lost_items") {
          setLostItems((prev) => prev.filter((i) => i.id !== id));
        } else {
          setFoundItems((prev) => prev.filter((i) => i.id !== id));
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
        newSet.delete(id);
        return newSet;
      });
    }
  };

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

  if (!user) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/20 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Loading User</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Please wait while we load your profile information...
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/20 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Loading Profile</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Please wait while we load your profile information...
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6 lg:p-8">
      {/* Custom Alert Components */}
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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">My Profile</h2>
            <p className="text-gray-600 font-medium">Manage your account and view your items</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
        <div className="flex gap-2">
        {profile.role === "Student" && ["profile", "lost", "found"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/80 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        {profile.role === "Faculty" && (
            <button className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
              Profile
            </button>
        )}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="lg:w-1/3">
              <div className="text-center">
                <div className="relative inline-block">
                  {(() => {
                    // Show actual avatar for both students and faculty
                    const avatarUrl = avatarPreview || profile.avatar_url;
                    console.log('Profile.jsx: Avatar display check - avatarPreview:', avatarPreview, 'profile.avatar_url:', profile.avatar_url, 'final URL:', avatarUrl);
                    
                    // Only show image if avatarUrl exists and is not empty/null
                    if (avatarUrl && avatarUrl.trim() !== '') {
                      return (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
                          onError={async (e) => {
                            console.error('Avatar image failed to load:', e.target.src);
                            // Hide the image and show fallback
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                            // Clear the avatar URL from state to prevent further attempts
                            setProfile(prev => ({ ...prev, avatar_url: "" }));
                            setAvatarPreview(null);
                            // Clean up the invalid URL from database
                            await cleanupInvalidAvatar();
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                  {(() => {
                    // Show fallback avatar for both students and faculty if no image uploaded
                    const hasAvatar = (avatarPreview && avatarPreview.trim() !== '') || (profile.avatar_url && profile.avatar_url.trim() !== '');
                    return (
                      <div 
                        className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-white shadow-2xl ${hasAvatar ? 'hidden' : 'flex'}`}
                      >
                        <User className="w-16 h-16 text-white" />
                      </div>
                    );
                  })()}
                  {(() => {
                    // Show camera upload button for both students and faculty
                    return (
                      <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                        <Camera className="w-5 h-5 text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleAvatarUpload(e.target.files[0])} 
                          disabled={uploading} 
                          className="hidden"
                        />
                      </label>
                    );
                  })()}
                </div>
                {uploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mt-4">
                  {profile.fullName || "No Name"}
                </h3>
                <p className="text-gray-600">{profile.role}</p>
              </div>
          </div>

            {/* Profile Form */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
        </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Alternative Phone
                  </label>
                  <input
                    type="text"
                    name="altPhone"
                    value={profile.altPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter alternative phone number"
                  />
                </div>

                {/* Department field for both Students and Faculty */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your department"
                  />
                </div>

                {/* Student-specific fields */}
                {profile.role === "Student" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="reg_number"
                        value={profile.reg_number}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your registration number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Year
                      </label>
                      <input
                        type="text"
                        name="dept_year"
                        value={profile.dept_year}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your year"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={loading || !profile.avatar_url}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Avatar
                  </button>
                  
                  <button
                    onClick={async () => {
                      await forceRefreshProfile();
                      success("Profile refreshed successfully!", 'Refresh Complete');
                    }}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        const stats = await performCleanup();
                        success(`Cleanup completed! Cleaned ${stats.invalidUrlsCleaned} invalid URLs and ${stats.orphanedFilesDeleted} orphaned files.`, 'Cleanup Complete');
                      } catch (error) {
                        error('Cleanup failed: ' + error.message, 'Cleanup Error');
                      }
                    }}
                    disabled={loading || isCleaning}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCleaning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Cleaning...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Clean All Avatars
                      </>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lost Items Tab */}
      {profile.role === "Student" && activeTab === "lost" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              My Lost Items
            </h3>
            <p className="text-gray-600 mt-2">Track the status of your lost items</p>
          </div>

          <div className="p-6">
          {itemsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Loading items...</span>
                </div>
              </div>
          ) : lostItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Lost Items</h4>
                <p className="text-gray-500">You haven't reported any lost items yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Post ID
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
                {lostItems.map((item) => (
                      <tr key={item.id} className="hover:bg-white/60 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingItem === item.id ? (
                            <input
                              type="text"
                              value={editFormData.title || ""}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                              placeholder="Title"
                            />
                          ) : (
                            item.title
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                          {editingItem === item.id ? (
                            <input
                              type="text"
                              value={editFormData.description || ""}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                              placeholder="Description"
                            />
                          ) : (
                            <div className="truncate" title={item.description}>
                      {item.description}
                            </div>
                          )}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                      {item.image_display_url ? (
                        <img
                          src={item.image_display_url}
                          alt={item.title}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-lg"
                        />
                      ) : (
                            <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.location}
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
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {getPostId(item.id)}
                            </div>
                          </div>
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
                        onClick={() => handleEditItem("lost_items", item)}
                                className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                      >
                                <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem("lost_items", item.id)}
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                      >
                                <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                            </div>
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
          )}
          </div>
        </div>
      )}

      {/* Found Items Tab */}
      {profile.role === "Student" && activeTab === "found" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              My Found Items
            </h3>
            <p className="text-gray-600 mt-2">Track the status of your found items</p>
          </div>

          <div className="p-6">
          {itemsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Loading items...</span>
                </div>
              </div>
          ) : foundItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Found Items</h4>
                <p className="text-gray-500">You haven't reported any found items yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-green-600/10 to-emerald-600/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Post ID
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
                {foundItems.map((item) => (
                      <tr key={item.id} className="hover:bg-white/60 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingItem === item.id ? (
                            <input
                              type="text"
                              value={editFormData.title || ""}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                              placeholder="Title"
                            />
                          ) : (
                            item.title
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                          {editingItem === item.id ? (
                            <input
                              type="text"
                              value={editFormData.description || ""}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                              placeholder="Description"
                            />
                          ) : (
                            <div className="truncate" title={item.description}>
                      {item.description}
                            </div>
                          )}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                      {item.image_display_url ? (
                        <img
                          src={item.image_display_url}
                          alt={item.title}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-lg"
                        />
                      ) : (
                            <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.location}
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
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {getPostId(item.id)}
                            </div>
                          </div>
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
                        onClick={() => handleEditItem("found_items", item)}
                                className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                      >
                                <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem("found_items", item.id)}
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                      >
                                <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                            </div>
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
          )}
          </div>
        </div>
      )}

      {/* Profile Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Profile Management
        </h3>
        <p className="text-sm text-gray-700">
          Keep your profile information up to date. Students can also manage their lost and found items from this page.
        </p>
      </div>
    </div>
  );
}