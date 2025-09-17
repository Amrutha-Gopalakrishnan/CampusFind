// // // import { useState } from "react";
// // // import React from 'react';

// // // export default function ReportFoundBelonging() {
// // //   const [formData, setFormData] = useState({
// // //     description: "",
// // //     identity: "",
// // //   phone: "",
// // //   date: "",
// // //   time: "",
// // //     status: "Pending",
// // //     agree: false,
// // //   });

// // //   return (
// // //     <div className="flex-1 bg-gray-50 p-8">
// // //       <div className="mb-6">
// // //         <h2 className="text-2xl font-semibold text-gray-900">Report Found Belonging</h2>
// // //         <p className="text-sm text-gray-600">Share details so the owner can reclaim it quickly.</p>
// // //       </div>

// // //       <div className="bg-white rounded-xl shadow p-6">
// // //         {/* Upload Image */}
// // //         <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center mb-6">
// // //           <div className="w-20 h-20 bg-[#e6f3ef] flex items-center justify-center rounded-lg">
// // //             <span className="text-[#15735b] font-semibold">Image</span>
// // //           </div>
// // //           {/* Accessible file input */}
// // //           <input id="fileUpload" type="file" className="hidden" />
// // //           <label
// // //             htmlFor="fileUpload"
// // //             className="mt-3 px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b] cursor-pointer"
// // //           >
// // //             Choose File
// // //           </label>
// // //         </div>

// // //         {/* Description */}
// // //         <label className="block text-sm font-medium text-gray-700 mb-1">
// // //           Description <span className="text-red-500">*</span>
// // //         </label>
// // //         <textarea
// // //           className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
// // //           placeholder="Provide a detailed description of the item you found..."
// // //           rows="3"
// // //         ></textarea>

// // //         {/* Identity */}
// // //         <label className="block text-sm font-medium text-gray-700 mb-1">
// // //           Any specific Identity / Evidence
// // //         </label>
// // //         <input
// // //           type="text"
// // //           className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
// // //           placeholder="Any unique identifiers or marks on the item..."
// // //         />

// // //         {/* Posted By */}
// // //         <div className="grid grid-cols-2 gap-4 mb-4">
// // //           <div>
// // //             <label className="text-sm font-medium text-gray-700">Name</label>
// // //             <input
// // //               type="text"
              
// // //               className="w-full border rounded-lg p-2 "
// // //             />
// // //           </div>
// // //           <div>
// // //             <label className="text-sm font-medium text-gray-700">Department & Shift</label>
// // //             <input
// // //               type="email"
             
// // //               className="w-full border rounded-lg p-2"
// // //             />
// // //           </div>
// // //         </div>

// // //         {/* Contact Info */}
// // //         <div className="grid grid-cols-2 gap-4 mb-4">
// // //           <div>
// // //             <label className="text-sm font-medium text-gray-700">Register Number</label>
// // //             <input type="text" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
// // //           </div>
// // //           <div>
// // //             <label className="text-sm font-medium text-gray-700">Precise Place Lost</label>
// // //             <input type="text" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" placeholder="e.g. Library, Canteen, Room 101" />
// // //           </div>
// // //         </div>

// // //         {/* When & Where */}
// // //         <div className="grid grid-cols-3 gap-4 mb-4">
// // //           <div>
// // //             <label className="text-sm font-medium text-gray-700">Date</label>
// // //             <input type="date" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
// // //           </div>
// // //           <div>
// // //             <label className="text-sm font-medium text-gray-700">Time</label>
// // //             <input type="time" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
// // //           </div>
         
// // //            <div className="mb-4">
// // //           <label className="text-sm font-medium text-gray-700">Status</label>
// // //           <select className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]">
// // //             <option>Pending</option>
// // //             <option>Found</option>
// // //             <option>Claimed</option>
// // //           </select>
// // //         </div>
// // //         </div>



// // //         {/* Status */}
       

// // //         {/* Agreement */}
// // //         <div className="flex items-center gap-2 mb-6">
// // //           <input type="checkbox" className="h-4 w-4" />
// // //           <span className="text-sm text-gray-600">
// // //             I confirm that all the information provided is accurate and I agree
// // //             to the Terms of Service and Privacy Policy
// // //           </span>
// // //         </div>

// // //         <div className="flex items-center gap-2 mb-6">
// // //           <input type="checkbox" className="h-4 w-4" />
// // //           <span className="text-sm text-gray-600">
// // //           Handover the item to the Office after submitting this form
// // //           </span>
// // //         </div>

