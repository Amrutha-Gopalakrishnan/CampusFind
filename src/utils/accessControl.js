/**
 * Email-Restricted, Role-Based Access Control Utilities
 * 
 * This module provides code-level authentication and authorization
 * functions without modifying any SQL queries or database logic.
 * All validation happens in JavaScript before database operations.
 */

// ============================================
// EMAIL-BASED ROLE RESTRICTIONS (CODE LEVEL)
// ============================================

/**
 * Admin email constant - Only this email has admin access
 */
export const ADMIN_EMAIL = "amruthagopal16@gmail.com";

/**
 * Faculty email constant - Only this email has faculty access
 */
export const FACULTY_EMAIL = "ammugopal1116@gmail.com";

/**
 * Determine user role based on email address
 * 
 * @param {string} email - User's email address
 * @returns {string|null} Role: "admin", "faculty", "student", or null
 */
export const determineRoleFromEmail = (email) => {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  
  if (normalizedEmail === ADMIN_EMAIL) return "admin";
  if (normalizedEmail === FACULTY_EMAIL) return "faculty";
  return "student"; // All other emails are students
};

/**
 * Check if user has admin privileges
 * 
 * @param {Object} user - User object with email property
 * @returns {boolean} True if user is admin
 */
export const isAdminUser = (user) => {
  if (!user?.email) return false;
  return user.email.toLowerCase().trim() === ADMIN_EMAIL;
};

/**
 * Check if user has faculty privileges
 * 
 * @param {Object} user - User object with email property
 * @returns {boolean} True if user is faculty
 */
export const isFacultyUser = (user) => {
  if (!user?.email) return false;
  return user.email.toLowerCase().trim() === FACULTY_EMAIL;
};

/**
 * Check if user is a student
 * 
 * @param {Object} user - User object with email property
 * @returns {boolean} True if user is student
 */
export const isStudentUser = (user) => {
  if (!user?.email) return false;
  const normalizedEmail = user.email.toLowerCase().trim();
  return normalizedEmail !== ADMIN_EMAIL && normalizedEmail !== FACULTY_EMAIL;
};

/**
 * Validate if email is allowed for the selected user type
 * This is the main guard function called BEFORE any Supabase operations
 * 
 * @param {string} email - Email to validate
 * @param {string} userType - Selected user type: "admin", "faculty", or "student"
 * @returns {Object} Validation result with valid, role, message, and title properties
 */
export const validateEmailForUserType = (email, userType) => {
  if (!email) {
    return { 
      valid: false, 
      message: "Email is required",
      title: "Validation Error"
    };
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  const role = determineRoleFromEmail(normalizedEmail);
  
  // Admin validation
  if (userType === "admin") {
    if (normalizedEmail !== ADMIN_EMAIL) {
      return {
        valid: false,
        message: `Admin access is restricted. Only ${ADMIN_EMAIL} can access admin features.`,
        title: "Access Denied"
      };
    }
    return { valid: true, role: "admin" };
  }
  
  // Faculty validation
  if (userType === "faculty") {
    if (normalizedEmail !== FACULTY_EMAIL) {
      return {
        valid: false,
        message: `Faculty access is restricted. Only ${FACULTY_EMAIL} can access faculty features.`,
        title: "Access Denied"
      };
    }
    return { valid: true, role: "faculty" };
  }
  
  // Student validation - reject admin and faculty emails
  if (userType === "student") {
    if (normalizedEmail === ADMIN_EMAIL || normalizedEmail === FACULTY_EMAIL) {
      return {
        valid: false,
        message: "This email is reserved. Please use your student email.",
        title: "Invalid Email"
      };
    }
    return { valid: true, role: "student" };
  }
  
  return { 
    valid: false, 
    message: "Invalid user type",
    title: "Validation Error"
  };
};

/**
 * Get user role for display purposes
 * 
 * @param {Object} user - User object with email property
 * @returns {string} Role label: "Admin", "Faculty", or "Student"
 */
export const getUserRoleLabel = (user) => {
  if (isAdminUser(user)) return "Admin";
  if (isFacultyUser(user)) return "Faculty";
  return "Student";
};

/**
 * Check if user can access admin features
 * 
 * @param {Object} user - User object with email property
 * @returns {boolean} True if user can access admin features
 */
export const canAccessAdmin = (user) => {
  return isAdminUser(user);
};

/**
 * Check if user can access faculty features
 * 
 * @param {Object} user - User object with email property
 * @returns {boolean} True if user can access faculty features
 */
export const canAccessFaculty = (user) => {
  return isAdminUser(user) || isFacultyUser(user);
};

/**
 * Get access level number for the user
 * Higher numbers = more privileges
 * 
 * @param {Object} user - User object with email property
 * @returns {number} Access level: 3=admin, 2=faculty, 1=student, 0=none
 */
export const getUserAccessLevel = (user) => {
  if (isAdminUser(user)) return 3;
  if (isFacultyUser(user)) return 2;
  if (isStudentUser(user)) return 1;
  return 0;
};

/**
 * Filter menu items based on user role
 * 
 * @param {Array} menuItems - Array of menu item objects
 * @param {Object} user - User object with email property
 * @returns {Array} Filtered menu items
 */
export const filterMenuItemsByRole = (menuItems, user) => {
  return menuItems.filter(item => {
    if (item.adminOnly) {
      return isAdminUser(user);
    }
    if (item.facultyOnly) {
      return canAccessFaculty(user);
    }
    return true;
  });
};

// Export default object with all functions
export default {
  ADMIN_EMAIL,
  FACULTY_EMAIL,
  determineRoleFromEmail,
  isAdminUser,
  isFacultyUser,
  isStudentUser,
  validateEmailForUserType,
  getUserRoleLabel,
  canAccessAdmin,
  canAccessFaculty,
  getUserAccessLevel,
  filterMenuItemsByRole
};
