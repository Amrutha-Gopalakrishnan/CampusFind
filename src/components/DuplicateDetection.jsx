import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Clock, 
  MapPin,
  User,
  Calendar,
  RefreshCw,
  Eye,
  X,
  Check,
  Zap,
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";

export default function DuplicateDetection({ user }) {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [stats, setStats] = useState({
    totalItems: 0,
    duplicateGroups: 0,
    potentialMatches: 0,
    resolvedDuplicates: 0
  });

  // Real-time duplicate detection
  useEffect(() => {
    fetchDuplicates();
    
    // Set up real-time subscriptions
    const lostSub = supabase
      .channel('duplicate_lost_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_items' }, () => {
        fetchDuplicates();
      })
      .subscribe();

    const foundSub = supabase
      .channel('duplicate_found_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'found_items' }, () => {
        fetchDuplicates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lostSub);
      supabase.removeChannel(foundSub);
    };
  }, [searchTerm, selectedCategory, similarityThreshold]);

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      // Fetch recent items for faster analysis
      const [lostResponse, foundResponse] = await Promise.allSettled([
        supabase.from('lost_items').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('found_items').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      const allItems = [
        ...(lostResponse.status === 'fulfilled' ? (lostResponse.value.data || []).map(item => ({ ...item, type: 'lost' })) : []),
        ...(foundResponse.status === 'fulfilled' ? (foundResponse.value.data || []).map(item => ({ ...item, type: 'found' })) : [])
      ];

      // Advanced duplicate detection
      const duplicateGroups = findAdvancedDuplicates(allItems);
      
      // Calculate statistics
      const totalItems = allItems.length;
      const duplicateGroupsCount = duplicateGroups.length;
      const potentialMatches = duplicateGroups.reduce((sum, group) => sum + group.items.length, 0);
      
      setStats({
        totalItems,
        duplicateGroups: duplicateGroupsCount,
        potentialMatches,
        resolvedDuplicates: 0 // This would be tracked in a separate table
      });

      setDuplicates(duplicateGroups);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
      setDuplicates([]);
    } finally {
      setLoading(false);
    }
  };

  // Advanced similarity algorithms
  const findAdvancedDuplicates = (items) => {
    const groups = [];
    const processed = new Set();

    for (let i = 0; i < items.length; i++) {
      if (processed.has(items[i].id)) continue;

      const currentItem = items[i];
      const similarItems = [currentItem];
      processed.add(currentItem.id);

      for (let j = i + 1; j < items.length; j++) {
        if (processed.has(items[j].id)) continue;

        const similarity = calculateSimilarity(currentItem, items[j]);
        if (similarity >= similarityThreshold) {
          similarItems.push(items[j]);
          processed.add(items[j].id);
        }
      }

      if (similarItems.length > 1) {
        groups.push({
          id: `group_${currentItem.id}`,
          items: similarItems,
          confidence: calculateGroupConfidence(similarItems),
          similarityScore: calculateAverageSimilarity(similarItems)
        });
      }
    }

    return groups.sort((a, b) => b.confidence - a.confidence);
  };

  // Multi-factor similarity calculation
  const calculateSimilarity = (item1, item2) => {
    const weights = {
      title: 0.4,
      description: 0.3,
      location: 0.2,
      category: 0.1
    };

    const titleSim = calculateTextSimilarity(item1.title || '', item2.title || '');
    const descSim = calculateTextSimilarity(item1.description || '', item2.description || '');
    const locationSim = calculateLocationSimilarity(item1.place || '', item2.place || '');
    const categorySim = calculateCategorySimilarity(item1.title || '', item2.title || '');

    return (
      titleSim * weights.title +
      descSim * weights.description +
      locationSim * weights.location +
      categorySim * weights.category
    );
  };

  // Text similarity using multiple algorithms
  const calculateTextSimilarity = (text1, text2) => {
    if (!text1 || !text2) return 0;
    
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();
    
    if (normalized1 === normalized2) return 1;
    
    // Jaccard similarity
    const jaccard = calculateJaccardSimilarity(normalized1, normalized2);
    
    // Levenshtein distance similarity
    const levenshtein = calculateLevenshteinSimilarity(normalized1, normalized2);
    
    // Cosine similarity
    const cosine = calculateCosineSimilarity(normalized1, normalized2);
    
    // Weighted average
    return (jaccard * 0.4 + levenshtein * 0.3 + cosine * 0.3);
  };

  // Jaccard similarity
  const calculateJaccardSimilarity = (text1, text2) => {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  // Levenshtein distance similarity
  const calculateLevenshteinSimilarity = (text1, text2) => {
    const matrix = [];
    const len1 = text1.length;
    const len2 = text2.length;
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[len2][len1];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  };

  // Cosine similarity
  const calculateCosineSimilarity = (text1, text2) => {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    const allWords = [...new Set([...words1, ...words2])];
    const vector1 = allWords.map(word => words1.filter(w => w === word).length);
    const vector2 = allWords.map(word => words2.filter(w => w === word).length);
    
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    
    return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
  };

  // Location similarity
  const calculateLocationSimilarity = (location1, location2) => {
    if (!location1 || !location2) return 0;
    
    const normalized1 = location1.toLowerCase().trim();
    const normalized2 = location2.toLowerCase().trim();
    
    if (normalized1 === normalized2) return 1;
    
    // Check for partial matches (e.g., "Library" matches "Main Library")
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.8;
    }
    
    return calculateTextSimilarity(normalized1, normalized2);
  };

  // Category similarity based on keywords
  const calculateCategorySimilarity = (title1, title2) => {
    const categories = {
      electronics: ['phone', 'laptop', 'charger', 'earphone', 'headphone', 'tablet', 'computer'],
      accessories: ['bag', 'wallet', 'watch', 'jewelry', 'ring', 'necklace', 'bracelet'],
      clothing: ['shirt', 'pants', 'jacket', 'coat', 'dress', 'shoes', 'hat', 'cap'],
      books: ['book', 'notebook', 'textbook', 'diary', 'journal'],
      keys: ['key', 'keys', 'keychain'],
      documents: ['id', 'card', 'license', 'passport', 'certificate', 'document']
    };
    
    const getCategory = (title) => {
      const lowerTitle = title.toLowerCase();
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerTitle.includes(keyword))) {
          return category;
        }
      }
      return 'other';
    };
    
    const cat1 = getCategory(title1);
    const cat2 = getCategory(title2);
    
    return cat1 === cat2 ? 1 : 0;
  };

  // Calculate group confidence
  const calculateGroupConfidence = (items) => {
    if (items.length < 2) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        totalSimilarity += calculateSimilarity(items[i], items[j]);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  };

  // Calculate average similarity in group
  const calculateAverageSimilarity = (items) => {
    if (items.length < 2) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        totalSimilarity += calculateSimilarity(items[i], items[j]);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  };

  // Filter duplicates based on search and category
  const filteredDuplicates = duplicates.filter(group => {
    const matchesSearch = searchTerm === '' || 
      group.items.some(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === 'all' || 
      group.items.some(item => item.type === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-red-600 bg-red-50 border-red-200';
    if (confidence >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  // Get similarity score color
  const getSimilarityColor = (score) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Duplicate Detection</h3>
            <p className="text-sm text-gray-600">AI-powered similarity analysis</p>
          </div>
        </div>
        <button
          onClick={fetchDuplicates}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalItems}</div>
              <div className="text-sm text-blue-700">Total Items</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-900">{stats.duplicateGroups}</div>
              <div className="text-sm text-red-700">Duplicate Groups</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">{stats.potentialMatches}</div>
              <div className="text-sm text-orange-700">Potential Matches</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.resolvedDuplicates}</div>
              <div className="text-sm text-green-700">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search duplicates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Threshold:</label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.1"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium text-gray-700 w-8">
              {(similarityThreshold * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Analyzing duplicates...</span>
            </div>
          </div>
        ) : filteredDuplicates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Duplicates Found</h4>
            <p className="text-gray-500">Great! No duplicate items detected with current settings.</p>
          </div>
        ) : (
          filteredDuplicates.map((group) => (
            <div key={group.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-900">
                      {group.items.length} Similar Items
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(group.confidence)}`}>
                    {(group.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm font-medium ${getSimilarityColor(group.similarityScore)}`}>
                    {(group.similarityScore * 100).toFixed(0)}% Similar
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((item, index) => (
                  <div key={item.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                          {item.type === 'lost' ? 'L' : 'F'}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {item.type === 'lost' ? 'Lost' : 'Found'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        #{item.id.slice(-4).toUpperCase()}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title || 'Untitled Item'}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description || 'No description'}
                    </p>
                    
                    <div className="space-y-1">
                      {item.place && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{item.place}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span className="truncate">{item.name || 'Anonymous'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors">
                        <Eye className="w-3 h-3 inline mr-1" />
                        View
                      </button>
                      <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}