import { supabase } from "../supabaseClient";

/**
 * Enhanced Image Deletion Utility
 * Handles deletion of images from Supabase storage with proper error handling
 */

// Extract filename from various URL formats
const extractFileName = (imageUrl) => {
  if (!imageUrl) return null;
  
  try {
    // Handle different URL formats
    if (imageUrl.includes('/storage/v1/object/public/lost-found-images/')) {
      // Supabase public URL format
      return imageUrl.split('/storage/v1/object/public/lost-found-images/')[1];
    } else if (imageUrl.includes('/lost-found-images/')) {
      // Direct path format
      return imageUrl.split('/lost-found-images/')[1];
    } else if (imageUrl.includes('/avatars/')) {
      // Avatar URL format
      return imageUrl.split('/avatars/')[1];
    } else {
      // Fallback - get last part of URL
      const urlParts = imageUrl.split('/');
      return urlParts[urlParts.length - 1];
    }
  } catch (error) {
    console.error('Error extracting filename from URL:', imageUrl, error);
    return null;
  }
};

// Delete image from storage with retry mechanism
const deleteImageFromStorage = async (imageUrl, bucketName = 'lost-found-images', maxRetries = 3) => {
  if (!imageUrl) {
    console.log('No image URL provided for deletion');
    return { success: true, message: 'No image to delete' };
  }

  const fileName = extractFileName(imageUrl);
  if (!fileName) {
    console.error('Could not extract filename from URL:', imageUrl);
    return { success: false, message: 'Invalid image URL format' };
  }

  console.log(`Attempting to delete image: ${fileName} from bucket: ${bucketName}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Deletion attempt ${attempt}/${maxRetries} for file: ${fileName}`);
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        // If it's the last attempt, return the error
        if (attempt === maxRetries) {
          return { 
            success: false, 
            message: `Failed to delete image after ${maxRetries} attempts: ${error.message}` 
          };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      console.log(`Successfully deleted image: ${fileName}`);
      return { success: true, message: `Image deleted successfully: ${fileName}` };

    } catch (error) {
      console.error(`Attempt ${attempt} threw error:`, error);
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          message: `Exception during deletion after ${maxRetries} attempts: ${error.message}` 
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return { success: false, message: 'Unexpected error in deletion loop' };
};

// Delete multiple images in batch
const deleteMultipleImages = async (imageUrls, bucketName = 'lost-found-images') => {
  if (!imageUrls || imageUrls.length === 0) {
    return { success: true, deletedCount: 0, errors: [] };
  }

  console.log(`Starting batch deletion of ${imageUrls.length} images`);
  
  const results = [];
  const batchSize = 5; // Process in small batches to avoid overwhelming the API
  
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} images`);
    
    const batchPromises = batch.map(async (imageUrl) => {
      const result = await deleteImageFromStorage(imageUrl, bucketName);
      return { url: imageUrl, ...result };
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          url: batch[index],
          success: false,
          message: `Promise rejected: ${result.reason}`
        });
      }
    });
    
    // Small delay between batches
    if (i + batchSize < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  
  console.log(`Batch deletion completed: ${successCount} successful, ${errorCount} failed`);
  
  return {
    success: errorCount === 0,
    deletedCount: successCount,
    totalCount: imageUrls.length,
    errors: results.filter(r => !r.success)
  };
};

// Enhanced item deletion with image cleanup
const deleteItemWithImage = async (tableName, itemId, ownerEmail, bucketName = 'lost-found-images') => {
  try {
    console.log(`Starting deletion of item ${itemId} from ${tableName}`);
    
    // First, get the item to check if it has an image
    const { data: itemData, error: fetchError } = await supabase
      .from(tableName)
      .select('image_url')
      .eq('id', itemId)
      .eq('owner_email', ownerEmail)
      .single();

    if (fetchError) {
      console.error('Error fetching item for deletion:', fetchError);
      return { success: false, message: `Failed to fetch item: ${fetchError.message}` };
    }

    if (!itemData) {
      return { success: false, message: 'Item not found or access denied' };
    }

    // Delete the image if it exists
    let imageDeletionResult = { success: true, message: 'No image to delete' };
    if (itemData.image_url) {
      console.log(`Item has image URL: ${itemData.image_url}`);
      imageDeletionResult = await deleteImageFromStorage(itemData.image_url, bucketName);
      
      if (!imageDeletionResult.success) {
        console.warn('Image deletion failed, but continuing with item deletion:', imageDeletionResult.message);
      }
    }

    // Delete the item from database
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', itemId)
      .eq('owner_email', ownerEmail);

    if (deleteError) {
      console.error('Error deleting item from database:', deleteError);
      return { 
        success: false, 
        message: `Failed to delete item: ${deleteError.message}`,
        imageDeletionResult 
      };
    }

    console.log(`Successfully deleted item ${itemId} from ${tableName}`);
    
    return {
      success: true,
      message: 'Item and image deleted successfully',
      imageDeletionResult
    };

  } catch (error) {
    console.error('Unexpected error during item deletion:', error);
    return { 
      success: false, 
      message: `Unexpected error: ${error.message}` 
    };
  }
};

// Delete avatar with cleanup
const deleteAvatarWithCleanup = async (userId, avatarUrl) => {
  try {
    console.log(`Starting avatar deletion for user ${userId}`);
    
    // Delete the avatar from storage
    let imageDeletionResult = { success: true, message: 'No avatar to delete' };
    if (avatarUrl) {
      imageDeletionResult = await deleteImageFromStorage(avatarUrl, 'avatars');
      
      if (!imageDeletionResult.success) {
        console.warn('Avatar deletion failed, but continuing with profile update:', imageDeletionResult.message);
      }
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { 
        success: false, 
        message: `Failed to update profile: ${updateError.message}`,
        imageDeletionResult 
      };
    }

    console.log(`Successfully deleted avatar for user ${userId}`);
    
    return {
      success: true,
      message: 'Avatar deleted successfully',
      imageDeletionResult
    };

  } catch (error) {
    console.error('Unexpected error during avatar deletion:', error);
    return { 
      success: false, 
      message: `Unexpected error: ${error.message}` 
    };
  }
};

// Utility to check if image exists before deletion
const checkImageExists = async (imageUrl, bucketName = 'lost-found-images') => {
  if (!imageUrl) return false;
  
  try {
    const fileName = extractFileName(imageUrl);
    if (!fileName) return false;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', { search: fileName });
    
    if (error) {
      console.error('Error checking image existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception checking image existence:', error);
    return false;
  }
};

// Export all utilities
export {
  extractFileName,
  deleteImageFromStorage,
  deleteMultipleImages,
  deleteItemWithImage,
  deleteAvatarWithCleanup,
  checkImageExists
};

// Default export for backward compatibility
export default {
  extractFileName,
  deleteImageFromStorage,
  deleteMultipleImages,
  deleteItemWithImage,
  deleteAvatarWithCleanup,
  checkImageExists
};
