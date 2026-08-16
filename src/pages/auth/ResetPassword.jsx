import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log(formData);

    setSuccess(true);
  }

  if (success) {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been changed successfully."
      >
        <div className="space-y-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="text-5xl">✅</div>

          <p className="text-slate-600">
            Your password has been reset successfully. You can now log in with
            your new password.
          </p>

          <Link
            to="/login"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new password for your RentEase account."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <PasswordInput
          label="New Password"
          name="password"
          placeholder="Enter your new password"
          value={formData.password}
          onChange={handleChange}
        />

        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <AuthButton>Reset Password</AuthButton>

        <p className="text-center text-slate-600">
          Remember your password?{" "}
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

export default ResetPassword;
