// ==============================================
// SUPABASE BACKEND UTILITIES FOR BELONGIFY APP
// ==============================================

import { supabase } from './supabaseClient';

// ==============================================
// AUTHENTICATION FUNCTIONS
// ==============================================

/**
 * Sign up a new user (Student or Faculty)
 * @param {Object} userData - User data object
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.fullName - User full name
 * @param {string} userData.role - 'Student' or 'Faculty'
 * @param {string} userData.department - Department info
 * @param {string} userData.regNumber - Registration number (for students)
 * @param {string} userData.deptYear - Department and year (for students)
 * @returns {Promise<Object>} - Result object with success/error
 */
export const signUpUser = async (userData) => {
  try {
    // Step 1: Create user with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Step 2: Create profile using database function
    if (authData.user) {
      const { error: profileError } = await supabase.rpc('create_user_profile', {
        user_id: authData.user.id,
        user_email: userData.email,
        user_name: userData.fullName,
        user_role: userData.role,
        user_department: userData.department,
        user_reg_number: userData.regNumber || null,
        user_dept_year: userData.deptYear || null
      });

      if (profileError) {
        return { success: false, error: profileError.message };
      }
    }

    return { 
      success: true, 
      user: authData.user,
      message: `${userData.role} signup successful! Please verify your email.`
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Signup failed. Please try again.' };
  }
};

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Result object with success/error
 */
export const signInUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      user: data.user,
      message: 'Login successful!'
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<Object>} - Result object with success/error
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Logged out successfully!' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed. Please try again.' };
  }
};

// ==============================================
// PROFILE FUNCTIONS
// ==============================================

/**
 * Get current user's profile
 * @returns {Promise<Object>} - Result object with profile data
 */
export const getUserProfile = async () => {
  try {
    const { data, error } = await supabase.rpc('get_user_profile');
    
    if (error) {
      return { success: false, error: error.message };
    }

    if (data && data.length > 0) {
      return { success: true, profile: data[0] };
    }

    return { success: false, error: 'Profile not found' };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Failed to fetch profile' };
  }
};

/**
 * Update current user's profile
 * @param {Object} updateData - Profile update data
 * @returns {Promise<Object>} - Result object with success/error
 */
export const updateUserProfile = async (updateData) => {
  try {
    const { error } = await supabase.rpc('update_user_profile', {
      new_full_name: updateData.fullName || null,
      new_department: updateData.department || null,
      new_reg_number: updateData.regNumber || null,
      new_dept_year: updateData.deptYear || null
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
};

// ==============================================
// STUDENT-SPECIFIC FUNCTIONS
// ==============================================

/**
 * Get all students (Faculty only)
 * @returns {Promise<Object>} - Result object with students data
 */
export const getAllStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'Student')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, students: data };
  } catch (error) {
    console.error('Get students error:', error);
    return { success: false, error: 'Failed to fetch students' };
  }
};

/**
 * Get student by registration number
 * @param {string} regNumber - Registration number
 * @returns {Promise<Object>} - Result object with student data
 */
export const getStudentByRegNumber = async (regNumber) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('reg_number', regNumber)
      .eq('role', 'Student')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, student: data };
  } catch (error) {
    console.error('Get student error:', error);
    return { success: false, error: 'Student not found' };
  }
};

// ==============================================
// VALIDATION FUNCTIONS
// ==============================================

/**
 * Validate student email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid student email
 */
export const validateStudentEmail = (email) => {
  const studentEmailRegex = /^[0-9]+@srcas\.ac\.in$/;
  return studentEmailRegex.test(email);
};

/**
 * Validate faculty email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid faculty email
 */
export const validateFacultyEmail = (email) => {
  // Special test email for faculty access
  if (email === "ammugopal1116@gmail.com") {
    return true;
  }
  
  const facultyEmailRegex = /^[a-zA-Z]+@srcas\.ac\.in$/;
  return facultyEmailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: 'Password is valid' };
};

// ==============================================
// SESSION MANAGEMENT
// ==============================================

/**
 * Get current session
 * @returns {Promise<Object>} - Current session data
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, session };
  } catch (error) {
    console.error('Get session error:', error);
    return { success: false, error: 'Failed to get session' };
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function for auth changes
 * @returns {Function} - Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} - True if user is authenticated
 */
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Get current user
 * @returns {Promise<Object|null>} - Current user or null
 */
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

/**
 * Format user data for display
 * @param {Object} profile - User profile data
 * @returns {Object} - Formatted user data
 */
export const formatUserData = (profile) => {
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    department: profile.department,
    regNumber: profile.reg_number,
    deptYear: profile.dept_year,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  };
};

// ==============================================
// ERROR HANDLING
// ==============================================

/**
 * Handle Supabase errors
 * @param {Object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
export const handleSupabaseError = (error) => {
  if (!error) return 'An unknown error occurred';

  switch (error.code) {
    case '23505':
      return 'An account with this email already exists. Please try logging in instead.';
    case '23503':
      return 'Invalid reference data. Please check your input.';
    case '42501':
      return 'Access denied. You do not have permission to perform this action.';
    case 'PGRST116':
      return 'No data found. Please check your search criteria.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};
