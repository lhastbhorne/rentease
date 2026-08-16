import { useState } from "react";
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

      // Email verification
      if (!firebaseUser.emailVerified) {
        alert("Please verify your email before logging in.");

        navigate("/verify-email");

        return;
      }

      // ==========================================
      // RETURN TO ORIGINAL PROPERTY
      // ==========================================
      if (redirectPath && profile.role === "tenant") {
        navigate(redirectPath);

        return;
      }

      // ==========================================
      // NORMAL ROLE-BASED LOGIN
      // ==========================================
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

        case "admin":
          navigate("/admin/dashboard");
          break;

        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);

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
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />

            Remember Me
          </label>

          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton>
          {loading ? "Logging in..." : "Login"}
        </AuthButton>

        <Divider />

        <SocialLogin />

        <p className="text-center text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;