// // //         {/* Buttons */}
// // //         <div className="flex justify-end gap-3">
// // //           <button className="px-4 py-2 border rounded-md">Cancel</button>
// // //           <button className="px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b]">
// // //             Submit Found Report
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* Help Section */}
// // //       <div className="bg-[#e6f3ef] border border-[#c8e6dc] rounded-lg p-4 mt-6">
// // //         <h3 className="font-medium text-[#15735b] mb-1">Need Help?</h3>
// // //         <p className="text-sm text-gray-600">
// // //           If you have any questions or need assistance with your found item
// // //           report, please contact our support team at{" "}
// // //           <a
// // //             href="mailto:support@belongify.ac.in"
// // //             className="text-[#15735b] font-medium"
// // //           >
// // //             support@belongify.ac.in
// // //           </a>{" "}
// // //           or visit the Lost & Found office in the Student Services Building.
// // //         </p>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState } from "react";
// // // import { supabase } from "./supabaseClient";
// // // import { useAuth } from "./AuthProvider";

// // // export default function ReportFound() {
// // //   const { user, signOut } = useAuth();
// // //   const [formData, setFormData] = useState({
// // //     description: "",
// // //     identity: "",
// // //     name: "",
// // //     department: "",
// // //     register_number: "",
// // //     place: "",
// // //     date: "",
// // //     time: "",
// // //     status: "Pending",
// // //   });
// // //   const [file, setFile] = useState(null);

// // //   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
// // //   const handleFileChange = (e) => setFile(e.target.files[0]);

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();

// // //     if (!user) return alert("You must be logged in!");

// // //     let imageUrl = null;
// // //     if (file) {
// // //       const fileName = `${user.id}_${Date.now()}_${file.name}`;
// // //       const { error: uploadError } = await supabase.storage
// // //         .from("lost-found-images")
// // //         .upload(fileName, file);

// // //       if (uploadError) return alert(uploadError.message);

// // //       imageUrl = `${supabase.storageUrl}/object/public/lost-found-images/${fileName}`;
// // //     }

// // //     const title = formData.description.slice(0, 30); // replace with Gemini API later

// // //     const { error } = await supabase.from("found_items").insert([
// // //       {
// // //         ...formData,
// // //         title,
// // //         image_url: imageUrl,
// // //         user_id: user.id,
// // //       },
// // //     ]);

// // //     if (error) alert(error.message);
// // //     else {
// // //       alert("Found item reported successfully!");

// // //       // Check for matches in lost_items
// // //       const { data: matches } = await supabase
// // //         .from("lost_items")
// // //         .select("*")
// // //         .ilike("title", `%${title}%`);

// // //       if (matches.length > 0) {
// // //         matches.forEach(async (match) => {
// // //           await supabase.from("notifications").insert([
// // //             {
// // //               user_id: match.user_id,
// // //               message: `Found a matching item for your lost post: ${match.title}`,
// // //               read: false,
// // //             },
// // //           ]);
// // //         });
// // //       }
// // //     }

// // //     setFormData({});
// // //     setFile(null);
// // //   };

// // //   return (
// // //     <div className="p-6">
// // //       <button onClick={signOut} className="mb-4 px-3 py-1 bg-red-600 text-white rounded">
// // //         Sign Out
// // //       </button>

// // //       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-3">
// // //         <input type="file" onChange={handleFileChange} />
// // //         <input name="description" placeholder="Description" onChange={handleChange} required />
// // //         <input name="identity" placeholder="Identity/Marks" onChange={handleChange} />
// // //         <input name="name" placeholder="Your Name" onChange={handleChange} />
// // //         <input name="department" placeholder="Department" onChange={handleChange} />
// // //         <input name="register_number" placeholder="Register Number" onChange={handleChange} />
// // //         <input name="place" placeholder="Place Found" onChange={handleChange} />
// // //         <input type="date" name="date" onChange={handleChange} />
// // //         <input type="time" name="time" onChange={handleChange} />
// // //         <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
// // //           Submit Found Report
// // //         </button>
// // //       </form>
// // //     </div>
// // //   );
// // // }

// // import React, { useState } from "react";
// // import { supabase } from "./supabaseClient";

// // export default function ReportFound({ user, setUser }) {
// //   const [formData, setFormData] = useState({
// //     title: "",
// //     description: "",
// //     identity: "",
// //     place: "",
// //     date: "",
// //     time: "",
// //     status: "Pending",
// //   });
// //   const [file, setFile] = useState(null);

