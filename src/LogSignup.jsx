import React, { useState } from "react";
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
  Home,
  AlertCircle,
} from "lucide-react";
import { useAlert, CustomAlert } from "./CustomAlert";

// ✅ Password validation: at least one lowercase, uppercase, and digit
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

const LogSignup = () => {
  const navigate = useNavigate();
  const { alert, success, error, warning, info, hideAlert } = useAlert();

  // 🧩 State Management
  const [userType, setUserType] = useState("student");
  const [formType, setFormType] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingProfile, setPendingProfile] = useState(null);

  // Student Data
  const [studentSignup, setStudentSignup] = useState({
    name: "",
    regNo: "",
    deptYear: "",
    collegeEmail: "",
    password: "",
  });
  const [studentLogin, setStudentLogin] = useState({
    email: "",
    password: "",
  });

  // Faculty Data
  const [facultySignup, setFacultySignup] = useState({
    name: "",
    department: "",
    collegeEmail: "",
    password: "",
  });
  const [facultyLogin, setFacultyLogin] = useState({
    email: "",
    password: "",
  });

  // ===============================
  // ✅ OTP Verification Handler
  // ===============================
  const handleVerifyOtp = async () => {
    try {
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        email: pendingProfile.email,
        token: otpCode,
        type: "email",
      });
      if (otpError) throw otpError;

      if (data?.user) {
        const profile = pendingProfile;

        // ✅ Set password after OTP verified
        const { error: pwdError } = await supabase.auth.updateUser({
          password: profile.password,
        });
        if (pwdError) {
          warning(
            "Account created, but password didn’t meet strength rules. Please reset password before login.",
            "Weak Password"
          );
        }

        // ✅ Create user profile
        const { error: rpcError } = await supabase.rpc("create_user_profile", {
          user_id: data.user.id,
          user_email: profile.email,
          user_name: profile.name,
          user_role: profile.role,
          user_department: profile.department,
          user_reg_number: profile.reg_number,
          user_dept_year: profile.dept_year,
          user_phone: null,
          user_alt_phone: null,
          user_avatar_url: null,
        });
        if (rpcError) console.error("Profile creation failed:", rpcError);

        success("Email verified successfully! You can now log in.", "Verification Success");
        setOtpSent(false);
        setOtpCode("");
        setPendingProfile(null);
        setFormType("login");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      error("Invalid OTP. Please try again.");
      setOtpCode("");
    }
  };

  // ===============================
  // ✅ Student Signup via OTP
  // ===============================
  const handleStudentSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(studentSignup.password)) {
      warning("Password must contain uppercase, lowercase, and a number.", "Weak Password");
      setLoading(false);
      return;
    }

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: studentSignup.collegeEmail,
        options: { shouldCreateUser: true },
      });
      if (otpError) throw otpError;

      info("OTP sent to your college email!", "Verification Pending");
      setPendingProfile({
        email: studentSignup.collegeEmail,
        name: studentSignup.name,
        role: "Student",
        department: studentSignup.deptYear,
        reg_number: studentSignup.regNo,
        dept_year: studentSignup.deptYear,
        password: studentSignup.password,
      });
      setOtpSent(true);
    } catch (err) {
      console.error("Student signup error:", err);
      error("Error sending OTP. Please check your email format.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Faculty Signup via OTP
  const handleFacultySignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(facultySignup.password)) {
      warning("Password must contain uppercase, lowercase, and a number.", "Weak Password");
      setLoading(false);
      return;
    }

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: facultySignup.collegeEmail,
        options: { shouldCreateUser: true },
      });
      if (otpError) throw otpError;

      info("OTP sent to your faculty email!", "Verification Pending");
      setPendingProfile({
        email: facultySignup.collegeEmail,
        name: facultySignup.name,
        role: "Faculty",
        department: facultySignup.department,
        reg_number: null,
        dept_year: null,
        password: facultySignup.password,
      });
      setOtpSent(true);
    } catch (err) {
      console.error("Faculty signup error:", err);
      error("Error sending OTP. Please check your email format.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✅ Login Handlers
  // ===============================
  const handleStudentLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: studentLogin.email,
        password: studentLogin.password,
      });
      if (loginError) throw loginError;
      success("Login successful!", "Student Login");
      navigate("/dashboard");
    } catch (err) {
      console.error("Student login error:", err);
      error("Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: facultyLogin.email,
        password: facultyLogin.password,
      });
      if (loginError) throw loginError;
      success("Login successful!", "Faculty Login");
      navigate("/dashboard");
    } catch (err) {
      console.error("Faculty login error:", err);
      error("Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✅ Main UI
  // ===============================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-12 px-4">
      <CustomAlert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        duration={alert.duration}
        onClose={hideAlert}
      />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">CampusFind</h1>
          <p className="text-center text-gray-600 font-medium text-sm">
            A secure platform for students and faculty to manage lost and found belongings.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700 hover:opacity-90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* User Type Toggle */}
        <div className="flex mb-6 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
          {["student", "faculty"].map((type) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`flex-1 py-3 font-bold text-lg transition-all duration-300 ${
                userType === type
                  ? "text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700 hover:opacity-90"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {type === "student" ? (
                  <>
                    <GraduationCap className="w-5 h-5" /> Student
                  </>
                ) : (
                  <>
                    <Building className="w-5 h-5" /> Faculty
                  </>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Form Type Toggle */}
        <div className="flex mb-6 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
          {["login", "signup"].map((type) => (
            <button
              key={type}
              onClick={() => setFormType(type)}
              className={`flex-1 py-3 font-bold text-lg transition-all duration-300 ${
                formType === type
                  ? "text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700 hover:opacity-90"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Forms */}
        {formType === "login" ? (
          userType === "student" ? (
            <form onSubmit={handleStudentLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">College Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={studentLogin.email}
                    onChange={(e) => setStudentLogin({ ...studentLogin, email: e.target.value })}
                    placeholder="e.g., 23127006@srcas.ac.in"
                    className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={studentLogin.password}
                    onChange={(e) => setStudentLogin({ ...studentLogin, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFacultyLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Faculty Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={facultyLogin.email}
                    onChange={(e) => setFacultyLogin({ ...facultyLogin, email: e.target.value })}
                    placeholder="e.g., john@srcas.ac.in"
                    className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={facultyLogin.password}
                    onChange={(e) => setFacultyLogin({ ...facultyLogin, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )
        ) : userType === "student" ? (
          <form onSubmit={handleStudentSignupSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={studentSignup.name}
                  onChange={(e) => setStudentSignup({ ...studentSignup, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Register Number</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={studentSignup.regNo}
                  onChange={(e) => setStudentSignup({ ...studentSignup, regNo: e.target.value })}
                  placeholder="Enter your register number"
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Department & Year</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={studentSignup.deptYear}
                  onChange={(e) => setStudentSignup({ ...studentSignup, deptYear: e.target.value })}
                  placeholder="e.g., CSE 3rd Year"
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">College Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={studentSignup.collegeEmail}
                  onChange={(e) =>
                    setStudentSignup({ ...studentSignup, collegeEmail: e.target.value })
                  }
                  placeholder="e.g., 23127006@srcas.ac.in"
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={studentSignup.password}
                  onChange={(e) =>
                    setStudentSignup({ ...studentSignup, password: e.target.value })
                  }
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              } text-white`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFacultySignupSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={facultySignup.name}
                  onChange={(e) => setFacultySignup({ ...facultySignup, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Department</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={facultySignup.department}
                  onChange={(e) =>
                    setFacultySignup({ ...facultySignup, department: e.target.value })
                  }
                  placeholder="e.g., Computer Science"
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">College Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={facultySignup.collegeEmail}
                  onChange={(e) =>
                    setFacultySignup({ ...facultySignup, collegeEmail: e.target.value })
                  }
                  placeholder="e.g., senthil@srcas.ac.in"
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={facultySignup.password}
                  onChange={(e) =>
                    setFacultySignup({ ...facultySignup, password: e.target.value })
                  }
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-6 text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700 hover:opacity-90 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700 hover:opacity-90"
              } text-white`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>

      {/* ✅ OTP Modal */}
      {otpSent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Email Verification</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the 6-digit OTP sent to <b>{pendingProfile.email}</b>
            </p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              className="w-full text-center border rounded-lg py-2 mb-4 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter OTP"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700 hover:opacity-90 font-semibold py-2 rounded-lg hover:scale-105 transition-all"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogSignup;
