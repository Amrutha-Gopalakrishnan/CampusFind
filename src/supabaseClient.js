
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Global error handler for auth errors
export const handleAuthError = async (error) => {
  console.error("Auth error:", error);
  
  if (error.message?.includes('Invalid Refresh Token') || 
      error.message?.includes('Refresh Token Not Found') ||
      error.message?.includes('JWT expired')) {
    console.log("Clearing invalid session...");
    
    // Clear localStorage auth data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') && key.includes('auth-token')) {
        localStorage.removeItem(key);
      }
    });
    
    await supabase.auth.signOut();
    
    // Optionally redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

// Utility function to clear all auth data
export const clearAuthData = () => {
  // Clear localStorage auth data
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('sb-') && key.includes('auth-token')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear session storage
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    if (key.startsWith('sb-') && key.includes('auth-token')) {
      sessionStorage.removeItem(key);
    }
  });
};