// //   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
// //   const handleFileChange = (e) => setFile(e.target.files[0]);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     let imageUrl = null;
// //     if (file) {
// //       const fileName = `${user.id}_${Date.now()}_${file.name}`;
// //       const { error } = await supabase.storage
// //         .from("lost-found-images")
// //         .upload(fileName, file);
// //       if (error) return alert(error.message);

// //       imageUrl = `${supabase.storageUrl}/object/public/lost-found-images/${fileName}`;
// //     }

// //     const { error: insertError } = await supabase.from("found_items").insert([
// //       {
// //         ...formData,
// //         image_url: imageUrl,
// //         user_id: user.id,
// //       },
// //     ]);

// //     if (insertError) return alert(insertError.message);
// //     alert("Found item reported successfully!");
// //     setFormData({ title: "", description: "", identity: "", place: "", date: "", time: "", status: "Pending" });
// //     setFile(null);
// //   };

// //   const handleSignOut = async () => {
// //     await supabase.auth.signOut();
// //     setUser(null);
// //   };

// //   return (
// //     <div className="p-6 max-w-md mx-auto">
// //       <div className="flex justify-between items-center mb-4">
// //         <h2 className="text-xl font-semibold">Report Found Item</h2>
// //         <button onClick={handleSignOut} className="px-3 py-1 bg-red-600 text-white rounded">Sign Out</button>
// //       </div>
// //       <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
// //         <input type="text" name="title" placeholder="Item Title" value={formData.title} onChange={handleChange} required className="w-full border p-2 rounded"/>
// //         <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="w-full border p-2 rounded"/>
// //         <input type="text" name="identity" placeholder="Any unique marks?" value={formData.identity} onChange={handleChange} className="w-full border p-2 rounded"/>
// //         <input type="text" name="place" placeholder="Where found?" value={formData.place} onChange={handleChange} required className="w-full border p-2 rounded"/>
// //         <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full border p-2 rounded"/>
// //         <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full border p-2 rounded"/>
// //         <input type="file" onChange={handleFileChange}/>
// //         <button type="submit" className="w-full py-2 bg-green-600 text-white rounded">Submit</button>
// //       </form>
// //     </div>
// //   );
// // }


// // import React, { useState } from "react";
// // import { supabase } from "./supabaseClient";

// // export default function ReportFoundBelonging({ user, setUser }) {
// //   const [formData, setFormData] = useState({
// //     description: "",
// //     identity: "",
// //     name: "",
// //     deptShift: "",
// //     regNo: "",
// //     place: "",
// //     date: "",
// //     time: "",
// //     status: "Pending",
// //     agree: false,
// //     handover: false,
// //   });
// //   const [file, setFile] = useState(null);

// //   const handleChange = (e) => {
// //     const { name, value, type, checked } = e.target;
// //     setFormData({
// //       ...formData,
// //       [name]: type === "checkbox" ? checked : value,
// //     });
// //   };

// //   const handleFileChange = (e) => setFile(e.target.files[0]);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!formData.agree) return alert("You must agree to the Terms of Service.");

// //     let imageUrl = null;
// //     if (file) {
// //       const fileName = `${user.id}_${Date.now()}_${file.name}`;
// //       const { error } = await supabase.storage
// //         .from("lost-found-images")
// //         .upload(fileName, file);
// //       if (error) return alert(error.message);
// //       imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/lost-found-images/${fileName}`;
// //     }

// //     const { error: insertError } = await supabase.from("found_items").insert([
// //       {
// //         ...formData,
// //         user_id: user.id,
// //         image_url: imageUrl,
// //       },
// //     ]);
// //     if (insertError) return alert(insertError.message);

// //     alert("Found item reported successfully!");
// //     setFormData({
// //       description: "",
// //       identity: "",
// //       name: "",
// //       deptShift: "",
// //       regNo: "",
// //       place: "",
// //       date: "",
// //       time: "",
// //       status: "Pending",
// //       agree: false,
// //       handover: false,
// //     });
// //     setFile(null);
// //   };

// //   const handleSignOut = async () => {
// //     await supabase.auth.signOut();
// //     setUser(null);
// //   };
  
// //   return (
// //     <div className="flex-1 bg-gray-50 p-8">
// //       <div className="flex justify-between items-center mb-6">
// //         <div>
// //           <h2 className="text-2xl font-semibold text-gray-900">Report Found Belonging</h2>
// //           <p className="text-sm text-gray-600">
// //             Share details so the owner can reclaim it quickly.
// //           </p>
// //         </div>
// //         <button
// //           onClick={handleSignOut}
// //           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
// //         >
// //           Sign Out
// //         </button>
// //       </div>

