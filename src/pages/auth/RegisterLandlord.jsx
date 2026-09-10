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
import { uploadVerificationDocument } from "../../services/cloudinaryService";

function RegisterLandlord() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nin: "",
    identificationType: "",
    identificationDocument: null,
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // ==========================================
  // HANDLE DOCUMENT
  // ==========================================

  function handleDocumentChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Identification document must be a PDF, JPG, JPEG, PNG or WEBP file.",
      );

      e.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Identification document must not be larger than 10MB.");

      e.target.value = "";
      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,
      identificationDocument: file,
    }));
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.nin.trim()) {
      setError("Please enter your NIN.");
      return;
    }

    if (!/^\d{11}$/.test(formData.nin.trim())) {
      setError("NIN must contain exactly 11 digits.");
      return;
    }

    if (!formData.identificationType) {
      setError("Please select your identification type.");
      return;
    }

    if (!formData.identificationDocument) {
      setError("Please upload your identification document.");
      return;
    }

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
      // ==========================================
      // UPLOAD IDENTIFICATION DOCUMENT
      // ==========================================

      setUploading(true);

      const document = await uploadVerificationDocument(
        formData.identificationDocument,
      );

      setUploading(false);

      // ==========================================
      // CREATE LANDLORD ACCOUNT
      // ==========================================

      await registerUser({
        fullName: formData.fullName.trim(),

        email: formData.email.trim().toLowerCase(),

        password: formData.password,

        phone: formData.phone.trim(),

        nin: formData.nin.trim(),

        // Identification information
        identificationType: formData.identificationType,

        identificationDocumentUrl: document.url,

        identificationDocumentPublicId: document.publicId,

        identificationDocumentResourceType: document.resourceType,

        identificationDocumentFormat: document.format,

        identificationDocumentName: document.originalFilename,

        // ==========================================
        // ROLE
        // ==========================================

        role: "landlord",

        // ==========================================
        // ACCOUNT APPROVAL
        // ==========================================

        accountStatus: "pending",

        approvalStatus: "pending",

        verificationStatus: "pending",

        adminApproved: false,

        isActive: false,
      });

      // ==========================================
      // EMAIL VERIFICATION
      // ==========================================

      navigate("/verify-email");
    } catch (err) {
      console.error("Landlord registration error:", err);

      setUploading(false);

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
          setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <AuthLayout
      title="Register as a Landlord"
      subtitle="Create your landlord account to list and manage rental properties."
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
            NIN
        ========================================== */}

        <AnimatedField delay={0.2}>
          <AuthInput
            label="National Identification Number (NIN)"
            name="nin"
            placeholder="Enter your 11-digit NIN"
            value={formData.nin}
            onChange={handleChange}
          />
        </AnimatedField>

        {/* ==========================================
            IDENTIFICATION TYPE
        ========================================== */}

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
          }}
        >
          <label className="mb-2 block text-sm font-medium text-slate-700 transition-colors duration-300 dark:text-slate-200">
            Identification Type
          </label>

          <select
            name="identificationType"
            value={formData.identificationType}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition-all duration-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          >
            <option value="">Select identification type</option>

            <option value="National ID">National ID</option>

            <option value="International Passport">
              International Passport
            </option>

            <option value="Driver's License">Driver's License</option>

            <option value="Voter's Card">Voter's Card</option>
          </select>
        </motion.div>

        {/* ==========================================
            IDENTIFICATION DOCUMENT
        ========================================== */}

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
            delay: 0.3,
          }}
        >
          <label className="mb-2 block text-sm font-medium text-slate-700 transition-colors duration-300 dark:text-slate-200">
            Identification Document
          </label>

          <motion.div
            whileHover={{
              borderColor: "rgb(96 165 250)",
            }}
            className="rounded-xl border-2 border-dashed border-slate-300 p-5 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <input
              type="file"
              name="identificationDocument"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleDocumentChange}
              className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-400 dark:file:bg-blue-950/40 dark:file:text-blue-400 dark:hover:file:bg-blue-950/60"
            />

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Upload a clear copy of your identification document.
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              PDF, JPG, JPEG, PNG or WEBP • Maximum 10MB
            </p>

            <AnimatePresence>
              {formData.identificationDocument && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 transition-colors duration-300 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
                >
                  Selected:{" "}
                  <span className="font-semibold">
                    {formData.identificationDocument.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* ==========================================
            PASSWORD
        ========================================== */}

        <AnimatedField delay={0.35}>
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

        <AnimatedField delay={0.4}>
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
            delay: 0.45,
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
            delay: 0.5,
          }}
          whileHover={{
            y: -2,
          }}
          whileTap={{
            scale: 0.98,
          }}
        >
          <AuthButton>
            {uploading
              ? "Uploading Document..."
              : loading
                ? "Creating Account..."
                : "Create Landlord Account"}
          </AuthButton>
        </motion.div>

        {/* Divider */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.55,
          }}
        >
          <Divider />
        </motion.div>

        {/* Social Login */}

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
            delay: 0.6,
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
            delay: 0.65,
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

export default RegisterLandlord;
