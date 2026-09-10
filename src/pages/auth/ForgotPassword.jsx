import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="space-y-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center transition-colors duration-300 dark:border-green-900/50 dark:bg-green-950/30"
          >
            {/* Success Icon */}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.15,
                duration: 0.4,
                type: "spring",
                stiffness: 180,
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl"
              >
                ✓
              </motion.span>
            </motion.div>

            <div>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
                Check Your Email
              </h3>

              <p className="mt-3 text-slate-600 dark:text-slate-300">
                If an account exists for{" "}
                <strong className="text-slate-800 dark:text-white">
                  {email}
                </strong>
                , a password reset link will be sent shortly.
              </p>
            </div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/login"
                className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
              >
                Back to Login
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AuthInput
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <AuthButton>Send Reset Link</AuthButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-center text-slate-600 dark:text-slate-400"
            >
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Login
              </Link>
            </motion.p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

export default ForgotPassword;
