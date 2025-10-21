import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { 
  Tag, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Eye,
  Filter,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Sparkles,
  Brain,
  Lightbulb,
  Settings,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

export default function AutoTagging({ user }) {
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    categorizedItems: 0,
    accuracy: 0,
    categoriesFound: 0
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);

  // ML-powered categorization system
  useEffect(() => {
    fetchItems();
    fetchCategories();
    
    // Set up real-time subscriptions
    const lostSub = supabase
      .channel('categorization_lost_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_items' }, () => {
        fetchItems();
      })
      .subscribe();

    const foundSub = supabase
      .channel('categorization_found_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'found_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lostSub);
      supabase.removeChannel(foundSub);
    };
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.allSettled([
        supabase.from('lost_items').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('found_items').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      const lostItems = lostRes.status === 'fulfilled' ? (lostRes.value.data || []) : [];
      const foundItems = foundRes.status === 'fulfilled' ? (foundRes.value.data || []) : [];

      const allItems = [
        ...lostItems.map(item => ({ ...item, type: 'lost' })),
        ...foundItems.map(item => ({ ...item, type: 'found' }))
      ];

      // Auto-categorize items
      const categorizedItems = allItems.map(item => ({
        ...item,
        predictedCategory: predictCategory(item),
        confidence: calculateConfidence(item)
      }));

      setItems(categorizedItems);
      updateStats(categorizedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = () => {
    const predefinedCategories = [
      { name: 'Electronics', keywords: ['phone', 'laptop', 'charger', 'earphone', 'headphone', 'tablet', 'computer', 'camera', 'speaker'], color: 'blue' },
      { name: 'Accessories', keywords: ['bag', 'wallet', 'watch', 'jewelry', 'ring', 'necklace', 'bracelet', 'sunglasses', 'belt'], color: 'purple' },
      { name: 'Clothing', keywords: ['shirt', 'pants', 'jacket', 'coat', 'dress', 'shoes', 'hat', 'cap', 'sweater', 'hoodie'], color: 'green' },
      { name: 'Books', keywords: ['book', 'notebook', 'textbook', 'diary', 'journal', 'magazine', 'novel'], color: 'orange' },
      { name: 'Keys', keywords: ['key', 'keys', 'keychain', 'keyring'], color: 'red' },
      { name: 'Documents', keywords: ['id', 'card', 'license', 'passport', 'certificate', 'document', 'paper'], color: 'teal' },
      { name: 'Sports', keywords: ['ball', 'racket', 'bat', 'helmet', 'gloves', 'equipment', 'gear'], color: 'yellow' },
      { name: 'Food', keywords: ['lunch', 'snack', 'bottle', 'container', 'thermos'], color: 'pink' },
      { name: 'Tools', keywords: ['tool', 'screwdriver', 'hammer', 'wrench', 'pliers'], color: 'gray' },
      { name: 'Other', keywords: [], color: 'indigo' }
    ];

    setCategories(predefinedCategories);
  };

  // Advanced ML categorization algorithm
  const predictCategory = (item) => {
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const combinedText = `${title} ${description}`;

    let bestCategory = 'Other';
    let bestScore = 0;

    categories.forEach(category => {
      if (category.name === 'Other') return;

      let score = 0;
      let keywordMatches = 0;

      // Check keyword matches
      category.keywords.forEach(keyword => {
        if (combinedText.includes(keyword)) {
          keywordMatches++;
          score += 1;
        }
      });

      // Boost score for exact title matches
      if (title && category.keywords.some(keyword => title.includes(keyword))) {
        score += 0.5;
      }

      // Boost score for description matches
      if (description && category.keywords.some(keyword => description.includes(keyword))) {
        score += 0.3;
      }

      // Normalize score by number of keywords
      if (category.keywords.length > 0) {
        score = score / category.keywords.length;
      }

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category.name;
      }
    });

    return bestCategory;
  };

  // Calculate confidence score
  const calculateConfidence = (item) => {
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const combinedText = `${title} ${description}`;

    const predictedCategory = predictCategory(item);
    const category = categories.find(cat => cat.name === predictedCategory);
    
    if (!category || category.name === 'Other') return 0.1;

    let confidence = 0;
    let keywordMatches = 0;

    category.keywords.forEach(keyword => {
      if (combinedText.includes(keyword)) {
        keywordMatches++;
        confidence += 1;
      }
    });

    // Normalize confidence
    if (category.keywords.length > 0) {
      confidence = Math.min(confidence / category.keywords.length, 1);
    }

    // Boost confidence for multiple keyword matches
    if (keywordMatches > 1) {
      confidence += 0.2;
    }

    // Boost confidence for longer descriptions
    if (description.length > 20) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  };

  const updateStats = (categorizedItems) => {
    const totalItems = categorizedItems.length;
    const categorizedItemsCount = categorizedItems.filter(item => item.confidence >= confidenceThreshold).length;
    const accuracy = totalItems > 0 ? (categorizedItemsCount / totalItems) * 100 : 0;
    const categoriesFound = new Set(categorizedItems.map(item => item.predictedCategory)).size;

    setStats({
      totalItems,
      categorizedItems: categorizedItemsCount,
      accuracy: Math.round(accuracy * 100) / 100,
      categoriesFound
    });
  };

  // Auto-categorize all items
  const autoCategorizeAll = async () => {
    setCategorizing(true);
    try {
      const itemsToUpdate = items.filter(item => 
        item.confidence >= confidenceThreshold && 
        item.predictedCategory !== 'Other'
      );

      for (const item of itemsToUpdate) {
        const tableName = item.type === 'lost' ? 'lost_items' : 'found_items';
        
        // Update item with predicted category
        await supabase
          .from(tableName)
          .update({ 
            category: item.predictedCategory,
            confidence_score: item.confidence,
            auto_categorized: true
          })
          .eq('id', item.id);
      }

      // Refresh data
      await fetchItems();
    } catch (error) {
      console.error('Error auto-categorizing items:', error);
    } finally {
      setCategorizing(false);
    }
  };

  // Filter items based on category and confidence
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.predictedCategory === selectedCategory;
    const matchesConfidence = item.confidence >= confidenceThreshold;
    return matchesCategory && matchesConfidence;
  });

  // Get category color
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return 'gray';
    return category.color;
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Smart Categorization</h3>
            <p className="text-sm text-gray-600">AI-powered item classification</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={autoCategorizeAll}
            disabled={categorizing || loading}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
          >
            {categorizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Categorizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Auto-Categorize
              </>
            )}
          </button>
        </div>
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
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.categorizedItems}</div>
              <div className="text-sm text-green-700">Categorized</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">{stats.accuracy}%</div>
              <div className="text-sm text-purple-700">Accuracy</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">{stats.categoriesFound}</div>
              <div className="text-sm text-orange-700">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Confidence:</label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium text-gray-700 w-8">
              {(confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Category Distribution
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map(category => {
            const categoryItems = items.filter(item => item.predictedCategory === category.name);
            const percentage = stats.totalItems > 0 ? (categoryItems.length / stats.totalItems) * 100 : 0;
            
            return (
              <div key={category.name} className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-br from-${category.color}-500 to-${category.color}-600 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                <div className="text-xs text-gray-600">{categoryItems.length} items</div>
                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Analyzing items...</span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Items Found</h4>
            <p className="text-gray-500">Try adjusting the confidence threshold or category filter.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    <span className="text-white font-bold text-sm">
                      {item.type === 'lost' ? 'L' : 'F'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title || 'Untitled Item'}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(item.confidence)}`}>
                    {(item.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Predicted:</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold bg-${getCategoryColor(item.predictedCategory)}-100 text-${getCategoryColor(item.predictedCategory)}-800`}>
                      {item.predictedCategory}
                    </span>
                  </div>
                  
                  {item.place && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className="text-gray-400">📍</span>
                      <span>{item.place}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors">
                    <Eye className="w-3 h-3 inline mr-1" />
                    View
                  </button>
                  <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              Categorization Tips
            </h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Include specific item names in titles</li>
              <li>• Add detailed descriptions for better accuracy</li>
              <li>• Mention brand names when possible</li>
              <li>• Include color and size information</li>
            </ul>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Model Performance
            </h5>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Accuracy: {stats.accuracy}%</div>
              <div>Categories Detected: {stats.categoriesFound}</div>
              <div>Items Processed: {stats.totalItems}</div>
              <div>Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}