// //       <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
// //         {/* Upload Image */}
// //         <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center mb-6">
// //           <div className="w-20 h-20 bg-[#e6f3ef] flex items-center justify-center rounded-lg">
// //             <span className="text-[#15735b] font-semibold">Image</span>
// //           </div>
// //           <input id="fileUpload" type="file" className="hidden" onChange={handleFileChange} />
// //           <label
// //             htmlFor="fileUpload"
// //             className="mt-3 px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b] cursor-pointer"
// //           >
// //             Choose File
// //           </label>
// //         </div>

// import React, { useState } from "react";
// import { supabase } from "./supabaseClient";

// export default function ReportFoundBelonging({ user, setUser }) {
//   const [formData, setFormData] = useState({
//     description: "",
//     identity: "",
//     name: "",
//     deptShift: "",
//     regNo: "",
//     place: "",
//     date: "",
//     time: "",
//     status: "Pending",
//     agree: false,
//     handover: false,
//   });
//   const [file, setFile] = useState(null);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const handleFileChange = (e) => setFile(e.target.files[0]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.agree) return alert("You must agree to the Terms of Service.");

//     let imageUrl = null;

//     try {
//       // Upload file if selected
//       if (file) {
//         const fileName = `${user.id}_${Date.now()}_${file.name}`;
//         const { error: uploadError } = await supabase.storage
//           .from("lost-found-images")
//           .upload(fileName, file, {
//             cacheControl: "3600",
//             upsert: false,
//           });

//         if (uploadError) {
//           console.error("Upload error:", uploadError.message);
//           alert("Image upload failed: " + uploadError.message);
//           return;
//         }

//         // Public URL
//         const { data: publicUrlData } = supabase.storage
//           .from("lost-found-images")
//           .getPublicUrl(fileName);

//         imageUrl = publicUrlData.publicUrl;
//       }

//       // Insert into found_items table
//       const { error: insertError } = await supabase.from("found_items").insert([
//         {
//           description: formData.description,
//           identity: formData.identity,
//           name: formData.name,
//           department: formData.deptShift,
//           register_number: formData.regNo,
//           place: formData.place,
//           date: formData.date,
//           time: formData.time,
//           status: formData.status,
//           user_id: user.id,
//           image_url: imageUrl,
//         },
//       ]);

//       if (insertError) {
//         console.error("Insert error:", insertError.message);
//         alert("Error saving item: " + insertError.message);
//         return;
//       }

//       alert("Found item reported successfully!");
//       setFormData({
//         description: "",
//         identity: "",
//         name: "",
//         deptShift: "",
//         regNo: "",
//         place: "",
//         date: "",
//         time: "",
//         status: "Pending",
//         agree: false,
//         handover: false,
//       });
//       setFile(null);
//     } catch (err) {
//       console.error("Unexpected error:", err.message);
//       alert("Unexpected error: " + err.message);
//     }
//   };

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//   };

//   return (
//     <div className="flex-1 bg-gray-50 p-8">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-900">
//             Report Found Belonging
//           </h2>
//           <p className="text-sm text-gray-600">
//             Share details so the owner can reclaim it quickly.
//           </p>
//         </div>
//         <button
//           onClick={handleSignOut}
//           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//         >
//           Sign Out
//         </button>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className="bg-white rounded-xl shadow p-6 space-y-4"
//       >
//         {/* Upload Image */}
//         <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center mb-6">
//           <div className="w-20 h-20 bg-[#e6f3ef] flex items-center justify-center rounded-lg">
//             <span className="text-[#15735b] font-semibold">Image</span>
//           </div>
//           <input
//             id="fileUpload"
//             type="file"
//             className="hidden"
//             onChange={handleFileChange}
//           />
//           <label
//             htmlFor="fileUpload"
//             className="mt-3 px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b] cursor-pointer"
//           >
//             Choose File
//           </label>
//         </div>

//         {/* Description */}
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Description <span className="text-red-500">*</span>
//         </label>
//         <textarea
//           name="description"
//           value={formData.description}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
//           placeholder="Provide a detailed description of the item you found..."
//           rows="3"
//           required
//         />

//         {/* Identity */}
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Any specific Identity / Evidence
//         </label>
//         <input
//           type="text"
//           name="identity"
//           value={formData.identity}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
//           placeholder="Any unique identifiers or marks on the item..."
//         />

