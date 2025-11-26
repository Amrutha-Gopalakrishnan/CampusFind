import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Upload, Camera, User, Phone, Building, Hash, MapPin, Calendar, Clock, CheckCircle, AlertCircle, LogOut, ArrowRight } from "lucide-react";
import { useAlert, CustomAlert } from "./CustomAlert";
import ImageUploader from "./components/ImageUploader";

export default function ReportLostBelonging({ user, setUser }) {
  const { alert, success, error, warning, info, hideAlert } = useAlert();
  const [authUser, setAuthUser] = useState(user || null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    name: "",
    phone: "",
    deptShift: "",
    regNo: "",
    place: "",
    date: "",
    time: "",
    status: "Lost",
    agree: false,
    handover: false,
  });
  const [compressedFile, setCompressedFile] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setAuthUser(user || null), [user]);

  useEffect(() => {
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setAuthUser(data.user);
    };
    syncUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (files, imageObjects) => {
    if (files && files.length > 0) {
      setCompressedFile(files[0]); // Take only the first compressed file
      console.log('Compressed image ready:', files[0].name, 'Size:', files[0].size / 1024, 'KB');
    } else {
      setCompressedFile(null);
    }
  };

  const deleteImageFromSupabase = async (url) => {
    try {
      const parts = url.split("/");
      const fileName = parts.slice(parts.indexOf("lost-found-images") + 1).join("/");
      await supabase.storage.from("lost-found-images").remove([fileName]);
    } catch (err) {
      console.error("Error deleting image:", err.message);
    }
  };

  const handleReupload = async () => {
    if (imageUrl) await deleteImageFromSupabase(imageUrl);
    setImageUrl("");
    setFile(null);
    document.getElementById("fileUpload").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree) return error("You must agree to the Terms of Service.", 'Agreement Required');

    const currentUserId = authUser?.id || user?.id;
    const ownerEmail = authUser?.email || user?.email;
    if (!currentUserId || !ownerEmail) return error("You must be logged in to submit.", 'Authentication Required');

    setUploading(true);

    try {
      // Upload compressed image if any
      let imageUrl = null;
      if (compressedFile) {
        // Sanitize filename to remove special characters that cause issues
        const sanitizedOriginalName = compressedFile.name
          .replace(/[{}[\]()&$#@!%^*+=|\\:";'<>?,./]/g, '_') // Replace special chars with underscore
          .replace(/\s+/g, '_') // Replace spaces with underscore
          .replace(/_+/g, '_') // Replace multiple underscores with single
          .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        
        const fileName = `${currentUserId}_${Date.now()}_${sanitizedOriginalName}`;
        
        console.log('Uploading file:', fileName);
        
        const { error: uploadError } = await supabase.storage
          .from("lost-found-images")
          .upload(fileName, compressedFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("lost-found-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // Submit form data
      const { error: insertError } = await supabase.from("lost_items").insert([
        {
          title: formData.title,
          description: formData.description,
          name: formData.name,
          phone_number: formData.phone,
          department: formData.deptShift,
          register_number: formData.regNo,
          place: formData.place,
          date: formData.date || null,
          time: formData.time || null,
          status: formData.status,
          image_url: imageUrl, // Single image URL
          owner_email: ownerEmail,
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        return error(insertError.message, 'Submission Failed');
      }

      success("Lost item reported successfully!", 'Success');
      setFormData({
        title: "",
        description: "",
        name: "",
        phone: "",
        deptShift: "",
        regNo: "",
        place: "",
        date: "",
        time: "",
        status: "Lost",
        agree: false,
        handover: false,
      });
      setCompressedFile(null);
      // Clear file input safely
      const fileInput = document.getElementById("fileUpload");
      if (fileInput) {
        fileInput.value = "";
      }

    } catch (err) {
      console.error("Submission error:", err);
      error(`Failed to submit report: ${err.message}`, 'Submission Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (typeof setUser === "function") setUser(null);
  };

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
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Report Lost Item</h2>
            <p className="text-gray-600 font-medium">Share details to help locate your lost item quickly</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Upload Image (Optional)
            </label>
            <ImageUploader
              onImagesChange={handleImageChange}
              maxImages={1}
              maxFileSize={5 * 1024 * 1024} // 5MB max original size
              targetSizeKB={100} // Compress to under 100KB
              disabled={uploading}
              className="mb-4"
            />
            
            {/* Image Summary */}
            {compressedFile && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Image compressed and ready for upload</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Final size: {(compressedFile.size / 1024).toFixed(1)}KB
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="e.g. Wallet, ID Card, Laptop Bag"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Provide a detailed description of the item you lost..."
              rows="4"
              required
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Department & Year
              </label>
              <input
                type="text"
                name="deptShift"
                value={formData.deptShift}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g. CSE 3rd Year"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Register Number
              </label>
              <input
                type="text"
                name="regNo"
                value={formData.regNo}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your register number"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Where Lost
              </label>
              <input
                type="text"
                name="place"
                value={formData.place}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g. Library, Canteen, Room 101"
              />
            </div>
          </div>

          {/* Date & Time & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Lost
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time Lost
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <input
                type="text"
                name="status"
                value={formData.status}
                readOnly
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <span className="text-sm text-gray-600">
                I confirm that all the information provided is accurate and I agree to the Terms of Service and Privacy Policy
              </span>
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="handover"
                checked={formData.handover}
                onChange={handleChange}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Handover the item to the Office after submitting this form
              </span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, title: "", description: "" })}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 px-6 py-3 text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300 font-bold shadow-lg rounded-xl hover:scale-105 flex items-center justify-center gap-2 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  Submit Lost Report
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Need Help?
        </h3>
        <p className="text-sm text-gray-700">
          If you have any questions or need assistance with your lost item report, please contact our support team at{" "}
          <a href="mailto:campusfindsrcas@gmail.com" className="text-blue-600 font-semibold hover:underline">
            campusfindsrcas@gmail.com
          </a>{" "}
          or visit the Lost & Found office in the Student Services Building.
        </p>
      </div>
    </div>
  );
}