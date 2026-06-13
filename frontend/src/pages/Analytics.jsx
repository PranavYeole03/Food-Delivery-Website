import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("monthly");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`${serverUrl}/api/analytics`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        
      }
    };

    fetchAnalytics();
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  const stats = data?.stats || {};
  const today = data?.today || {};
  const monthlyRevenue = data?.monthlyRevenue || { labels: [], data: [] };

  const topItems = data?.topItems || [];
  const topItemsMonthly = data?.topItemsMonthly || [];
  const topRatedItems = data?.topRatedItems || [];

  const currentItems =
    view === "monthly" ? topItemsMonthly : topItems;

  const chartData = {
    labels: monthlyRevenue.labels,
    datasets: [
      {
        label: "Revenue",
        data: monthlyRevenue.data,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // ✅ IMPORTANT
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-white">

      {/* HEADER */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Analytics Dashboard
      </h1>

      {/* TOGGLE */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("monthly")}
          className={`px-3 py-1 rounded ${view === "monthly" ? "bg-black text-white" : "border"
            }`}
        >
          Monthly
        </button>

        <button
          onClick={() => setView("all")}
          className={`px-3 py-1 rounded ${view === "all" ? "bg-black text-white" : "border"
            }`}
        >
          All Time
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenue", value: `₹${stats.totalRevenue || 0}` },
          { label: "Orders", value: stats.totalOrders || 0 },
          { label: "Completed", value: stats.completedOrders || 0 },
          { label: "Pending", value: stats.pendingOrders || 0 },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow rounded-2xl p-4"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <h2 className="text-lg md:text-xl font-bold">{item.value}</h2>
          </motion.div>
        ))}
      </div>

      {/* TODAY */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Today Orders</p>
          <h2 className="font-bold">{today.orders || 0}</h2>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Today Revenue</p>
          <h2 className="font-bold">₹{today.revenue || 0}</h2>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white shadow p-4 rounded-xl mb-6">
        <h2 className="mb-4 font-semibold">Monthly Revenue</h2>

        <div className="h-64 md:h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* LISTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* TOP ITEMS */}
        <div className="bg-black text-white rounded-2xl p-5">
          <h2 className="mb-4 font-semibold">
            🔥 {view === "monthly"
              ? "Top Selling This Month"
              : "Top Selling All Time"}
          </h2>

          {currentItems.map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b border-gray-700"
            >
              <p className="font-medium truncate max-w-37.5">
                {item.name}
              </p>

              <div className="text-sm text-gray-300">
                {item.quantity} orders
              </div>
            </div>
          ))}
        </div>

        {/* TOP RATED */}
        <div className="bg-linear-to-br from-gray-900 to-black text-white rounded-2xl p-5">
          <h2 className="mb-4 font-semibold">⭐ Top Rated Items</h2>

          {topRatedItems.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-gray-700"
            >
              <p className="truncate max-w-35">{item.name}</p>

              <span className="text-sm">
                ⭐ {item.rating?.average?.toFixed(1) || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-10 bg-black text-white rounded-2xl p-5 text-center shadow-xl">
        <h2 className="text-lg font-semibold mb-2">
          📊 Fletto Analytics Pro
        </h2>

        <p className="text-sm text-gray-400">
          Track your business growth with real-time insights.
        </p>

        <div className="mt-3 text-xs text-gray-500">
          © {new Date().getFullYear()} Fletto
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow md:hidden z-50">

        <div className="flex justify-around py-2">

          <button
            onClick={() => navigate("/owner")}
            className="flex flex-col items-center text-xs text-black"
          >
            <FaHome size={16} />
            <span>Home</span>
          </button>
        </div>
      </div>

    </div>
  );
}