//         {/* Posted By */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="text-sm font-medium text-gray-700">Name</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2"
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700">Department & Shift</label>
//             <input
//               type="text"
//               name="deptShift"
//               value={formData.deptShift}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2"
//             />
//           </div>
//         </div>

//         {/* Contact Info */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="text-sm font-medium text-gray-700">Register Number</label>
//             <input
//               type="text"
//               name="regNo"
//               value={formData.regNo}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700">Precise Place Found</label>
//             <input
//               type="text"
//               name="place"
//               value={formData.place}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
//               placeholder="e.g. Library, Canteen, Room 101"
//             />
//           </div>
//         </div>

//         {/* When & Where */}
//         <div className="grid grid-cols-3 gap-4 mb-4">
//           <div>
//             <label className="text-sm font-medium text-gray-700">Date</label>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700">Time</label>
//             <input
//               type="time"
//               name="time"
//               value={formData.time}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-700">Status</label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
//             >
//               <option>Pending</option>
//               <option>Found</option>
//               <option>Claimed</option>
//             </select>
//           </div>
//         </div>

//         {/* Agreement */}
//         <div className="flex items-center gap-2 mb-6">
//           <input
//             type="checkbox"
//             name="agree"
//             checked={formData.agree}
//             onChange={handleChange}
//             className="h-4 w-4"
//           />
//           <span className="text-sm text-gray-600">
//             I confirm that all the information provided is accurate and I agree
//             to the Terms of Service and Privacy Policy
//           </span>
//         </div>

//         <div className="flex items-center gap-2 mb-6">
//           <input
//             type="checkbox"
//             name="handover"
//             checked={formData.handover}
//             onChange={handleChange}
//             className="h-4 w-4"
//           />
//           <span className="text-sm text-gray-600">
//             Handover the item to the Office after submitting this form
//           </span>
//         </div>

//          <div className="flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={() =>
//               setFormData({ ...formData, description: "", identity: "" })
//             }
//             className="px-4 py-2 border rounded-md"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b]"
//           >
//             Submit Found Report
//           </button>
//         </div>
//       </form>

//       {/* Help Section */}
//       <div className="bg-[#e6f3ef] border border-[#c8e6dc] rounded-lg p-4 mt-6">
//         <h3 className="font-medium text-[#15735b] mb-1">Need Help?</h3>
//         <p className="text-sm text-gray-600">
//           If you have any questions or need assistance with your found item
//           report, please contact our support team at{" "}
//           <a
//             href="mailto:support@belongify.ac.in"
//             className="text-[#15735b] font-medium"
//           >
//             support@belongify.ac.in
//           </a>{" "}
//           or visit the Lost & Found office in the Student Services Building.
//         </p>
//       </div>
//     </div>
//   );
// }

// //         {/* Buttons */}
// //         <div className="flex justify-end gap-3">
// //           <button
// //             type="button"
// //             onClick={() =>
// //               setFormData({ ...formData, description: "", identity: "" })
// //             }
// //             className="px-4 py-2 border rounded-md"
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             type="submit"
// //             className="px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b]"
// //           >
// //             Submit Found Report
// //           </button>
// //         </div>
// //       </form>

// //       {/* Help Section */}
// //       <div className="bg-[#e6f3ef] border border-[#c8e6dc] rounded-lg p-4 mt-6">
// //         <h3 className="font-medium text-[#15735b] mb-1">Need Help?</h3>
// //         <p className="text-sm text-gray-600">
// //           If you have any questions or need assistance with your found item
// //           report, please contact our support team at{" "}
// //           <a
// //             href="mailto:support@belongify.ac.in"
// //             className="text-[#15735b] font-medium"
// //           >
// //             support@belongify.ac.in
// //           </a>{" "}
// //           or visit the Lost & Found office in the Student Services Building.
// //         </p>
// //       </div>
// //     </div>
// //   )
// // }

import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function ReportFoundBelonging({ user, setUser }) {
  const [authUser, setAuthUser] = useState(user || null);
  const [formData, setFormData] = useState({
    description: "",
    identity: "",
    name: "",
    deptShift: "",
    regNo: "",
    place: "",
    date: "",
    time: "",
    status: "Pending",
    agree: false,
    handover: false,
  });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAuthUser(user || null);
  }, [user]);

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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // File upload

