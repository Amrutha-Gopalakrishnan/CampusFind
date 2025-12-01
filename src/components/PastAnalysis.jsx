import React, { useEffect, useState } from "react";
import { getPastAnalysis } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF6B6B", "#4ECDC4"]; // Pie chart colors
const GRADIENTS = ["url(#colorLost)", "url(#colorFound)"]; // For bars

export default function PastAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await getPastAnalysis();
        if (res.data?.error) {
          setError(res.data.error);
        } else {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error fetching past analysis:", err);
        setError("Unable to load analysis");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Pie chart data
  const pieData = Object.entries(data.status_frequency || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Bar chart data
  const barData = Object.entries(data.trend_by_date || {}).map(([date, statusObj]) => ({
    date,
    Lost: statusObj.Lost || 0,
    Found: statusObj.Found || 0,
  }));

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Past Analysis Dashboard</h2>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-200 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-1">Total Items</h3>
          <p className="text-2xl font-bold">{data.total_items}</p>
        </div>
        <div className="bg-green-200 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-1">Total Lost</h3>
          <p className="text-2xl font-bold">{data.total_lost}</p>
        </div>
        <div className="bg-blue-200 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-1">Total Found</h3>
          <p className="text-2xl font-bold">{data.total_found}</p>
        </div>
        <div className="bg-yellow-200 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold mb-1">Most Frequent Status</h3>
          <p className="text-2xl font-bold">{pieData[0]?.name || "-"}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Frequency Pie */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-3">Status Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={4}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} items`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Lost/Found Trend Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-3">Daily Lost/Found Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Lost" fill="url(#colorLost)" radius={[5, 5, 0, 0]} />
              <Bar dataKey="Found" fill="url(#colorFound)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
