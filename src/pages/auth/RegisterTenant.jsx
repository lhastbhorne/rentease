import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import Divider from "../../components/auth/Divider";
import SocialLogin from "../../components/auth/SocialLogin";

import { registerUser } from "../../firebase/services";

function RegisterTenant() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
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

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agree) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "tenant",
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
      title="Create Tenant Account"
      subtitle="Join RentEase and start finding verified rental properties."
    >
      <motion.form
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* ==========================================
            ERROR
        ========================================== */}

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
              transition={{
                duration: 0.3,
              }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-sm text-red-700 transition-colors duration-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            FULL NAME
        ========================================== */}

        <AnimatedField delay={0.05}>
          <AuthInput
            label="Full Name"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
          />
        </AnimatedField>

        {/* ==========================================
            EMAIL
        ========================================== */}

        <AnimatedField delay={0.1}>
          <AuthInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </AnimatedField>

        {/* ==========================================
            PHONE
        ========================================== */}

        <AnimatedField delay={0.15}>
          <AuthInput
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="+234 801 234 5678"
            value={formData.phone}
            onChange={handleChange}
          />
        </AnimatedField>

        {/* ==========================================
            PASSWORD
        ========================================== */}

        <AnimatedField delay={0.2}>
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Create your password"
            value={formData.password}
            onChange={handleChange}
          />
        </AnimatedField>

        {/* ==========================================
            CONFIRM PASSWORD
        ========================================== */}

        <AnimatedField delay={0.25}>
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </AnimatedField>

        {/* ==========================================
            TERMS
        ========================================== */}

        <motion.label
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="flex items-start gap-3 text-sm text-slate-600 transition-colors duration-300 dark:text-slate-400"
        >
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
          />

          <span>
            I agree to the{" "}
            <Link
              to="/terms"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </motion.label>

        {/* ==========================================
            SUBMIT
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
          }}
          whileHover={{
            y: -2,
          }}
          whileTap={{
            scale: 0.98,
          }}
        >
          <AuthButton>
            {loading ? "Creating Account..." : "Create Account"}
          </AuthButton>
        </motion.div>

        {/* ==========================================
            DIVIDER
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
        >
          <Divider />
        </motion.div>

        {/* ==========================================
            SOCIAL LOGIN
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.45,
          }}
        >
          <SocialLogin />
        </motion.div>

        {/* ==========================================
            LOGIN
        ========================================== */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
          className="text-center text-slate-600 transition-colors duration-300 dark:text-slate-400"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Login
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
}

// ==========================================
// ANIMATED FIELD
// ==========================================

function AnimatedField({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -15,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay,
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export default RegisterTenant;
