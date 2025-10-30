import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Building,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Home,
} from "lucide-react";
import { useAlert, CustomAlert } from "./CustomAlert";
import { toast } from "react-toastify";

const LogSignup = ({ initialTab = "login", setUser }) => {
  const { alert, success, error, warning, info, hideAlert } = useAlert();
  // Main state
  const [userType, setUserType] = useState("student");
  const [formType, setFormType] = useState(initialTab);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Student forms
  const [studentLoginData, setStudentLoginData] = useState({
    regNo: "",
    email: "",
    password: "",
  });
  const [studentSignupData, setStudentSignupData] = useState({
    name: "",
    regNo: "",
    deptYear: "",
    collegeEmail: "",
    password: "",
  });

  // Faculty forms
  const [facultyLoginData, setFacultyLoginData] = useState({
    collegeEmail: "",
    password: "",
  });
  const [facultySignupData, setFacultySignupData] = useState({
    name: "",
    department: "",
    collegeEmail: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Place near top of component (immediately inside LogSignup)
  const redirectTo = `${window.location.origin}/verified`;

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      // update local state when auth changes
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setIsLoggedIn(true);
          setLoggedInUser(session.user);
          await fetchUserProfile();
        }
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setLoggedInUser(null);
        setUserProfile(null);
      }
    });

    // cleanup
    return () => {
      try {
        data?.subscription?.unsubscribe();
      } catch (e) {
        // ignore cleanup errors
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthState = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setLoggedInUser(session.user);
        await fetchUserProfile();
      }
    } catch (err) {
      console.error("checkAuthState error:", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // get_user_profile is a SECURITY DEFINER function that uses auth.uid()
      // ensure session exists before calling it (RLS-safe)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        // no session — nothing to fetch
        return;
      }

      const { data, error } = await supabase.rpc("get_user_profile");
      if (error) {
        // show lightweight warning for permission issues but don't crash the UI
        console.error("Error fetching profile (rpc get_user_profile):", error);
        if (error.status === 403) {
          warning(
            "Unable to fetch profile due to database permissions. Please contact admin.",
            "Permission Denied"
          );
          return;
        }
        return;
      }
      if (data && data.length > 0) {
        setUserProfile(data[0]);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Email validation
  const validateStudentEmail = (email) =>
    /^[0-9]+@srcas\.ac\.in$/.test(email);
  const validateFacultyEmail = (email) => {
    if (!email) return false;
    // Special test email for faculty access
    if (email === "ammugopal1116@gmail.com") {
      return true;
    }
    return /^[a-zA-Z]+@srcas\.ac\.in$/.test(email);
  };

  // Form handlers
  const handleStudentLoginChange = (e) => {
    const { name, value } = e.target;
    setStudentLoginData({ ...studentLoginData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleStudentSignupChange = (e) => {
    const { name, value } = e.target;
    setStudentSignupData({ ...studentSignupData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFacultyLoginChange = (e) => {
    const { name, value } = e.target;
    setFacultyLoginData({ ...facultyLoginData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFacultySignupChange = (e) => {
    const { name, value } = e.target;
    setFacultySignupData({ ...facultySignupData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const toggleUserType = () => {
    setUserType(userType === "student" ? "faculty" : "student");
    resetForms();
  };

  // Form validation function
  const validateForm = (data, type) => {
    const newErrors = {};

    if (type === "studentLogin") {
      if (!data.email) newErrors.email = "Email is required";
      else if (!validateStudentEmail(data.email)) {
        newErrors.email = "Student email must be in format: numbers@srcas.ac.in";
      }
      if (!data.password) newErrors.password = "Password is required";
    }

    if (type === "facultyLogin") {
      if (!data.collegeEmail) newErrors.collegeEmail = "Email is required";
      else if (!validateFacultyEmail(data.collegeEmail)) {
        newErrors.collegeEmail =
          "Faculty email must be in format: letters@srcas.ac.in";
      }
      if (!data.password) newErrors.password = "Password is required";
    }

    if (type === "studentSignup") {
      if (!data.name) newErrors.name = "Name is required";
      if (!data.regNo) newErrors.regNo = "Register number is required";
      if (!data.deptYear) newErrors.deptYear =
        "Department & Year is required";
      if (!data.collegeEmail) newErrors.collegeEmail = "Email is required";
      else if (!validateStudentEmail(data.collegeEmail)) {
        newErrors.collegeEmail =
          "Student email must be in format: numbers@srcas.ac.in";
      }
      if (!data.password) newErrors.password = "Password is required";
      else if (data.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    }

    if (type === "facultySignup") {
      if (!data.name) newErrors.name = "Name is required";
      if (!data.department) newErrors.department = "Department is required";
      if (!data.collegeEmail) newErrors.collegeEmail = "Email is required";
      else if (!validateFacultyEmail(data.collegeEmail)) {
        newErrors.collegeEmail =
          "Faculty email must be in format: letters@srcas.ac.in";
      }
      if (!data.password) newErrors.password = "Password is required";
      else if (data.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  // Reset all forms
  const resetForms = () => {
    setStudentLoginData({ regNo: "", email: "", password: "" });
    setStudentSignupData({
      name: "",
      regNo: "",
      deptYear: "",
      collegeEmail: "",
      password: "",
    });
    setFacultyLoginData({ collegeEmail: "", password: "" });
    setFacultySignupData({ name: "", department: "", collegeEmail: "", password: "" });
    setErrors({});
  };

  // STUDENT LOGIN HANDLER
  const handleStudentLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = validateForm(studentLoginData, "studentLogin");
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: studentLoginData.email,
        password: studentLoginData.password,
      });

      if (signInError) {
        console.error("Student login error:", signInError);
        if (signInError.message?.includes("Invalid login credentials")) {
          warning(
            "Account not found or password incorrect. Please sign up first if you haven't created an account.",
            "Account Not Found"
          );
        } else if (signInError.message?.includes("Email not confirmed")) {
          warning(
            "Please check your email and click the verification link to confirm your account before logging in.",
            "Email Verification Required"
          );
        } else if (signInError.status === 400) {
          warning("Account not found. Please sign up first to create your account.", "Sign Up Required");
        } else {
          error("Login failed: " + signInError.message, "Login Failed");
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        setIsLoggedIn(true);
        setLoggedInUser(data.user);
        if (setUser) setUser(data.user);
        await fetchUserProfile();
        success("Student login successful!", "Login Success");
        navigate("/dashboard");
      } else {
        error("Login failed: No user data received", "Login Failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      error("Login failed. Please try again.", "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // FACULTY LOGIN HANDLER
  const handleFacultyLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = validateForm(facultyLoginData, "facultyLogin");
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: facultyLoginData.collegeEmail,
        password: facultyLoginData.password,
      });

      if (signInError) {
        console.error("Faculty login error:", signInError);
        if (signInError.message?.includes("Invalid login credentials")) {
          warning(
            "Account not found or password incorrect. Please sign up first if you haven't created an account.",
            "Account Not Found"
          );
        } else if (signInError.message?.includes("Email not confirmed")) {
          warning(
            "Please check your email and click the verification link to confirm your account before logging in.",
            "Email Verification Required"
          );
        } else if (signInError.status === 400) {
          warning("Account not found. Please sign up first to create your account.", "Sign Up Required");
        } else {
          error("Login failed: " + signInError.message, "Login Failed");
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        setIsLoggedIn(true);
        setLoggedInUser(data.user);
        if (setUser) setUser(data.user);
        await fetchUserProfile();
        success("Faculty login successful!", "Login Success");
        navigate("/dashboard");
      } else {
        error("Login failed: No user data received", "Login Failed");
      }
    } catch (err) {
      console.error("Faculty login error:", err);
      error("Login failed. Please try again.", "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // STUDENT SIGNUP HANDLER
  const handleStudentSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = validateForm(studentSignupData, "studentSignup");
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // use current origin so verification link always comes back to this environment

      await supabase.auth.signOut();
      localStorage.clear();     

      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: studentSignupData.collegeEmail,
        password: studentSignupData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: studentSignupData.name,
            reg_number: studentSignupData.regNo,
            dept_year: studentSignupData.deptYear,
            role: "Student",
          },
        },
      });

      if (signupError) {
        console.error("Student signUp error:", signupError);
        error("Signup failed: " + signupError.message, "Signup Failed");
        setLoading(false);
        return;
      }

      // If sign up returned a user but no session, it means verification is required.
      if (signupData?.user && !signupData?.session) {
        info(
          "Verification link has been sent to your registered email. Please check your inbox and verify your email before logging in.",
          "Verification Email Sent"
        );

        // store pending profile (will be read on /verified page)
        localStorage.setItem(
          "pending_profile",
          JSON.stringify({
            user_id: signupData.user.id,
            email: studentSignupData.collegeEmail,
            name: studentSignupData.name,
            role: "Student",
            department: studentSignupData.deptYear,
            reg_number: studentSignupData.regNo,
            dept_year: studentSignupData.deptYear,
          })
        );

        resetForms();
        setFormType("login");
        setLoading(false);
        return;
      }

      // If we have a user and a session (rare if verification disabled), create profile immediately
      if (signupData?.user) {
        const { error: profileError } = await supabase.rpc("create_user_profile", {
          user_id: signupData.user.id,
          user_email: studentSignupData.collegeEmail,
          user_name: studentSignupData.name,
          user_role: "Student",
          user_department: studentSignupData.deptYear,
          user_reg_number: studentSignupData.regNo,
          user_dept_year: studentSignupData.deptYear,
          user_phone: null,
          user_alt_phone: null,
          user_avatar_url: null,
        });

        if (profileError && profileError.code !== "23505") {
          console.error("Profile creation failed:", profileError);
          error("Profile creation failed: " + profileError.message, "Profile Creation Failed");
          setLoading(false);
          return;
        }
      }

      // try to sign in automatically if session present
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: studentSignupData.collegeEmail,
          password: studentSignupData.password,
        });

        if (loginError) {
          // likely "Email not confirmed" — show info and move on
          if (loginError.message?.includes("Email not confirmed")) {
            warning("Please verify your email before logging in.", "Email Verification Required");
          } else {
            success("Signup successful! Please login manually.", "Signup Success");
          }
        } else if (loginData?.user) {
          setIsLoggedIn(true);
          setLoggedInUser(loginData.user);
          if (setUser) setUser(loginData.user);
          await fetchUserProfile();
          success("Student signup and login successful!", "Signup Success");
          navigate("/dashboard");
          return;
        }
      } catch (e) {
        console.error("Auto-login after signup error:", e);
      }

      success("Student signup successful! You can now login.", "Signup Success");
      resetForms();
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // FACULTY SIGNUP HANDLER
  const handleFacultySignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = validateForm(facultySignupData, "facultySignup");
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {

      await supabase.auth.signOut();
      localStorage.clear();

      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: facultySignupData.collegeEmail,
        password: facultySignupData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: facultySignupData.name,
            role: "Faculty",
            department: facultySignupData.department,
          },
        },
      });

      if (signupError) {
        console.error("Faculty signUp error:", signupError);
        error("Signup failed: " + signupError.message, "Signup Failed");
        setLoading(false);
        return;
      }

      // If sign up returned a user but no session, verification required
      if (signupData?.user && !signupData?.session) {
        info(
          "Verification link has been sent to your registered email. Please check your inbox and verify your email before logging in.",
          "Verification Email Sent"
        );

        // store pending profile
        localStorage.setItem(
          "pending_profile",
          JSON.stringify({
            user_id: signupData.user.id,
            email: facultySignupData.collegeEmail,
            name: facultySignupData.name,
            role: "Faculty",
            department: facultySignupData.department,
          })
        );

        resetForms();
        setFormType("login");
        setLoading(false);
        return;
      }

      // If session present (verification disabled), create profile immediately
      if (signupData?.user) {
        const { error: profileError } = await supabase.rpc("create_user_profile", {
          user_id: signupData.user.id,
          user_email: facultySignupData.collegeEmail,
          user_name: facultySignupData.name,
          user_role: "Faculty",
          user_department: facultySignupData.department,
          user_reg_number: null,
          user_dept_year: null,
          user_phone: null,
          user_alt_phone: null,
          user_avatar_url: null,
        });

        if (profileError && profileError.code !== "23505") {
          console.error("Faculty profile creation failed:", profileError);
          error("Profile creation failed: " + profileError.message, "Profile Creation Failed");
          setLoading(false);
          return;
        }
      }

      // try auto sign-in if possible
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: facultySignupData.collegeEmail,
          password: facultySignupData.password,
        });

        if (loginError) {
          if (loginError.message?.includes("Email not confirmed")) {
            warning("Please verify your email before logging in.", "Email Verification Required");
          } else {
            success("Signup successful! Please login manually.", "Signup Success");
          }
        } else if (loginData?.user) {
          setIsLoggedIn(true);
          setLoggedInUser(loginData.user);
          if (setUser) setUser(loginData.user);
          await fetchUserProfile();
          success("Faculty signup and login successful!", "Signup Success");
          navigate("/dashboard");
          return;
        }
      } catch (e) {
        console.error("Auto-login after faculty signup error:", e);
      }

      success("Faculty signup successful! You can now login.", "Signup Success");
      resetForms();
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setUserProfile(null);
    resetForms();
    success("Logged out successfully!", "Logout Success");
  };

  // If user is logged in, show logged-in card
  if (isLoggedIn && loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-12 px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-blue-600 font-semibold mb-4">✅ Logged in as {loggedInUser.email}</p>
          {userProfile && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-gray-700 mb-1"><strong>Name:</strong> {userProfile.full_name}</p>
              <p className="text-gray-700 mb-1"><strong>Role:</strong> {userProfile.role}</p>
              {userProfile.role === "Student" && (
                <>
                  <p className="text-gray-700 mb-1"><strong>Reg Number:</strong> {userProfile.reg_number}</p>
                  <p className="text-gray-700 mb-1"><strong>Department:</strong> {userProfile.dept_year}</p>
                </>
              )}
              {userProfile.role === "Faculty" && (
                <p className="text-gray-700 mb-1"><strong>Department:</strong> {userProfile.department}</p>
              )}
            </div>
          )}
          <div className="space-y-3">
            <button
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
            <button
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main UI (login/signup)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-12 px-4">
      {/* Custom Alert Component */}
      <CustomAlert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        duration={alert.duration}
        onClose={hideAlert}
      />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">CampusFind</h1>
          <p className="text-center text-gray-600 font-medium text-sm">
            A secure platform for students to report and reclaim lost belongings.
          </p>

          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* User Type Toggle */}
        <div className="flex mb-6 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
          <button
            onClick={() => setUserType("student")}
            className={`flex-1 py-3 font-bold text-lg transition-all duration-300 ${
              userType === "student"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Student
            </div>
          </button>
          <button
            onClick={() => setUserType("faculty")}
            className={`flex-1 py-3 font-bold text-lg transition-all duration-300 ${
              userType === "faculty"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building className="w-5 h-5" />
              Faculty
            </div>
          </button>
        </div>

        {/* Form Type Toggle */}
        <div className="flex mb-6 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
          <button
            onClick={() => setFormType("login")}
            className={`flex-1 py-3 font-bold text-lg transition-all duration-300 ${
              formType === "login"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setFormType("signup")}
            className={`flex-1 py-3 font-bold text-lg transition-all duration-300 ${
              formType === "signup"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Student Forms */}
        {userType === "student" ? (
          <>
            {formType === "login" ? (
              <form className="space-y-6" onSubmit={handleStudentLoginSubmit}>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Register Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="regNo"
                      value={studentLoginData.regNo}
                      onChange={handleStudentLoginChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.regNo ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your register number"
                      required
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.regNo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.regNo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">College Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={studentLoginData.email}
                      onChange={handleStudentLoginChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 23127006@srcas.ac.in"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={studentLoginData.password}
                      onChange={handleStudentLoginChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  } text-white`}
                >
                  {loading ? "Logging in..." : "Student Login"}
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleStudentSignupSubmit}>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={studentSignupData.name}
                      onChange={handleStudentSignupChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Register Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="regNo"
                      value={studentSignupData.regNo}
                      onChange={handleStudentSignupChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.regNo ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your register number"
                      required
                    />
                    <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.regNo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.regNo}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Department & Year</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="deptYear"
                      value={studentSignupData.deptYear}
                      onChange={handleStudentSignupChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.deptYear ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g. CSE 3rd Year"
                      required
                    />
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.deptYear && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.deptYear}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">College Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="collegeEmail"
                      value={studentSignupData.collegeEmail}
                      onChange={handleStudentSignupChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.collegeEmail ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 23127006@srcas.ac.in"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.collegeEmail && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.collegeEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={studentSignupData.password}
                      onChange={handleStudentSignupChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Create a password"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  } text-white`}
                >
                  {loading ? "Creating Account..." : "Student SignUp"}
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            {formType === "login" ? (
              <form className="space-y-6" onSubmit={handleFacultyLoginSubmit}>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">College Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="collegeEmail"
                      value={facultyLoginData.collegeEmail}
                      onChange={handleFacultyLoginChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.collegeEmail ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., senthil@srcas.ac.in"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.collegeEmail && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.collegeEmail}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={facultyLoginData.password}
                      onChange={handleFacultyLoginChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  } text-white`}
                >
                  {loading ? "Logging in..." : "Faculty Login"}
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleFacultySignupSubmit}>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={facultySignupData.name}
                      onChange={handleFacultySignupChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Department</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="department"
                      value={facultySignupData.department}
                      onChange={handleFacultySignupChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.department ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g. Computer Science, Mathematics"
                      required
                    />
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.department}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">College Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="collegeEmail"
                      value={facultySignupData.collegeEmail}
                      onChange={handleFacultySignupChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.collegeEmail ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., senthil@srcas.ac.in"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.collegeEmail && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.collegeEmail}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={facultySignupData.password}
                      onChange={handleFacultySignupChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Create a password"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  } text-white`}
                >
                  {loading ? "Creating Account..." : "Faculty SignUp"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LogSignup;
