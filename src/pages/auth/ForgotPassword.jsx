import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    console.log(email);

    // Later this will call Firebase
    setSubmitted(true);
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email address and we'll send you a password reset link."
    >
      {submitted ? (
        <div className="space-y-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <h3 className="text-xl font-bold text-green-700">Check Your Email</h3>

          <p className="text-slate-600">
            If an account exists for <strong>{email}</strong>, a password reset
            link will be sent shortly.
          </p>

          <Link
            to="/login"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthButton>Send Reset Link</AuthButton>

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
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
