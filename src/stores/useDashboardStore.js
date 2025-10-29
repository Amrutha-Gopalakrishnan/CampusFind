import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabaseClient';

/**
 * Global Dashboard Store using Zustand with localStorage persistence
 * Prevents multiple redundant Supabase fetch calls across dashboard components
 */
export const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      status: null,
      analytics: null,
      loading: false,
      lastFetch: null,
      error: null,

      // Fetch all dashboard data at once
      fetchDashboardData: async (userId, userEmail) => {
        set({ loading: true, error: null });

        try {
          // Fetch all data in parallel for maximum performance
          const [profileResult, lostItemsResult, foundItemsResult] = await Promise.all([
            // Fetch user profile
            supabase.rpc('get_user_profile'),
            // Fetch lost items
            supabase.from('lost_items').select('*').eq('owner_email', userEmail).order('created_at', { ascending: false }),
            // Fetch found items
            supabase.from('found_items').select('*').eq('owner_email', userEmail).order('created_at', { ascending: false })
          ]);

          // Process profile data
          let profileData = null;
          if (!profileResult.error && profileResult.data && profileResult.data.length > 0) {
            profileData = profileResult.data[0];
          }

          // Process status data (combined lost & found items)
          const lostItems = lostItemsResult.data || [];
          const foundItems = foundItemsResult.data || [];
          const statusData = {
            lostItems,
            foundItems,
            totalLost: lostItems.length,
            totalFound: foundItems.length,
            totalItems: lostItems.length + foundItems.length
          };

          // Analytics data (can be enhanced later)
          const analyticsData = {
            totalReports: lostItems.length + foundItems.length,
            pendingLost: lostItems.filter(item => item.status === 'Pending').length,
            pendingFound: foundItems.filter(item => item.status === 'Pending').length,
            resolvedLost: lostItems.filter(item => item.status === 'Found').length,
            resolvedFound: foundItems.filter(item => item.status === 'Resolved').length,
            recentActivity: [...lostItems, ...foundItems]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 10)
          };

          set({
            profile: profileData,
            status: statusData,
            analytics: analyticsData,
            loading: false,
            lastFetch: new Date().toISOString(),
            error: null
          });

          return { profileData, statusData, analyticsData };
        } catch (err) {
          console.error('Dashboard store fetch error:', err);
          set({
            loading: false,
            error: err.message
          });
          return null;
        }
      },

      // Update specific parts of the store
      updateProfile: (profileData) => set({ profile: profileData }),
      updateStatus: (statusData) => set({ status: statusData }),
      updateAnalytics: (analyticsData) => set({ analytics: analyticsData }),

      // Refetch data after CRUD operations
      refreshData: async (userId, userEmail) => {
        console.log('Refreshing dashboard data...');
        return await get().fetchDashboardData(userId, userEmail);
      },

      // Clear all data (on logout)
      clearDashboard: () => set({
        profile: null,
        status: null,
        analytics: null,
        loading: false,
        lastFetch: null,
        error: null
      })
    }),
    {
      name: 'campusfind-dashboard-storage', // localStorage key
      partialize: (state) => ({
        profile: state.profile,
        status: state.status,
        analytics: state.analytics,
        lastFetch: state.lastFetch
      })
    }
  )
);

