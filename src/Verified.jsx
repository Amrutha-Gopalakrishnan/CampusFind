import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Verification Page - Handles email verification and profile creation
 */
export default function Verified() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    handleVerification();
  }, []);

  const handleVerification = async () => {
    try {
      // Check if there's a hash fragment in the URL (from Supabase auth redirect)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      console.log('Verification URL params:', { accessToken: !!accessToken, type });
      
      // If there's a verification link in the hash, handle it
      if (accessToken && type === 'signup') {
        console.log('Found verification link in URL');
        
        // Supabase automatically creates the session when you call getSession()
        // after the hash is in the URL. Let's check if we have a session now.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session after hash:', { hasSession: !!session, sessionError });
        
        // Clear the hash immediately
        window.history.replaceState({}, document.title, '/verified');
        
        if (!session) {
          setStatus('error');
          setMessage('Failed to create session from verification link. Please try again.');
          setTimeout(() => navigate('/login'), 5000);
          return;
        }
        
        // Session is valid, continue with verification check
        await checkVerificationStatus(session.user);
        return;
      }
      
      // No verification link in hash, check existing session
      await checkVerificationStatus();
      
    } catch (err) {
      console.error('Handle verification error:', err);
      setStatus('error');
      setMessage('An error occurred during verification: ' + err.message);
    }
  };

  const checkVerificationStatus = async (providedUser = null) => {
    try {
      // Get the user - either from provided or from session
      let user = providedUser;
      
      if (!user) {
        // Check if there's a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setStatus('error');
          setMessage('Session error: ' + sessionError.message);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        if (!session) {
          setStatus('error');
          setMessage('No active session. Please click the verification link from your email.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        user = session.user;
      }

      if (!user) {
        setStatus('error');
        setMessage('No user found. Please sign up first.');
        setTimeout(() => navigate('/signup'), 3000);
        return;
      }

      console.log('Checking user:', { 
        email: user.email, 
        email_confirmed_at: user.email_confirmed_at,
        metadata: user.user_metadata
      });

      // Check if email is verified
      if (!user.email_confirmed_at) {
        setStatus('error');
        setMessage('Email not verified yet. Click the verification link in your email to continue.');
        setTimeout(() => navigate('/login'), 5000);
        return;
      }

      // Email is verified, now create profile if it doesn't exist
      setStatus('creating');
      setMessage('Creating your profile...');

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (existingProfile) {
        // Profile already exists, refresh session and redirect to dashboard
        setStatus('verified');
        setMessage('Email verified! Setting up your session...');
        
        // Trigger auth state change to update App.jsx user state
        await supabase.auth.refreshSession();
        
        toast.success('Welcome! Email verified successfully.');
        
        // Clear the URL hash
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Small delay to ensure state updates
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        return;
      }

      // Get pending profile data from localStorage
      const pendingProfile = localStorage.getItem('pending_profile');
      let profileData = null;

      if (pendingProfile) {
        try {
          profileData = JSON.parse(pendingProfile);
        } catch (e) {
          console.error('Error parsing pending profile:', e);
        }
      }

      // If no pending profile data, create basic profile from user data
      if (!profileData) {
        profileData = {
          user_id: user.id,
          email: user.email,
          name: user.email?.split("@")[0] || "User",
          role: user.user_metadata?.role || 'Student',
          department: user.user_metadata?.dept_year || null,
          reg_number: user.user_metadata?.reg_number || null,
          dept_year: user.user_metadata?.dept_year || null
        };
      }

      // Create profile using RPC
      const { error: profileError } = await supabase.rpc('create_user_profile', {
        user_id: profileData.user_id,
        user_email: profileData.email,
        user_name: profileData.name,
        user_role: profileData.role,
        user_department: profileData.department || null,
        user_reg_number: profileData.reg_number || null,
        user_dept_year: profileData.dept_year || null,
        user_phone: null,
        user_alt_phone: null,
        user_avatar_url: null
      });

      if (profileError && profileError.code !== '23505') {
        console.error('Profile creation error:', profileError);
        setStatus('error');
        setMessage('Profile creation failed. You can still login and complete your profile.');
        setTimeout(() => navigate('/login'), 5000);
        return;
      }

      // Clear pending profile data
      localStorage.removeItem('pending_profile');
      
      // Clear the URL hash to remove verification tokens
      window.history.replaceState({}, document.title, window.location.pathname);

      // Success! Refresh session and redirect to dashboard
      setStatus('verified');
      setMessage('Profile created! Setting up your session...');
      
      // Trigger auth state change to update App.jsx user state
      await supabase.auth.refreshSession();
      
      toast.success('Account verified successfully!');
      
      // Use window.location.href for a hard refresh to trigger App.jsx re-initialization
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      setMessage('An error occurred during verification: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/20 max-w-md w-full">
        {status === 'checking' && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Verifying Email</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'creating' && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Setting Up Profile</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'verified' && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Verified!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
