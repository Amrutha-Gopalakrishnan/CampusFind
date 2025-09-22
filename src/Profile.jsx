import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Profile({ user }) {
  const [profile, setProfile] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    altPhone: "",
    role: "Student",
    avatar_url: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [activeTab, setActiveTab] = useState("profile");
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // --- Fetch profile ---
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .single();

      if (error && error.code !== "PGRST116") console.error(error);
      if (data) {
        setProfile({
          fullName: data.full_name || "",
          email: data.email,
          phone: data.phone || "",
          altPhone: data.alt_phone || "",
          role: data.role || "Student",
          avatar_url: data.avatar_url || "",
        });

        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // --- Helper: create signed URL if needed ---
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

  // --- Fetch lost and found items for this user ---
  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      setItemsLoading(true);
      const { data: lostData, error: lostError } = await supabase
        .from("lost_items")
        .select("*")
        .eq("owner_email", user.email);

      const { data: foundData, error: foundError } = await supabase
        .from("found_items")
        .select("*")
        .eq("owner_email", user.email);

      if (!lostError && lostData) {
        // Attach signed URLs to lost items
        const lostWithUrls = await Promise.all(
          lostData.map(async (item) => ({
            ...item,
            image_display_url: await toSignedUrlIfNeeded(item.image_url),
          }))
        );
        setLostItems(lostWithUrls);
      }

      if (!foundError && foundData) {
        // Attach signed URLs to found items
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

    // Realtime subscriptions for lost_items
    const lostSub = supabase
      .channel("user_lost_items")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lost_items",
          filter: `owner_email=eq.${user.email}`,
        },
        async (payload) => {
          const newItem = payload.new;
          const newItemWithUrl = {
            ...newItem,
            image_display_url: await toSignedUrlIfNeeded(newItem.image_url),
          };
          setLostItems((prev) => [newItemWithUrl, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lost_items",
          filter: `owner_email=eq.${user.email}`,
        },
        async (payload) => {
          const updated = payload.new;
          const updatedWithUrl = {
            ...updated,
            image_display_url: await toSignedUrlIfNeeded(updated.image_url),
          };
          setLostItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updatedWithUrl : item))
          );
        }
      )
      .subscribe();

    // Realtime subscriptions for found_items
    const foundSub = supabase
      .channel("user_found_items")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "found_items",
          filter: `owner_email=eq.${user.email}`,
        },
        async (payload) => {
          const newItem = payload.new;
          const newItemWithUrl = {
            ...newItem,
            image_display_url: await toSignedUrlIfNeeded(newItem.image_url),
          };
          setFoundItems((prev) => [newItemWithUrl, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "found_items",
          filter: `owner_email=eq.${user.email}`,
        },
        async (payload) => {
          const updated = payload.new;
          const updatedWithUrl = {
            ...updated,
            image_display_url: await toSignedUrlIfNeeded(updated.image_url),
          };
          setFoundItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updatedWithUrl : item))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lostSub);
      supabase.removeChannel(foundSub);
    };
  }, [user]);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      return alert("Failed to upload avatar: " + uploadError.message);
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    if (!data?.publicUrl) {
      setUploading(false);
      return alert("Failed to get public URL for avatar.");
    }

    setAvatarPreview(data.publicUrl);
    setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          email: profile.email,
          full_name: profile.fullName,
          phone: profile.phone,
          alt_phone: profile.altPhone,
          role: profile.role,
          avatar_url: profile.avatar_url,
        },
        { onConflict: ["email"] }
      );

    if (error) return alert("Failed to update profile: " + error.message);
    alert("Profile updated!");
  };

  // Edit item
  const handleEditItem = async (table, item) => {
    const newDesc = prompt("Update description:", item.description);
    if (newDesc !== null && newDesc !== item.description) {
      const { error } = await supabase
        .from(table)
        .update({ description: newDesc })
        .eq("id", item.id)
        .eq("owner_email", user.email);
      if (!error) {
        if (table === "lost_items") {
          setLostItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, description: newDesc } : i
            )
          );
        } else {
          setFoundItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, description: newDesc } : i
            )
          );
        }
      } else {
        alert("Failed to update item: " + error.message);
      }
    }
  };

  // Delete item
  const handleDeleteItem = async (table, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("owner_email", user.email);
    if (!error) {
      if (table === "lost_items") {
        setLostItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setFoundItems((prev) => prev.filter((i) => i.id !== id));
      }
    } else {
      alert("Failed to delete item: " + error.message);
    }
  };

  const getPostId = (uuid) => uuid?.slice(-4).toUpperCase() || "-";

  if (!user) return <div className="p-4 text-center">Loading user...</div>;
  if (loading) return <div className="p-4 text-center">Loading profile...</div>;

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {["profile", "lost", "found"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab
                ? "border-b-2 border-green-700 text-green-700"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Profile</h2>

          {/* Avatar Preview */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Avatar</label>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Alt Phone</label>
            <input
              type="text"
              name="altPhone"
              value={profile.altPhone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Lost Items Tab (Status UI for lost items) */}
      {activeTab === "lost" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Lost Items</h2>
          {itemsLoading ? (
            <div>Loading...</div>
          ) : lostItems.length === 0 ? (
            <div>No lost items uploaded.</div>
          ) : (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-green-200">
                  <th className="border border-gray-300 px-3 py-1">Title</th>
                  <th className="border border-gray-300 px-3 py-1">Description</th>
                  <th className="border border-gray-300 px-3 py-1">Image</th>
                  <th className="border border-gray-300 px-3 py-1">Location</th>
                  <th className="border border-gray-300 px-3 py-1">Status</th>
                  <th className="border border-gray-300 px-3 py-1">Post ID</th>
                  <th className="border border-gray-300 px-3 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lostItems.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-gray-100">
                    <td className="border border-gray-300 px-3 py-1">{item.title}</td>
                    <td className="border border-gray-300 px-3 py-1">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 px-3 py-1">
                      {item.image_display_url ? (
                        <img
                          src={item.image_display_url}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-1">{item.location}</td>
                    <td className="border border-gray-300 px-3 py-1">{item.status}</td>
                    <td className="border border-gray-300 px-3 py-1">
                      {getPostId(item.id)}
                    </td>
                    <td className="border border-gray-300 px-3 py-1">
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                        onClick={() => handleEditItem("lost_items", item)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleDeleteItem("lost_items", item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Found Items Tab (Status UI for found items) */}
      {activeTab === "found" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Found Items</h2>
          {itemsLoading ? (
            <div>Loading...</div>
          ) : foundItems.length === 0 ? (
            <div>No found items uploaded.</div>
          ) : (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-green-200">
                  <th className="border border-gray-300 px-3 py-1">Title</th>
                  <th className="border border-gray-300 px-3 py-1">Description</th>
                  <th className="border border-gray-300 px-3 py-1">Image</th>
                  <th className="border border-gray-300 px-3 py-1">Location</th>
                  <th className="border border-gray-300 px-3 py-1">Status</th>
                  <th className="border border-gray-300 px-3 py-1">Post ID</th>
                  <th className="border border-gray-300 px-3 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {foundItems.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-gray-100">
                    <td className="border border-gray-300 px-3 py-1">{item.title}</td>
                    <td className="border border-gray-300 px-3 py-1">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 px-3 py-1">
                      {item.image_display_url ? (
                        <img
                          src={item.image_display_url}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-1">{item.location}</td>
                    <td className="border border-gray-300 px-3 py-1">{item.status}</td>
                    <td className="border border-gray-300 px-3 py-1">
                      {getPostId(item.id)}
                    </td>
                    <td className="border border-gray-300 px-3 py-1">
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                        onClick={() => handleEditItem("found_items", item)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleDeleteItem("found_items", item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
