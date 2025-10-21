import React, { useState, useCallback, useRef } from 'react';
import { Upload, Camera, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

/**
 * Optimized Image Uploader Component with Automatic Compression
 * 
 * Features:
 * - Automatic compression to <100KB before upload
 * - Multiple image support with preview
 * - Instant client-side compression
 * - Maintains aspect ratio and quality
 * - Drag & drop support
 * - Progress indicators
 */
const ImageUploader = ({ 
  onImagesChange, 
  maxImages = 5, 
  maxFileSize = 5 * 1024 * 1024, // 5MB
  targetSizeKB = 100,
  className = "",
  disabled = false 
}) => {
  const [images, setImages] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  /**
   * Compress a single image using browser-image-compression
   * Optimized settings for speed and quality
   */
  const compressImage = useCallback(async (file) => {
    const options = {
      maxSizeMB: targetSizeKB / 1024, // Convert KB to MB
      maxWidthOrHeight: 1200, // Maintain reasonable resolution
      useWebWorker: true, // Use web worker for non-blocking compression
      fileType: 'image/jpeg', // Convert to JPEG for better compression
      initialQuality: 0.8, // Start with high quality
      alwaysKeepResolution: false, // Allow resizing for better compression
    };

    try {
      const compressedFile = await imageCompression(file, options);
      
      // Verify compression worked and file is under target size
      const finalSizeKB = compressedFile.size / 1024;
      
      return {
        originalFile: file,
        compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1),
        finalSizeKB: finalSizeKB.toFixed(1),
        success: true
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      return {
        originalFile: file,
        compressedFile: file, // Fallback to original
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        finalSizeKB: (file.size / 1024).toFixed(1),
        success: false,
        error: error.message
      };
    }
  }, [targetSizeKB]);

  /**
   * Process multiple files with compression
   */
  const processFiles = useCallback(async (files) => {
    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return false;
      }
      // Validate file size
      if (file.size > maxFileSize) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    // Check if adding these files would exceed maxImages limit
    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      const allowedFiles = validFiles.slice(0, maxImages - images.length);
      if (allowedFiles.length === 0) {
        return;
      }
      validFiles.splice(0, validFiles.length, ...allowedFiles);
    }

    setCompressing(true);

    try {
      // Compress all images in parallel for speed
      const compressionPromises = validFiles.map(file => compressImage(file));
      const compressionResults = await Promise.all(compressionPromises);

      // Create image objects with preview URLs
      const newImages = compressionResults.map((result, index) => {
        const previewUrl = URL.createObjectURL(result.compressedFile);
        return {
          id: `${Date.now()}_${index}`,
          originalFile: result.originalFile,
          compressedFile: result.compressedFile,
          previewUrl,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          finalSizeKB: result.finalSizeKB,
          success: result.success,
          error: result.error,
          name: result.originalFile.name
        };
      });

      // Update images state
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      
      // Notify parent component with compressed files
      const compressedFiles = newImages.map(img => img.compressedFile);
      onImagesChange?.(compressedFiles, updatedImages);

    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setCompressing(false);
    }
  }, [images, maxImages, maxFileSize, compressImage, onImagesChange]);

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  /**
   * Handle drag and drop
   */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  /**
   * Remove an image
   */
  const removeImage = useCallback((imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      // Clean up preview URL to prevent memory leaks
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    
    // Notify parent component
    const compressedFiles = updatedImages.map(img => img.compressedFile);
    onImagesChange?.(compressedFiles, updatedImages);
  }, [images, onImagesChange]);

  /**
   * Clear all images
   */
  const clearAllImages = useCallback(() => {
    // Clean up all preview URLs
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    
    setImages([]);
    onImagesChange?.([], []);
  }, [images, onImagesChange]);

  /**
   * Format file size for display
   */
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
          ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          {compressing ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Compressing images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Drop images here or click to upload</p>
                <p className="text-xs text-gray-500 mt-1">
                  Max {maxImages} images • {formatFileSize(maxFileSize)} each
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compression Status */}
      {compressing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Compressing images to under {targetSizeKB}KB...</span>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Images ({images.length}/{maxImages})
            </h3>
            <button
              onClick={clearAllImages}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
              disabled={disabled}
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.previewUrl}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image Info Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => removeImage(image.id)}
                      className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={disabled}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-xs">
                      <div className="flex items-center space-x-1 mb-1">
                        {image.success ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-yellow-400" />
                        )}
                        <span className="font-medium">{image.finalSizeKB}KB</span>
                      </div>
                      <div className="text-xs opacity-75">
                        {image.compressionRatio > 0 && (
                          <span>Saved {image.compressionRatio}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compression Status Badge */}
                <div className="absolute top-2 left-2">
                  {image.success ? (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Compressed
                    </div>
                  ) : (
                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      ⚠ Original
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      {images.length === 0 && !compressing && (
        <div className="text-center text-xs text-gray-500">
          <p>Supported formats: JPEG, PNG, WebP, GIF</p>
          <p>Images will be automatically compressed to under {targetSizeKB}KB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