const handleFileChange = async (e) => {
  const selected = e.target.files && e.target.files[0];
  if (!selected) return;
  if (!authUser?.id) {
    alert("You must be logged in to upload an image.");
    return;
  }

  setUploading(true);

  // Remove old image if any
  if (imageUrl) {
    await deleteImageFromSupabase(imageUrl);
    setImageUrl("");
    setFile(null);
  }

  setFile(selected);

  // Unique file path
  const fileName = `${authUser.id}_${Date.now()}_${selected.name}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("lost-found-images")
    .upload(fileName, selected, { upsert: true });

  if (uploadError) {
    setUploading(false);
    console.error("Upload error:", uploadError);
    return alert(uploadError.message);
  }

  // ✅ Get public URL after upload
  const { data: publicUrlData } = supabase.storage
    .from("lost-found-images")
    .getPublicUrl(fileName);

  setImageUrl(publicUrlData.publicUrl);
  setUploading(false);
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
    if (!formData.agree) return alert("You must agree to the Terms of Service.");

    const currentUserId = authUser?.id || user?.id;
    if (!currentUserId) return alert("You must be logged in to submit.");

    const { error: insertError } = await supabase.from("found_items").insert([
      {
        description: formData.description,
        identity: formData.identity,
        name: formData.name,
        department: formData.deptShift, // mapped
        register_number: formData.regNo, // mapped
        place: formData.place,
        date: formData.date || null,
        time: formData.time || null,
        status: formData.status,
        image_url: imageUrl || null,
       
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return alert(insertError.message);
    }

    alert("Found item reported successfully!");
    setFormData({
      description: "",
      identity: "",
      name: "",
      deptShift: "",
      regNo: "",
      place: "",
      date: "",
      time: "",
      status: "Pending",
      agree: false,
      handover: false,
     
    });
    setFile(null);
    setImageUrl("");
    document.getElementById("fileUpload").value = "";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (typeof setUser === "function") setUser(null);
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Report Found Belonging
          </h2>
          <p className="text-sm text-gray-600">
            Share details so the user can share the information quickly.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        {/* Upload Image */}
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 bg-[#e6f3ef] flex items-center justify-center rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded"
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="text-[#15735b] font-semibold">Image</span>
            )}
          </div>
          <input
            id="fileUpload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={!!imageUrl || uploading}
          />
          {!imageUrl && (
            <label
              htmlFor="fileUpload"
              className={`mt-3 px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b] cursor-pointer ${
                uploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {uploading ? "Uploading..." : "Choose File"}
            </label>
          )}
          {imageUrl && (
            <button
              type="button"
              className="mt-3 px-4 py-2 bg-[#1e40af] text-white rounded-md hover:bg-[#1e3a8a] transition-colors"
              onClick={handleReupload}
            >
              Reupload
            </button>
          )}
        </div>

        {/* Description */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
          placeholder="Provide a detailed description of the item you found..."
          rows="3"
          required
        />

        {/* Identity */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Any specific Identity / Evidence
        </label>
        <input
          type="text"
          name="identity"
          value={formData.identity}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
          placeholder="Any unique identifiers or marks on the item..."
        />

        {/* Posted By */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Department & Shift
            </label>
            <input
              type="text"
              name="deptShift"
              value={formData.deptShift}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Register Number
            </label>
            <input
              type="text"
              name="regNo"
              value={formData.regNo}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Precise Place Found
            </label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
              placeholder="e.g. Library, Canteen, Room 101"
            />
          </div>
        </div>

        {/* When & Where */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
            >
              <option>Pending</option>
              <option>Found</option>
              <option>Claimed</option>
               <option>Lost</option>
            </select>
          </div>
        </div>

        {/* Agreement */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-600">
            I confirm that all the information provided is accurate and I agree
            to the Terms of Service and Privacy Policy
          </span>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            name="handover"
            checked={formData.handover}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-600">
            Handover the item to the Office after submitting this form
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, description: "", identity: "" })
            }
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b]"
          >
            Submit Found Report
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="bg-[#e6f3ef] border border-[#c8e6dc] rounded-lg p-4 mt-6">
        <h3 className="font-medium text-[#15735b] mb-1">Need Help?</h3>
        <p className="text-sm text-gray-600">
          If you have any questions or need assistance with your found item
          report, please contact our support team at{" "}
          <a
            href="mailto:support@belongify.ac.in"
            className="text-[#15735b] font-medium"
          >
            support@belongify.ac.in
          </a>{" "}
          or visit the Lost & Found office in the Student Services Building.
        </p>
      </div>
    </div>
  );
}


