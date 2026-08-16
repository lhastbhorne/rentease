import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  resendVerificationEmail,
  checkEmailVerified,
} from "../../firebase/services";

function VerifyEmail() {
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // RESEND VERIFICATION
  // ==========================================

  async function handleResend() {
    try {
      setSending(true);

      setMessage("");
      setError("");

      const result =
        await resendVerificationEmail();

      if (result.alreadyVerified) {
        setMessage(
          "Your email is already verified."
        );

        return;
      }

      setMessage(
        "Verification email sent successfully. Please check your inbox and spam folder."
      );
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      if (
        error.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many verification requests. Please wait a few minutes before trying again."
        );
      } else if (
        error.code ===
        "auth/user-token-expired"
      ) {
        setError(
          "Your session has expired. Please register or log in again."
        );
      } else {
        setError(
          error.message ||
            "Failed to send verification email."
        );
      }
    } finally {
      setSending(false);
    }
  }

  // ==========================================
  // CHECK VERIFICATION
  // ==========================================

  async function handleCheckVerification() {
    try {
      setChecking(true);

      setMessage("");
      setError("");

      const verified =
        await checkEmailVerified();

      if (!verified) {
        setError(
          "Your email is not verified yet. Please click the verification link in your email first."
        );

        return;
      }

      setMessage(
        "Email verified successfully!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(
        "Verification check error:",
        error
      );

      setError(
        "Unable to check your verification status."
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">

        <h1 className="text-3xl font-bold text-slate-900">
          Verify Your Email
        </h1>

        <p className="mt-4 text-slate-500">
          We've sent a verification link to your
          email address.
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Check your inbox and spam folder.
        </p>

        {/* SUCCESS */}

        {message && (
          <div className="mt-5 rounded-lg bg-green-100 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CHECK VERIFICATION */}

        <button
          type="button"
          onClick={handleCheckVerification}
          disabled={checking}
          className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking
            ? "Checking..."
            : "I Have Verified My Email"}
        </button>

        {/* RESEND */}

        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="mt-3 w-full rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending
            ? "Sending..."
            : "Resend Verification Email"}
        </button>

        {/* LOGIN */}

        <button
          type="button"
          onClick={() =>
            navigate("/login")
          }
          className="mt-5 text-sm text-slate-500 hover:text-blue-600"
        >
          Back to Login
        </button>

      </div>

    </div>
  );
}

export default VerifyEmail;