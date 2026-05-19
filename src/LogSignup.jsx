// LogSignup.jsx - Modern Role-Based Authentication
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import {
  Mail,
  Lock,
  User,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Building,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import { useAlert, CustomAlert } from "./CustomAlert";

// ============================================
// EMAIL-BASED ROLE RESTRICTIONS (CODE LEVEL)
// ============================================
const ADMIN_EMAIL = "amruthagopal16@gmail.com";
const FACULTY_EMAIL = "ammugopal1116@gmail.com";

// Determine role based on email (code-level logic)
const determineRoleFromEmail = (email) => {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  
  if (normalizedEmail === ADMIN_EMAIL) return "admin";
  if (normalizedEmail === FACULTY_EMAIL) return "faculty";
  return "student";
};

// Validate if email is allowed for the selected role (code-level guard)
const validateEmailForRole = (email, selectedRole) => {
  if (!email) return { valid: false, message: "Email is required" };
  
  const normalizedEmail = email.toLowerCase().trim();
  const actualRole = determineRoleFromEmail(normalizedEmail);
  
  // Check if email matches selected role
  if (actualRole !== selectedRole) {
    if (selectedRole === "admin") {
      return {
        valid: false,
        message: `Admin access is restricted to ${ADMIN_EMAIL} only.`,
        title: "Access Denied"
      };
    }
    if (selectedRole === "faculty") {
      return {
        valid: false,
        message: `Faculty access is restricted to ${FACULTY_EMAIL} only.`,
        title: "Access Denied"
      };
    }
    if (selectedRole === "student") {
      if (normalizedEmail === ADMIN_EMAIL || normalizedEmail === FACULTY_EMAIL) {
        return {
          valid: false,
          message: "This email is reserved. Please use your student email.",
          title: "Invalid Email"
        };
      }
    }
  }
  
  return { valid: true, role: actualRole };
};

// Password validation
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

const LogSignup = () => {
  const navigate = useNavigate();
  const { alert, success, error, warning, hideAlert } = useAlert();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    regNo: "",
    department: "",
  });

  const roles = [
    { value: "student", label: "Student", icon: GraduationCap, color: "blue" },
    { value: "faculty", label: "Faculty", icon: Building, color: "purple" },
    { value: "admin", label: "Admin", icon: Shield, color: "red" },
  ];

  const selectedRoleData = roles.find(r => r.value === formData.role);

  // Helper to ensure profile exists
  const ensureProfileExists = async ({ id, email, full_name, role, department, reg_number, dept_year }) => {
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (!existing) {
        const payload = {
          id,
          email,
          full_name: full_name ?? null,
          role: role ?? "student",
          department: department ?? null,
          reg_number: reg_number ?? null,
          dept_year: dept_year ?? null,
          phone: null,
          alt_phone: null,
          avatar_url: null,
        };

        const { error: insertErr } = await supabase.from("profiles").insert([payload]);
        if (insertErr) {
          console.error("Failed to create profile:", insertErr);
          error("Failed to create profile. See console for details.");
        }
      }
    } catch (err) {
      console.error("ensureProfileExists error:", err);
      error("Unexpected error while creating profile.");
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ CODE-LEVEL EMAIL VALIDATION (before any Supabase call)
    const emailValidation = validateEmailForRole(formData.email, formData.role);
    if (!emailValidation.valid) {
      error(emailValidation.message, emailValidation.title || "Validation Error");
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      warning("Password must contain uppercase, lowercase, and a number (min 6 chars).", "Weak Password");
      setLoading(false);
      return;
    }

    try {
      // ✅ Only proceed with Supabase after validation passes
      const { data, error: signErr } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signErr) throw signErr;

      const user = data?.user ?? data?.session?.user;
      if (user) {
        // ✅ Use validated role
        await ensureProfileExists({
          id: user.id,
          email: user.email,
          full_name: formData.fullName,
          role: emailValidation.role,
          department: formData.department,
          reg_number: formData.regNo,
          dept_year: formData.department,
        });

        success("Account created successfully! You can now login.", "Signup Success");
        setIsLogin(true);
        setFormData({ ...formData, password: "" });
      }
    } catch (err) {
      console.error("Signup error:", err);
      if (err?.message) error(err.message);
      else error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ CODE-LEVEL EMAIL VALIDATION (before any Supabase call)
    const emailValidation = validateEmailForRole(formData.email, formData.role);
    if (!emailValidation.valid) {
      error(emailValidation.message, emailValidation.title || "Validation Error");
      setLoading(false);
      return;
    }

    try {
      // ✅ Only proceed with Supabase after validation passes
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginErr) throw loginErr;

      const user = data?.user ?? data?.session?.user;
      if (!user) {
        warning("Login may require email confirmation. Check your inbox.", "Login Notice");
        setLoading(false);
        return;
      }

      // ✅ Ensure profile exists with validated role
      await ensureProfileExists({
        id: user.id,
        email: user.email,
        full_name: formData.fullName || null,
        role: emailValidation.role,
        department: formData.department || null,
        reg_number: formData.regNo || null,
        dept_year: formData.department || null,
      });

      success("Login successful!", `${selectedRoleData.label} Login`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err?.message) error(err.message);
      else error("Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-4 md:p-6">
      <CustomAlert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        duration={alert.duration}
        onClose={hideAlert}
      />

      <div className="w-full max-w-6xl">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Form */}
            <div className="p-8 md:p-12">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900">
                  {isLogin ? "Welcome Back" : "Get Started"}
                </h1>
                <p className="text-gray-600 text-center mt-2">
                  {isLogin 
                    ? "Login to your CampusFind account" 
                    : "Create your CampusFind account"}
                </p>
              </div>

              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
                {/* Role Selector */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Your Role
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center gap-3">
                      {React.createElement(selectedRoleData.icon, { 
                        className: `w-5 h-5 text-${selectedRoleData.color}-600` 
                      })}
                      <span className="font-semibold text-gray-900">
                        {selectedRoleData.label}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showRoleDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, role: role.value });
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                              formData.role === role.value ? 'bg-blue-50' : ''
                            }`}
                          >
                            <Icon className={`w-5 h-5 text-${role.color}-600`} />
                            <span className="font-semibold text-gray-900">{role.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Full Name (Signup only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required={!isLogin}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="m@example.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Additional Fields for Students (Signup only) */}
                {!isLogin && formData.role === "student" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Register Number
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required={!isLogin && formData.role === "student"}
                        value={formData.regNo}
                        onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                        placeholder="e.g., 23127006"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Department (Signup only for Student/Faculty) */}
                {!isLogin && (formData.role === "student" || formData.role === "faculty") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {formData.role === "student" ? "Department & Year" : "Department"}
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required={!isLogin && (formData.role === "student" || formData.role === "faculty")}
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder={formData.role === "student" ? "e.g., CSE 3rd Year" : "e.g., Computer Science"}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl hover:scale-[1.02]"
                  }`}
                >
                  {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                </button>

                {/* Toggle Login/Signup */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {isLogin ? "Sign up" : "Login"}
                    </button>
                  </p>
                </div>
              </form>

              {/* Home Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  ← Back to Home
                </button>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden md:flex relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 items-center justify-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS04IDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
              
              <div className="relative z-10 text-center">
                {/* CampusFind Logo */}
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4">
                    CampusFind
                  </h2>
                  <p className="text-xl text-white/90 font-medium mb-8">
                    Lost & Found System
                  </p>
                </div>

                {/* Illustration */}
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-bold">For Students</h3>
                        <p className="text-white/70 text-sm">Find lost items easily</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-bold">For Faculty</h3>
                        <p className="text-white/70 text-sm">Manage lost items</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-bold">For Admins</h3>
                        <p className="text-white/70 text-sm">Full system control</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-white/60 text-sm">
                  <p>"Find it. Return it. Simplify Campus Life."</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default LogSignup;
