import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Filter,
  Zap,
  Target,
  Award,
  Star
} from "lucide-react";

export default function ExecutiveSummary({ user }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    overview: {
      totalItems: 0,
      lostItems: 0,
      foundItems: 0,
      resolvedItems: 0,
      activeUsers: 0,
      successRate: 0
    },
    trends: {
      dailyStats: [],
      weeklyStats: [],
      monthlyStats: []
    },
    insights: {
      topLocations: [],
      commonCategories: [],
      peakHours: [],
      resolutionTime: 0
    },
    recommendations: []
  });

  // Real-time data fetching
  useEffect(() => {
    fetchSummaryData();
    
    // Set up real-time subscriptions
    const lostSub = supabase
      .channel('summary_lost_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_items' }, () => {
        fetchSummaryData();
      })
      .subscribe();

    const foundSub = supabase
      .channel('summary_found_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'found_items' }, () => {
        fetchSummaryData();
      })
      .subscribe();

    const profilesSub = supabase
      .channel('summary_profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchSummaryData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lostSub);
      supabase.removeChannel(foundSub);
      supabase.removeChannel(profilesSub);
    };
  }, []);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [lostRes, foundRes, profilesRes] = await Promise.allSettled([
        supabase.from('lost_items').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('found_items').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('profiles').select('*').limit(100)
      ]);

      const lostItems = lostRes.status === 'fulfilled' ? (lostRes.value.data || []) : [];
      const foundItems = foundRes.status === 'fulfilled' ? (foundRes.value.data || []) : [];
      const profiles = profilesRes.status === 'fulfilled' ? (profilesRes.value.data || []) : [];

      // Calculate comprehensive summary
      const summaryData = calculateComprehensiveSummary(lostItems, foundItems, profiles);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateComprehensiveSummary = (lostItems, foundItems, profiles) => {
    const allItems = [...lostItems, ...foundItems];
    const totalItems = allItems.length;
    const resolvedItems = allItems.filter(item => item.status === 'Found').length;
    const activeUsers = profiles.length;
    const successRate = totalItems > 0 ? (resolvedItems / totalItems) * 100 : 0;

    // Calculate trends
    const trends = calculateTrends(allItems);
    
    // Calculate insights
    const insights = calculateInsights(allItems);
    
    // Generate recommendations
    const recommendations = generateRecommendations(allItems, profiles, insights);

    return {
      overview: {
        totalItems,
        lostItems: lostItems.length,
        foundItems: foundItems.length,
        resolvedItems,
        activeUsers,
        successRate: Math.round(successRate * 100) / 100
      },
      trends,
      insights,
      recommendations
    };
  };

  const calculateTrends = (items) => {
    const now = new Date();
    const dailyStats = [];
    const weeklyStats = [];
    const monthlyStats = [];

    // Daily stats (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayItems = items.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dayStart && itemDate <= dayEnd;
      });

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        lost: dayItems.filter(item => item.title && item.title.includes('lost')).length,
        found: dayItems.filter(item => item.title && item.title.includes('found')).length,
        resolved: dayItems.filter(item => item.status === 'Found').length
      });
    }

    // Weekly stats (last 4 weeks)
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekItems = items.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= weekStart && itemDate <= weekEnd;
      });

      weeklyStats.push({
        week: `Week ${4 - i}`,
        lost: weekItems.filter(item => item.title && item.title.includes('lost')).length,
        found: weekItems.filter(item => item.title && item.title.includes('found')).length,
        resolved: weekItems.filter(item => item.status === 'Found').length
      });
    }

    return { dailyStats, weeklyStats, monthlyStats };
  };

  const calculateInsights = (items) => {
    // Top locations
    const locationCounts = {};
    items.forEach(item => {
      if (item.place) {
        const location = item.place.toLowerCase().trim();
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    const topLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Common categories
    const categoryCounts = {};
    items.forEach(item => {
      const title = (item.title || '').toLowerCase();
      let category = 'Other';
      
      if (title.includes('phone') || title.includes('laptop') || title.includes('charger')) {
        category = 'Electronics';
      } else if (title.includes('bag') || title.includes('wallet') || title.includes('watch')) {
        category = 'Accessories';
      } else if (title.includes('book') || title.includes('notebook')) {
        category = 'Books';
      } else if (title.includes('key')) {
        category = 'Keys';
      } else if (title.includes('id') || title.includes('card')) {
        category = 'Documents';
      }
      
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const commonCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Peak hours
    const hourCounts = {};
    items.forEach(item => {
      const hour = new Date(item.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Average resolution time
    const resolvedItems = items.filter(item => item.status === 'Found');
    let totalResolutionTime = 0;
    let resolutionCount = 0;

    resolvedItems.forEach(item => {
      if (item.created_at && item.updated_at) {
        const created = new Date(item.created_at);
        const updated = new Date(item.updated_at);
        const diffHours = (updated - created) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours < 24 * 30) { // Reasonable resolution time
          totalResolutionTime += diffHours;
          resolutionCount++;
        }
      }
    });

    const avgResolutionTime = resolutionCount > 0 ? totalResolutionTime / resolutionCount : 0;

    return {
      topLocations,
      commonCategories,
      peakHours,
      resolutionTime: Math.round(avgResolutionTime * 100) / 100
    };
  };

  const generateRecommendations = (items, profiles, insights) => {
    const recommendations = [];

    // Success rate recommendation
    const successRate = summary.overview.successRate;
    if (successRate < 50) {
      recommendations.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Low Success Rate',
        description: `Current success rate is ${successRate}%. Consider improving item descriptions and photos.`,
        action: 'Improve item quality'
      });
    } else if (successRate > 80) {
      recommendations.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Performance',
        description: `Great job! ${successRate}% success rate shows effective management.`,
        action: 'Maintain current practices'
      });
    }

    // Peak hours recommendation
    if (insights.peakHours.length > 0) {
      const peakHour = insights.peakHours[0];
      recommendations.push({
        type: 'info',
        icon: Clock,
        title: 'Peak Activity Time',
        description: `Most items are reported at ${peakHour.hour}:00. Consider increasing monitoring during this time.`,
        action: 'Optimize staffing'
      });
    }

    // Location recommendation
    if (insights.topLocations.length > 0) {
      const topLocation = insights.topLocations[0];
      recommendations.push({
        type: 'info',
        icon: MapPin,
        title: 'High-Risk Location',
        description: `${topLocation.location} has the most lost items (${topLocation.count}). Consider preventive measures.`,
        action: 'Add security measures'
      });
    }

    // Resolution time recommendation
    if (insights.resolutionTime > 24) {
      recommendations.push({
        type: 'warning',
        icon: Clock,
        title: 'Slow Resolution',
        description: `Average resolution time is ${insights.resolutionTime.toFixed(1)} hours. Consider faster response protocols.`,
        action: 'Improve response time'
      });
    }

    return recommendations;
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Executive Summary</h3>
            <p className="text-sm text-gray-600">Real-time analytics and insights</p>
          </div>
        </div>
        <button
          onClick={fetchSummaryData}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-900">{summary.overview.totalItems}</div>
              <div className="text-sm text-blue-700">Total Items</div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-900">{summary.overview.resolvedItems}</div>
              <div className="text-sm text-green-700">Resolved Items</div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-900">{summary.overview.successRate}%</div>
              <div className="text-sm text-purple-700">Success Rate</div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-900">{summary.overview.lostItems}</div>
              <div className="text-sm text-orange-700">Lost Items</div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-teal-900">{summary.overview.foundItems}</div>
              <div className="text-sm text-teal-700">Found Items</div>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-indigo-900">{summary.overview.activeUsers}</div>
              <div className="text-sm text-indigo-700">Active Users</div>
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Top Locations
          </h4>
          <div className="space-y-3">
            {summary.insights.topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 capitalize">{location.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(location.count / summary.insights.topLocations[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{location.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Categories */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-600" />
            Common Categories
          </h4>
          <div className="space-y-3">
            {summary.insights.commonCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${(category.count / summary.insights.commonCategories[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Peak Activity Hours
          </h4>
          <div className="space-y-3">
            {summary.insights.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {hour.hour}
                  </div>
                  <span className="font-medium text-gray-900">
                    {hour.hour}:00 - {hour.hour + 1}:00
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">{hour.count} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Time */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Performance Metrics
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Avg Resolution Time</span>
              <span className="font-bold text-purple-600">{formatTime(summary.insights.resolutionTime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Success Rate</span>
              <span className="font-bold text-green-600">{summary.overview.successRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Active Users</span>
              <span className="font-bold text-blue-600">{summary.overview.activeUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          AI Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)}`}>
              <div className="flex items-start gap-3">
                <rec.icon className="w-5 h-5 mt-0.5" />
                <div>
                  <h5 className="font-semibold mb-1">{rec.title}</h5>
                  <p className="text-sm mb-2">{rec.description}</p>
                  <span className="text-xs font-medium opacity-75">{rec.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Generating insights...</span>
          </div>
        </div>
      )}
    </div>
  );
}