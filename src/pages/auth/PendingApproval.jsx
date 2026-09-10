import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaClock,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHeadset,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";
import { logoutUser } from "../../firebase/services";

function PendingApproval() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // DETERMINE ACCOUNT STATUS
  // ==========================================

  const isRejected =
    user?.accountStatus === "rejected" || user?.approvalStatus === "rejected";

  const isApproved =
    user?.accountStatus === "approved" &&
    user?.approvalStatus === "approved" &&
    user?.isActive === true;

  // ==========================================
  // REDIRECT APPROVED USERS
  // ==========================================

  useEffect(() => {
    if (!isApproved) {
      return;
    }

    switch (user?.role) {
      case "landlord":
        navigate("/landlord/dashboard", {
          replace: true,
        });
        break;

      case "agent":
        navigate("/agent/dashboard", {
          replace: true,
        });
        break;

      case "admin":
        navigate("/admin/dashboard", {
          replace: true,
        });
        break;

      default:
        navigate("/", {
          replace: true,
        });
    }
  }, [isApproved, user?.role, navigate]);

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    try {
      await logoutUser();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // ==========================================
  // APPROVED
  // ==========================================

  if (isApproved) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 transition-colors duration-300 dark:bg-slate-950">
      <AnimatePresence mode="wait">
        {isRejected ? (
          <RejectedContent
            key="rejected"
            user={user}
            handleLogout={handleLogout}
          />
        ) : (
          <PendingContent
            key="pending"
            user={user}
            handleLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// REJECTED ACCOUNT
// ==========================================

function RejectedContent({ user, handleLogout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Icon */}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.15,
          duration: 0.4,
          type: "spring",
          stiffness: 180,
        }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
      >
        <FaTimesCircle className="text-4xl" />
      </motion.div>

      {/* Title */}

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 text-2xl font-bold text-slate-800 dark:text-white"
      >
        Account Verification Unsuccessful
      </motion.h1>

      {/* Welcome */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 text-slate-600 dark:text-slate-300"
      >
        Hello{" "}
        <span className="font-semibold text-slate-800 dark:text-white">
          {user?.fullName || user?.displayName || "User"}
        </span>
        .
      </motion.p>

      {/* Description */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-3 leading-7 text-slate-500 dark:text-slate-400"
      >
        Unfortunately, your RentEase account was not approved by the
        administrator.
      </motion.p>

      {/* Rejection Reason */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-left dark:border-red-900/50 dark:bg-red-950/30"
      >
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="mt-1 shrink-0 text-red-600 dark:text-red-400" />

          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">
              Reason for rejection
            </p>

            <p className="mt-2 leading-6 text-red-700 dark:text-red-300">
              {user?.rejectionReason ||
                "The administrator did not approve your account. Please contact RentEase support for more information."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Support */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 rounded-xl bg-slate-50 p-5 text-left transition-colors duration-300 dark:bg-slate-800"
      >
        <div className="flex items-start gap-3">
          <FaHeadset className="mt-1 text-blue-600 dark:text-blue-400" />

          <div>
            <h2 className="font-semibold text-slate-800 dark:text-white">
              Need help?
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              If you believe this decision was made in error or you need to
              submit corrected documents, please contact RentEase support.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Email */}

      {user?.email && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-slate-500 dark:text-slate-400"
        >
          Account email:{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {user.email}
          </span>
        </motion.p>
      )}

      {/* Logout */}

      <motion.button
        type="button"
        onClick={handleLogout}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition-colors duration-300 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <FaSignOutAlt />
        Logout
      </motion.button>
    </motion.div>
  );
}

// ==========================================
// PENDING ACCOUNT
// ==========================================

function PendingContent({ user, handleLogout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Icon */}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.15,
          duration: 0.4,
          type: "spring",
          stiffness: 180,
        }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <FaClock className="text-3xl" />
        </motion.div>
      </motion.div>

      {/* Title */}

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 text-2xl font-bold text-slate-800 dark:text-white"
      >
        Account Pending Approval
      </motion.h1>

      {/* Welcome */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 text-slate-600 dark:text-slate-300"
      >
        Welcome to RentEase,{" "}
        <span className="font-semibold text-slate-800 dark:text-white">
          {user?.fullName || user?.displayName || "User"}
        </span>
        .
      </motion.p>

      {/* Description */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-3 leading-7 text-slate-500 dark:text-slate-400"
      >
        Your account has been successfully created and is currently waiting for
        verification and approval by the RentEase administrator.
      </motion.p>

      {/* Status */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 transition-colors duration-300 dark:border-yellow-900/50 dark:bg-yellow-950/30"
      >
        <div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-400">
          <FaClock />

          <span className="font-semibold">Verification Pending</span>
        </div>

        <p className="mt-2 text-sm leading-6 text-yellow-700 dark:text-yellow-300">
          You will be able to access your dashboard and rental management
          features after your account has been approved.
        </p>
      </motion.div>

      {/* Process */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 rounded-xl bg-slate-50 p-5 text-left transition-colors duration-300 dark:bg-slate-800"
      >
        <h2 className="font-semibold text-slate-800 dark:text-white">
          What happens next?
        </h2>

        <div className="mt-4 space-y-4">
          <Step
            number="1"
            title="Account Created"
            description="Your RentEase account has been created successfully."
            completed
          />

          <Step
            number="2"
            title="Admin Review"
            description="Our administrator will review your account information and verification documents."
            active
          />

          <Step
            number="3"
            title="Account Approval"
            description="Once approved, your dashboard and rental management features will become available."
          />
        </div>
      </motion.div>

      {/* Account Information */}

      {user?.email && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Account email
          </p>

          <p className="mt-1 font-medium text-slate-700 dark:text-slate-200">
            {user.email}
          </p>
        </motion.div>
      )}

      {/* Logout */}

      <motion.button
        type="button"
        onClick={handleLogout}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition-colors duration-300 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <FaSignOutAlt />
        Logout
      </motion.button>
    </motion.div>
  );
}

// ==========================================
// STEP COMPONENT
// ==========================================

function Step({
  number,
  title,
  description,
  completed = false,
  active = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex gap-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.3,
          type: "spring",
        }}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          completed
            ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
            : active
              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400"
              : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        }`}
      >
        {completed ? <FaCheckCircle /> : number}
      </motion.div>

      <div>
        <p className="font-medium text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default PendingApproval;
