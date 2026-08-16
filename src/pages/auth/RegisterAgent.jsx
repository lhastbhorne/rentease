import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import Divider from "../../components/auth/Divider";
import SocialLogin from "../../components/auth/SocialLogin";

import { registerUser } from "../../firebase/services";

function RegisterAgent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    agencyName: "",
    officeAddress: "",
    cacNumber: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    console.log("Agent form submitted");

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agree) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        fullName: formData.fullName,
        agencyName: formData.agencyName,
        officeAddress: formData.officeAddress,
        cacNumber: formData.cacNumber,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: "agent",
      });

      navigate("/verify-email");
    } catch (err) {
      console.error(err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;

        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        default:
          setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Register as an Agent"
      subtitle="Create your professional agent account to manage property listings and clients."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <AuthInput
          label="Full Name"
          name="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
        />

        <AuthInput
          label="Agency / Business Name"
          name="agencyName"
          placeholder="ABC Properties Ltd."
          value={formData.agencyName}
          onChange={handleChange}
        />

        <AuthInput
          label="Office Address"
          name="officeAddress"
          placeholder="Enter your office address"
          value={formData.officeAddress}
          onChange={handleChange}
        />

        <AuthInput
          label="CAC Registration Number (Optional)"
          name="cacNumber"
          placeholder="RC1234567"
          value={formData.cacNumber}
          onChange={handleChange}
        />

        <AuthInput
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="+234 801 234 5678"
          value={formData.phone}
          onChange={handleChange}
        />

        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          placeholder="agent@example.com"
          value={formData.email}
          onChange={handleChange}
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="mt-1"
          />

          <span>
            I agree to the{" "}
            <Link
              to="/terms"
              className="font-semibold text-blue-600 hover:underline"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="font-semibold text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <AuthButton>
          {loading ? "Creating Account..." : "Create Agent Account"}
        </AuthButton>

        <Divider />

        <SocialLogin />

        <p className="text-center text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterAgent;
