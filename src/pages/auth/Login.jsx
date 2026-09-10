import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import Divider from "../../components/auth/Divider";
import SocialLogin from "../../components/auth/SocialLogin";

import { loginUser } from "../../firebase/services";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the page the user originally wanted to visit
  const redirectPath = new URLSearchParams(location.search).get("redirect");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { firebaseUser, profile } = await loginUser(
        formData.email,
        formData.password,
      );

      // =====================================================
      // EMAIL VERIFICATION
      // =====================================================

      if (!firebaseUser.emailVerified) {
        alert("Please verify your email before logging in.");

        navigate("/verify-email");

        return;
      }

      // =====================================================
      // MAKE SURE PROFILE EXISTS
      // =====================================================

      if (!profile) {
        setError(
          "Your account profile could not be found. Please contact support.",
        );

        return;
      }

      // =====================================================
      // ADMIN
      // =====================================================

      if (profile.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      // =====================================================
      // LANDLORD / AGENT APPROVAL CHECK
      // =====================================================

      if (profile.role === "landlord" || profile.role === "agent") {
        // ==========================================
        // REJECTED ACCOUNT
        // ==========================================

        if (
          profile.accountStatus === "rejected" ||
          profile.approvalStatus === "rejected" ||
          profile.verificationStatus === "rejected"
        ) {
          navigate("/pending-approval", {
            replace: true,
          });

          return;
        }

        // ==========================================
        // PENDING ACCOUNT
        // ==========================================

        if (
          profile.accountStatus !== "approved" ||
          profile.approvalStatus !== "approved" ||
          profile.verificationStatus !== "approved"
        ) {
          navigate("/pending-approval", {
            replace: true,
          });

          return;
        }

        // ==========================================
        // APPROVED BUT INACTIVE
        // ==========================================

        if (profile.isActive === false) {
          setError(
            "Your account is currently inactive. Please contact support.",
          );

          return;
        }
      }

      // =====================================================
      // RETURN TO ORIGINAL PROPERTY
      // =====================================================

      if (redirectPath && profile.role === "tenant") {
        navigate(redirectPath);
        return;
      }

      // =====================================================
      // NORMAL ROLE-BASED LOGIN
      // =====================================================

      switch (profile.role) {
        case "tenant":
          navigate("/tenant/dashboard");
          break;

        case "landlord":
          navigate("/landlord/dashboard");
          break;

        case "agent":
          navigate("/agent/dashboard");
          break;

        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      switch (err.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/user-not-found":
          setError("No account found.");
          break;

        case "auth/wrong-password":
          setError("Incorrect password.");
          break;

        case "auth/too-many-requests":
          setError(
            "Too many unsuccessful login attempts. Please try again later.",
          );
          break;

        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to continue to your RentEase account."
    >
      <motion.form
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Error */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-red-200 bg-red-100 p-3 text-red-700 transition-colors duration-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}

        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AuthInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </motion.div>

        {/* Password */}

        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </motion.div>

        {/* Remember / Forgot */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
            />
            Remember Me
          </label>

          <Link
            to="/forgot-password"
            className="text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot Password?
          </Link>
        </motion.div>

        {/* Login Button */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <AuthButton>{loading ? "Logging in..." : "Login"}</AuthButton>
        </motion.div>

        {/* Divider */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Divider />
        </motion.div>

        {/* Social Login */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <SocialLogin />
        </motion.div>

        {/* Sign Up */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-slate-600 dark:text-slate-400"
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign Up
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
}

export default Login;
