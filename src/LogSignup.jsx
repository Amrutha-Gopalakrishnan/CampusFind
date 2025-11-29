// LogSignup.jsx
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
} from "lucide-react";
import { useAlert, CustomAlert } from "./CustomAlert";

// password must contain at least one lowercase, uppercase, digit, min 6 chars
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

const LogSignup = () => {
  const navigate = useNavigate();
  const { alert, success, error, warning, info, hideAlert } = useAlert();

  const [userType, setUserType] = useState("student"); // "student" | "faculty"
  const [formType, setFormType] = useState("login"); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Student
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

  // Faculty
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

  // ---------- Helpers ----------
  const normalizeRole = (role) =>
    role && role.toLowerCase().startsWith("fac") ? "faculty" : "student";

  // insert profile after signup/login (user must be authenticated)
  const ensureProfileExists = async ({
    id,
    email,
    full_name,
    role,
    department,
    reg_number,
    dept_year,
  }) => {
    try {
      // try to fetch profile (server RLS ensures we can only see our own)
      const { data: existing, error: selectErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (selectErr) {
        console.error("Error checking existing profile:", selectErr);
        // continue — attempt insert (insert may fail if constraint)
      }

      if (!existing) {
        // Prepare payload. If email is the test email, set role to 'admin' so server's chk allows it.
        const testEmail = "ammugopal1116@gmail.com";
        const roleToInsert = email === testEmail ? "admin" : role ?? "student";

        const payload = {
          id,
          email,
          full_name: full_name ?? null,
          role: roleToInsert,
          department: department ?? null,
          reg_number: reg_number ?? null,
          dept_year: dept_year ?? null,
          phone: null,
          alt_phone: null,
          avatar_url: null,
        };

        const { error: insertErr } = await supabase.from("profiles").insert([payload]);

        if (insertErr) {
          // log detailed error for debugging; surface friendly message
          console.error("Failed to create profile:", insertErr);
          // If constraint violation on email format, give a helpful message
          if (insertErr.code === "23514" || (insertErr.message && insertErr.message.includes("chk_email_format"))) {
            error("Profile creation blocked by email-format rule. If you're testing, use the test email or correct the email format for students/faculty.");
          } else {
            error("Failed to create profile. See console for details.");
          }
        } else {
          console.log("Profile created for", id);
        }
      } else {
        console.log("Profile already exists for", id);
      }
    } catch (err) {
      console.error("ensureProfileExists error:", err);
      error("Unexpected error while creating profile.");
    }
  };

  // ---------- SIGNUP handlers (use signUp for reliability) ----------
  const handleStudentSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(studentSignup.password)) {
      warning("Password must contain uppercase, lowercase, and a number (min 6 chars).", "Weak Password");
      setLoading(false);
      return;
    }

    try {
      // sign up via Supabase
      const { data, error: signErr } = await supabase.auth.signUp({
        email: studentSignup.collegeEmail,
        password: studentSignup.password,
      });

      if (signErr) throw signErr;

      // When signUp returns a user object immediately (depends on Supabase settings),
      // we can create profile now. Otherwise instruct user to verify email.
      const user = data?.user ?? data?.session?.user;
      if (user) {
        await ensureProfileExists({
          id: user.id,
          email: user.email,
          full_name: studentSignup.name,
          role: "student",
          department: studentSignup.deptYear,
          reg_number: studentSignup.regNo,
          dept_year: studentSignup.deptYear,
        });

        success("Account created. Please verify your email if required, then login.", "Signup Success");
        setFormType("login");
      } else {
        info("Check your email for a confirmation link. After verifying, log in.", "Verify Email");
        setFormType("login");
      }
    } catch (err) {
      console.error("Student signup error:", err);
      // Supabase errors often have message property
      if (err?.status === 400 || err?.message?.includes("invalid")) {
        error("Invalid signup data. Check email format and password rules.");
      } else if (err?.message) {
        error(err.message);
      } else {
        error("Signup failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacultySignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(facultySignup.password)) {
      warning("Password must contain uppercase, lowercase, and a number (min 6 chars).", "Weak Password");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: facultySignup.collegeEmail,
        password: facultySignup.password,
      });

      if (signErr) throw signErr;

      const user = data?.user ?? data?.session?.user;
      if (user) {
        await ensureProfileExists({
          id: user.id,
          email: user.email,
          full_name: facultySignup.name,
          role: "faculty",
          department: facultySignup.department,
          reg_number: null,
          dept_year: null,
        });

        success("Account created. Please verify your email if required, then login.", "Signup Success");
        setFormType("login");
      } else {
        info("Check your email for a confirmation link. After verifying, log in.", "Verify Email");
        setFormType("login");
      }
    } catch (err) {
      console.error("Faculty signup error:", err);
      if (err?.message) error(err.message);
      else error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- LOGIN handlers ----------
  const handleStudentLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: studentLogin.email,
        password: studentLogin.password,
      });

      if (loginErr) throw loginErr;

      // Resolve user object (new API might return data.user or data.session.user)
      const user = data?.user ?? data?.session?.user;
      if (!user) {
        warning("Login may require email confirmation. Check your inbox.", "Login Notice");
        setLoading(false);
        return;
      }

      // Ensure profile exists (create if missing)
      await ensureProfileExists({
        id: user.id,
        email: user.email,
        full_name: null,
        role: "student",
        department: null,
        reg_number: null,
        dept_year: null,
      });

      success("Login successful!", "Student Login");
      navigate("/dashboard");
    } catch (err) {
      console.error("Student login error:", err);
      if (err?.message) error(err.message);
      else error("Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email: facultyLogin.email,
        password: facultyLogin.password,
      });
      if (loginErr) throw loginErr;

      const user = data?.user ?? data?.session?.user;
      if (!user) {
        warning("Login may require email confirmation. Check your inbox.", "Login Notice");
        setLoading(false);
        return;
      }

      await ensureProfileExists({
        id: user.id,
        email: user.email,
        full_name: null,
        role: "faculty",
        department: null,
        reg_number: null,
        dept_year: null,
      });

      success("Login successful!", "Faculty Login");
      navigate("/dashboard");
    } catch (err) {
      console.error("Faculty login error:", err);
      if (err?.message) error(err.message);
      else error("Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI (kept your styles & layout) ----------
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

      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
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
            className="mt-4 px-6 py-2 text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700 hover:opacity-90 shadow-md rounded-xl font-semibold flex items-center gap-2"
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
                  ? "text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700"
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
                  ? "text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700"
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
                    className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
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
                className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg text-white shadow-xl ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600"
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
                    className="w-full pl-12 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
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
                className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg text-white shadow-xl ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600"
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
                  onChange={(e) => setStudentSignup({ ...studentSignup, collegeEmail: e.target.value })}
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
                  onChange={(e) => setStudentSignup({ ...studentSignup, password: e.target.value })}
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
              className={`w-full py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600"
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
                  onChange={(e) => setFacultySignup({ ...facultySignup, department: e.target.value })}
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
                  onChange={(e) => setFacultySignup({ ...facultySignup, collegeEmail: e.target.value })}
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
                  onChange={(e) => setFacultySignup({ ...facultySignup, password: e.target.value })}
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
              className={`w-full py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-700"
              } text-white`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LogSignup;
