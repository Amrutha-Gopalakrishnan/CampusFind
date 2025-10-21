import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// Utility function to validate avatar URLs
const validateAvatarUrl = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache'
    });
    return response.ok;
  } catch (error) {
    console.warn('Avatar URL validation failed:', url, error);
    return false;
  }
};

// Function to clean up invalid avatar URLs from database
const cleanupInvalidAvatars = async () => {
  try {
    console.log('Starting avatar cleanup process...');
    
    // Get all profiles with avatar URLs
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, avatar_url')
      .not('avatar_url', 'is', null);

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles with avatar URLs found');
      return;
    }

    console.log(`Found ${profiles.length} profiles with avatar URLs`);

    let cleanedCount = 0;
    const invalidUrls = [];

    // Check each avatar URL
    for (const profile of profiles) {
      const isValid = await validateAvatarUrl(profile.avatar_url);
      
      if (!isValid) {
        invalidUrls.push({
          id: profile.id,
          email: profile.email,
          avatar_url: profile.avatar_url
        });
      }
    }

    console.log(`Found ${invalidUrls.length} invalid avatar URLs`);

    // Clean up invalid URLs in batches
    if (invalidUrls.length > 0) {
      const batchSize = 10;
      for (let i = 0; i < invalidUrls.length; i += batchSize) {
        const batch = invalidUrls.slice(i, i + batchSize);
        
        const updates = batch.map(item => ({
          id: item.id,
          avatar_url: null
        }));

        const { error: updateError } = await supabase
          .from('profiles')
          .upsert(updates, { onConflict: 'id' });

        if (updateError) {
          console.error('Error updating batch:', updateError);
        } else {
          cleanedCount += batch.length;
          console.log(`Cleaned up ${batch.length} invalid avatar URLs`);
        }
      }
    }

    console.log(`Avatar cleanup completed. Cleaned ${cleanedCount} invalid URLs`);
    return { cleanedCount, totalChecked: profiles.length };

  } catch (error) {
    console.error('Error during avatar cleanup:', error);
    return { cleanedCount: 0, totalChecked: 0 };
  }
};

// Function to clean up orphaned files in storage
const cleanupOrphanedFiles = async () => {
  try {
    console.log('Starting orphaned files cleanup...');
    
    // List all files in avatars bucket
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      return;
    }

    if (!files || files.length === 0) {
      console.log('No files found in avatars bucket');
      return;
    }

    console.log(`Found ${files.length} files in avatars bucket`);

    // Get all valid avatar URLs from database
    const { data: profiles } = await supabase
      .from('profiles')
      .select('avatar_url')
      .not('avatar_url', 'is', null);

    const validUrls = new Set();
    if (profiles) {
      profiles.forEach(profile => {
        if (profile.avatar_url) {
          // Extract filename from URL
          const urlParts = profile.avatar_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          validUrls.add(fileName);
        }
      });
    }

    console.log(`Found ${validUrls.size} valid avatar URLs in database`);

    // Find orphaned files
    const orphanedFiles = files.filter(file => !validUrls.has(file.name));
    
    console.log(`Found ${orphanedFiles.length} orphaned files`);

    // Delete orphaned files in batches
    if (orphanedFiles.length > 0) {
      const batchSize = 10;
      let deletedCount = 0;

      for (let i = 0; i < orphanedFiles.length; i += batchSize) {
        const batch = orphanedFiles.slice(i, i + batchSize);
        const fileNames = batch.map(file => file.name);

        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(fileNames);

        if (deleteError) {
          console.error('Error deleting batch:', deleteError);
        } else {
          deletedCount += batch.length;
          console.log(`Deleted ${batch.length} orphaned files`);
        }
      }

      console.log(`Orphaned files cleanup completed. Deleted ${deletedCount} files`);
      return { deletedCount, totalFiles: files.length };
    }

    return { deletedCount: 0, totalFiles: files.length };

  } catch (error) {
    console.error('Error during orphaned files cleanup:', error);
    return { deletedCount: 0, totalFiles: 0 };
  }
};

// Enhanced avatar upload with validation
const uploadAvatarWithValidation = async (file, userId) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a valid image file.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { 
        upsert: true,
        cacheControl: '3600',
        contentType: file.type
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // Validate the uploaded URL
    const isValid = await validateAvatarUrl(data.publicUrl);
    if (!isValid) {
      // Clean up the uploaded file
      await supabase.storage.from('avatars').remove([fileName]);
      throw new Error('Uploaded file is not accessible');
    }

    return {
      fileName,
      publicUrl: data.publicUrl,
      isValid: true
    };

  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
};

// Safe avatar URL getter with fallback
const getSafeAvatarUrl = async (profile) => {
  if (!profile?.avatar_url) return null;

  try {
    const isValid = await validateAvatarUrl(profile.avatar_url);
    if (isValid) {
      return profile.avatar_url;
    } else {
      // URL is invalid, clean it up
      console.warn('Invalid avatar URL detected, cleaning up:', profile.avatar_url);
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id);
      return null;
    }
  } catch (error) {
    console.warn('Error validating avatar URL:', error);
    return null;
  }
};

// Export utility functions
export {
  validateAvatarUrl,
  cleanupInvalidAvatars,
  cleanupOrphanedFiles,
  uploadAvatarWithValidation,
  getSafeAvatarUrl
};

// React hook for avatar management
export const useAvatarManager = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupStats, setCleanupStats] = useState(null);

  const performCleanup = async () => {
    setIsCleaning(true);
    try {
      console.log('Starting comprehensive avatar cleanup...');
      
      // Clean up invalid URLs
      const urlCleanup = await cleanupInvalidAvatars();
      
      // Clean up orphaned files
      const fileCleanup = await cleanupOrphanedFiles();
      
      const stats = {
        invalidUrlsCleaned: urlCleanup.cleanedCount,
        totalUrlsChecked: urlCleanup.totalChecked,
        orphanedFilesDeleted: fileCleanup.deletedCount,
        totalFilesChecked: fileCleanup.totalFiles,
        timestamp: new Date().toISOString()
      };
      
      setCleanupStats(stats);
      console.log('Cleanup completed:', stats);
      
      return stats;
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    } finally {
      setIsCleaning(false);
    }
  };

  return {
    isCleaning,
    cleanupStats,
    performCleanup
  };
};

// Default export for backward compatibility
export default {
  validateAvatarUrl,
  cleanupInvalidAvatars,
  cleanupOrphanedFiles,
  uploadAvatarWithValidation,
  getSafeAvatarUrl,
  useAvatarManager
};
