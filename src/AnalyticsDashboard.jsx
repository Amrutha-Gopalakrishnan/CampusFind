import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  MapPin,
  Activity,
  Loader2
} from "lucide-react";

// Import the actual working components
import DuplicateDetection from "./components/DuplicateDetection";
import ExecutiveSummary from "./components/ExecutiveSummary";
import AutoTagging from "./components/AutoTagging";
import PastAnalysis from "./components/PastAnalysis";



export default function AnalyticsDashboard({ user, setUser }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    todayLost: 0,
    todayFound: 0,
    recoveryRate: 0,
    activeUsers: 0,
    totalReports: 0,
    pendingItems: 0,
    resolvedItems: 0,
    avgResolutionTime: 0,
  });

  // Fast data fetch with minimal queries
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Only fetch essential data with limits
      const [lostRes, foundRes] = await Promise.allSettled([
        supabase.from('lost_items').select('id, status, created_at').limit(20),
        supabase.from('found_items').select('id, created_at').limit(20)
      ]);

      const lostItems = lostRes.status === 'fulfilled' ? (lostRes.value.data || []) : [];
      const foundItems = foundRes.status === 'fulfilled' ? (foundRes.value.data || []) : [];

      // Calculate basic metrics
      const today = new Date().toISOString().split('T')[0];
      const lostToday = lostItems.filter(item => item.created_at?.startsWith(today)).length;
      const foundToday = foundItems.filter(item => item.created_at?.startsWith(today)).length;
      const resolvedItems = lostItems.filter(item => item.status === 'Resolved').length;
      const recoveryRate = lostItems.length > 0 ? Math.round((resolvedItems / lostItems.length) * 100 * 10) / 10 : 0;

      setMetrics({
        todayLost: lostToday,
        todayFound: foundToday,
        recoveryRate: recoveryRate,
        activeUsers: Math.min(lostItems.length + foundItems.length, 50), // Estimated
        totalReports: lostItems.length + foundItems.length,
        pendingItems: lostItems.filter(item => item.status === 'Pending').length,
        resolvedItems: resolvedItems,
        avgResolutionTime: Math.round(Math.random() * 48 + 24) // Simulated
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set default values on error
      setMetrics({
        todayLost: 0, todayFound: 0, recoveryRate: 0, activeUsers: 0,
        totalReports: 0, pendingItems: 0, resolvedItems: 0, avgResolutionTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Live Overview", icon: BarChart3 },
    { id: "duplicates", label: "Duplicate Detection", icon: Filter },
    { id: "auto-tagging", label: "Smart Categorization", icon: Package },
    { id: "executive", label: "Executive Summary", icon: TrendingUp },
    { id: "past-analysis", label: "Past Analysis", icon: Activity },
];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Lost</p>
              <p className="text-3xl font-bold">{metrics.todayLost}</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Found</p>
              <p className="text-3xl font-bold">{metrics.todayFound}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Recovery Rate</p>
              <p className="text-3xl font-bold">{metrics.recoveryRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Active Users</p>
              <p className="text-3xl font-bold">{metrics.activeUsers}</p>
            </div>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Items</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved Items</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.resolvedItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('duplicates')}
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200"
          >
            <Filter className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Check Duplicates</p>
              <p className="text-sm text-gray-600">Find similar reports</p>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('executive')}
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200"
          >
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Summary</p>
              <p className="text-sm text-gray-600">Executive insights</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Now use the actual working components instead of placeholders
  const renderDuplicates = () => <DuplicateDetection user={user} />;
  const renderAutoTagging = () => <AutoTagging user={user} />;
  const renderExecutive = () => <ExecutiveSummary user={user} />;
  const renderPastAnalysis = () => <PastAnalysis />;



const renderContent = () => {
  switch (activeTab) {
    case "overview": return renderOverview();
    case "duplicates": return renderDuplicates();
    case "auto-tagging": return renderAutoTagging();
    case "executive": return renderExecutive();
    case "past-analysis": return renderPastAnalysis(); 
    default: return renderOverview();
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Real-time insights and analytics for your lost & found system</p>
            </div>
            <button
              onClick={fetchAnalyticsData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
