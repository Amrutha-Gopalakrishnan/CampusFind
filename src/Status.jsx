import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const BellIcon = (props) => (
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
      d="M14.857 17.082a2.25 2.25 0 01-4.714 0M21 19.5v-2.25A2.25 2.25 0 0018.75 15V11.25a6.75 6.75 0 10-13.5 0V15A2.25 2.25 0 003 17.25V19.5m18 0H3"
    />
  </svg>
);

export default function Status({ user, setUser }) {
  const [tab, setTab] = useState("lost"); // 'lost' | 'found'
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  // Fetch initial data
  const toSignedUrlIfNeeded = async (urlOrPath) => {
    if (!urlOrPath) return null;
    // If it's already a public URL, prefer it
    if (urlOrPath.includes("/object/public/")) {
      return urlOrPath;
    }
    // Try to derive an object path and create a signed URL
    // Accept either a full URL or just a filename
    let objectPath = urlOrPath;
    const marker = "/object/public/lost-found-images/";
    if (urlOrPath.includes(marker)) {
      objectPath = urlOrPath.split(marker)[1];
    } else if (urlOrPath.startsWith("http")) {
      // Fallback: take the last segment as file key
      try {
        const u = new URL(urlOrPath);
        objectPath = u.pathname.split("/").pop();
      } catch (_) {
        // keep original
      }
    }
    const { data, error } = await supabase.storage
      .from("lost-found-images")
      .createSignedUrl(objectPath, 60 * 60); // 1 hour
    if (error) return urlOrPath; // fallback to original
    return data?.signedUrl || urlOrPath;
  };

  const attachDisplayUrls = async (rows) => {
    return Promise.all(
      (rows || []).map(async (row) => {
        const displayUrl = await toSignedUrlIfNeeded(row.image_url);
        return { ...row, image_display_url: displayUrl };
      })
    );
  };

  const fetchData = async () => {
    const { data: lost } = await supabase.from("lost_items").select("*");
    const { data: found } = await supabase.from("found_items").select("*");

    const lostWithUrls = await attachDisplayUrls(lost);
    const foundWithUrls = await attachDisplayUrls(found);

    setLostItems(lostWithUrls);
    setFoundItems(foundWithUrls);
  };

  useEffect(() => {
    fetchData();

    // ✅ Realtime subscription
    const lostSub = supabase
      .channel("lost_items_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lost_items" },
        async (payload) => {
          const rowWithUrl = (await attachDisplayUrls([payload.new]))[0];
          setLostItems((prev) => [rowWithUrl, ...prev]);
        }
      )
      .subscribe();

    const foundSub = supabase
      .channel("found_items_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "found_items" },
        async (payload) => {
          const rowWithUrl = (await attachDisplayUrls([payload.new]))[0];
          setFoundItems((prev) => [rowWithUrl, ...prev]);
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

  // ✅ Helper: last 4 chars of UUID for Post ID
  const getPostId = (uuid) => uuid?.slice(-4).toUpperCase() || "-";

  return (
    <div className="flex-1 bg-gray-50 p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Status Enquiry</h2>
        {user && (
          <div className="flex gap-2">
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Log Out
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-3 py-1 bg-[#15735b] text-white rounded hover:bg-[#125e4b]"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* Tabs + Search */}
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setTab("lost")}
            className={`px-4 py-2 rounded-md border ${
              tab === "lost"
                ? "bg-[#15735b] text-white border-[#15735b]"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Lost Belongings
          </button>
          <button
            onClick={() => setTab("found")}
            className={`px-4 py-2 rounded-md border ${
              tab === "found"
                ? "bg-[#15735b] text-white border-[#15735b]"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Found Belongings
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#15735b]"
            placeholder="Search by description or ID"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#e6f3ef]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Post ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Posted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Reg Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#15735b] uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPostId(item.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.image_display_url || item.image_url ? (
                        <img
                          src={item.image_display_url || item.image_url}
                          alt={item.description}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.description || "-"}
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
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "Pending"
                            ? "bg-[#e6f3ef] text-[#15735b]"
                            : item.status === "Found"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Lost"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-purple-100 text-blue-800"
                        }`}
                      >
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
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500 text-sm"
                  >
                    ⚠️ No items available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
