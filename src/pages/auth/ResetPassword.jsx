import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

      const result = await resendVerificationEmail();

      if (result.alreadyVerified) {
        setMessage("Your email is already verified.");
        return;
      }

      setMessage(
        "Verification email sent successfully. Please check your inbox and spam folder.",
      );
    } catch (error) {
      console.error("Resend verification error:", error);

      if (error.code === "auth/too-many-requests") {
        setError(
          "Too many verification requests. Please wait a few minutes before trying again.",
        );
      } else if (error.code === "auth/user-token-expired") {
        setError("Your session has expired. Please register or log in again.");
      } else {
        setError(error.message || "Failed to send verification email.");
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

      const verified = await checkEmailVerified();

      if (!verified) {
        setError(
          "Your email is not verified yet. Please click the verification link in your email first.",
        );

        return;
      }

      setMessage("Email verified successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Verification check error:", error);

      setError("Unable to check your verification status.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 transition-colors duration-300 dark:bg-slate-950">
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:bg-slate-900 dark:shadow-slate-950/40"
      >
        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.4,
          }}
        >
          <motion.div
            initial={{
              scale: 0,
              rotate: -15,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              type: "spring",
              stiffness: 180,
            }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl dark:bg-blue-950/50"
          >
            ✉️
          </motion.div>

          <h1 className="text-3xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
            Verify Your Email
          </h1>

          <p className="mt-4 text-slate-500 transition-colors duration-300 dark:text-slate-400">
            We've sent a verification link to your email address.
          </p>

          <p className="mt-2 text-sm text-slate-400 transition-colors duration-300 dark:text-slate-500">
            Check your inbox and spam folder.
          </p>
        </motion.div>

        {/* MESSAGES */}

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key="success"
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
              transition={{
                duration: 0.3,
              }}
              className="mt-5 overflow-hidden"
            >
              <div className="rounded-lg bg-green-100 p-4 text-sm text-green-700 transition-colors duration-300 dark:bg-green-950/40 dark:text-green-400">
                {message}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
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
              transition={{
                duration: 0.3,
              }}
              className="mt-5 overflow-hidden"
            >
              <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700 transition-colors duration-300 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIONS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
            duration: 0.4,
          }}
          className="mt-6 space-y-3"
        >
          {/* CHECK VERIFICATION */}

          <motion.button
            type="button"
            onClick={handleCheckVerification}
            disabled={checking}
            whileHover={!checking ? { y: -2 } : {}}
            whileTap={!checking ? { scale: 0.98 } : {}}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-500"
          >
            {checking ? "Checking..." : "I Have Verified My Email"}
          </motion.button>

          {/* RESEND */}

          <motion.button
            type="button"
            onClick={handleResend}
            disabled={sending}
            whileHover={!sending ? { y: -2 } : {}}
            whileTap={!sending ? { scale: 0.98 } : {}}
            className="w-full rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-colors duration-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/40"
          >
            {sending ? "Sending..." : "Resend Verification Email"}
          </motion.button>
        </motion.div>

        {/* LOGIN */}

        <motion.button
          type="button"
          onClick={() => navigate("/login")}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
          whileHover={{
            x: 2,
          }}
          className="mt-5 text-sm text-slate-500 transition-colors duration-300 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          Back to Login
        </motion.button>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
