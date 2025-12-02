import React, { useEffect, useState } from "react";
import { getPastAnalysis } from "../services/api";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function PastAnalysis() {
  const [pastData, setPastData] = useState(null);
  const [mlData, setMlData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const past = await getPastAnalysis();
        setPastData(past.data);

        const ml = await axios.get("http://localhost:8000/ml-analysis");
        setMlData(ml.data);

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!pastData) return <p>Error loading data.</p>;

  // Past Analysis Chart Data
  const pieSeries = Object.entries(pastData.status_frequency || {}).map(
    ([name, value]) => ({ name, y: value })
  );

  const categories = Object.keys(pastData.trend_by_date || {});
  const lostData = categories.map(
    (date) => pastData.trend_by_date[date].Lost || 0
  );
  const foundData = categories.map(
    (date) => pastData.trend_by_date[date].Found || 0
  );

  // ML Analysis Chart Parser
  const prepareSeries = (obj) =>
    Object.entries(obj || {}).map(([name, value]) => ({ name, y: value }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">CampusFind Analytics Dashboard</h2>

      {/* ===================== */}
      {/*   TOP METRICS CARDS   */}
      {/* ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-purple-200 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-semibold mb-1">Total Items</h3>
          <p className="text-2xl font-bold">{pastData.total_items}</p>
        </div>

        <div className="bg-green-200 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-semibold mb-1">Total Lost</h3>
          <p className="text-2xl font-bold">{pastData.total_lost}</p>
        </div>

        <div className="bg-blue-200 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-semibold mb-1">Total Found</h3>
          <p className="text-2xl font-bold">{pastData.total_found}</p>
        </div>

        <div className="bg-yellow-200 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-semibold mb-1">Most Frequent Status</h3>
          <p className="text-2xl font-bold">{pieSeries[0]?.name || "-"}</p>
        </div>
      </div>

      {/* ===================== */}
      {/*    PAST ANALYSIS      */}
      {/* ===================== */}
      <h3 className="text-2xl font-bold mb-4">Past Records Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Status Pie */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-3">Status Frequency</h3>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "pie", height: 350 },
              title: { text: null },
              tooltip: { pointFormat: "{point.y} items" },
              series: [{ name: "Items", data: pieSeries }],
            }}
          />
        </div>

        {/* Trend Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-3">Daily Lost/Found Trend</h3>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "column", height: 350 },
              title: { text: null },
              xAxis: { categories },
              yAxis: { title: { text: "Count" } },
              tooltip: { shared: true },
              series: [
                { name: "Lost", data: lostData, color: "#FF6B6B" },
                { name: "Found", data: foundData, color: "#4ECDC4" },
              ],
            }}
          />
        </div>
      </div>

      {/* ===================== */}
      {/*     ML ANALYTICS     */}
      {/* ===================== */}
      {mlData && (
        <>
          <h3 className="text-2xl font-bold mb-4">Machine Learning Dataset Analytics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Pie */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Category Distribution</h3>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: { type: "pie", height: 350 },
                  title: { text: null },
                  series: [
                    {
                      name: "Items",
                      colorByPoint: true,
                      data: prepareSeries(mlData.category_frequency),
                    },
                  ],
                }}
              />
            </div>

            {/* Location */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Location Distribution</h3>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: { type: "column", height: 350 },
                  xAxis: { categories: Object.keys(mlData.location_frequency) },
                  series: [
                    {
                      name: "Items",
                      data: Object.values(mlData.location_frequency),
                      color: "#4ECDC4",
                    },
                  ],
                }}
              />
            </div>

            {/* Hour */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Lost Hour Distribution</h3>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: { type: "column", height: 350 },
                  xAxis: { categories: Object.keys(mlData.hour_distribution) },
                  series: [
                    {
                      name: "Items",
                      data: Object.values(mlData.hour_distribution),
                      color: "#FF6B6B",
                    },
                  ],
                }}
              />
            </div>

            {/* Weekday */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Weekday Distribution</h3>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: { type: "column", height: 350 },
                  xAxis: { categories: Object.keys(mlData.weekday_distribution) },
                  series: [
                    {
                      name: "Items",
                      data: Object.values(mlData.weekday_distribution),
                      color: "#FFA500",
                    },
                  ],
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
