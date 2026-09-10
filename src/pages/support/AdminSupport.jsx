import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaHeadset,
  FaPaperPlane,
  FaCheckCircle,
  FaClock,
  FaReply,
  FaExclamationCircle,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  createAdminComplaint,
  getMyAdminComplaints,
} from "../../firebase/complaintService";

function AdminSupport() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    details: "",
  });

  // =====================================================
  // LOAD SUPPORT REQUESTS
  // =====================================================

  useEffect(() => {
    if (user?.uid) {
      loadComplaints();
    }
  }, [user?.uid]);

  async function loadComplaints() {
    try {
      setLoading(true);

      const data = await getMyAdminComplaints(user.uid);

      setComplaints(data);
    } catch (err) {
      console.error("Error loading admin support:", err);

      setError("Unable to load your support requests.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INPUT
  // =====================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!user?.uid) {
      setError("You must be logged in.");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.details.trim()) {
      setError("Please describe your problem.");
      return;
    }

    try {
      setSubmitting(true);

      await createAdminComplaint({
        userId: user.uid,

        userName: user.fullName || user.displayName || user.name || "",

        userEmail: user.email || "",

        userRole: user.role || "",

        subject: formData.subject.trim(),

        category: formData.category,

        details: formData.details.trim(),
      });

      setFormData({
        subject: "",
        category: "",
        details: "",
      });

      setSuccess("Your support request has been sent to RentEase Admin.");

      await loadComplaints();
    } catch (err) {
      console.error("Admin support error:", err);

      setError(err.message || "Failed to send support request.");
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // DATE
  // =====================================================

  function formatDate(timestamp) {
    if (!timestamp) {
      return "Just now";
    }

    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    }

    return "";
  }

  // =====================================================
  // STATUS
  // =====================================================

  function getStatus(status) {
    if (status === "resolved") {
      return {
        label: "Resolved",
        className:
          "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        icon: <FaCheckCircle />,
      };
    }

    if (status === "in-progress") {
      return {
        label: "In Progress",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
        icon: <FaClock />,
      };
    }

    return {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
      icon: <FaClock />,
    };
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl space-y-6 sm:space-y-8"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: 2,
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:h-12 sm:w-12"
            >
              <FaHeadset className="text-lg sm:text-xl" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Admin Support
              </h1>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                Contact RentEase support for website or account-related
                problems.
              </p>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <FaExclamationCircle className="mt-0.5 shrink-0" />

              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            SUCCESS
        ================================================= */}

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400"
            >
              <FaCheckCircle className="mt-0.5 shrink-0" />

              <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            CONTACT ADMIN
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Contact RentEase Admin
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              This support form is only for problems concerning the RentEase
              website, your account, payments on the platform, or other platform
              services.
            </p>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-7 space-y-6 sm:mt-8">
            {/* SUBJECT */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. I cannot access my account"
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                required
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                required
              >
                <option value="">Select category</option>

                <option value="Account">Account</option>

                <option value="Login">Login / Authentication</option>

                <option value="Technical">Technical Problem</option>

                <option value="Payment">Platform Payment</option>

                <option value="Verification">Account Verification</option>

                <option value="Property Listing">Property Listing</option>

                <option value="Application">Rental Application</option>

                <option value="Other">Other</option>
              </select>
            </div>

            {/* DETAILS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Description
              </label>

              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows="7"
                placeholder="Describe the problem you are experiencing..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                required
              />
            </div>

            {/* SUBMIT */}

            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={!submitting ? { y: -2 } : {}}
                whileTap={!submitting ? { scale: 0.97 } : {}}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send to Admin
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* =================================================
            PREVIOUS REQUESTS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <FaHeadset />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                My Support Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track your conversations with RentEase Admin.
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Loading support requests...
              </p>
            </motion.div>
          )}

          {/* EMPTY */}

          {!loading && complaints.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <FaHeadset className="text-xl text-slate-400 dark:text-slate-500" />
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                No Support Requests
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your conversations with RentEase Admin will appear here.
              </p>
            </motion.div>
          )}

          {/* REQUESTS */}

          {!loading && complaints.length > 0 && (
            <div className="space-y-5">
              <AnimatePresence>
                {complaints.map((complaint) => {
                  const status = getStatus(complaint.status);

                  return (
                    <motion.div
                      key={complaint.id}
                      layout
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                    >
                      {/* HEADER */}

                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                            {complaint.subject}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {complaint.category}
                          </p>
                        </div>

                        {/* STATUS */}

                        <motion.div
                          whileHover={{
                            scale: 1.02,
                          }}
                          className={`flex w-fit shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${status.className}`}
                        >
                          {status.icon}

                          {status.label}
                        </motion.div>
                      </div>

                      {/* DATE */}

                      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                        Submitted {formatDate(complaint.createdAt)}
                      </p>

                      {/* USER MESSAGE */}

                      <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-950 sm:p-5">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Your message
                        </p>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {complaint.details}
                        </p>
                      </div>

                      {/* ADMIN REPLY */}

                      {complaint.adminReply && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:p-5"
                        >
                          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <FaReply />

                            <p className="text-sm font-semibold sm:text-base">
                              RentEase Admin
                            </p>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-blue-900 dark:text-blue-300">
                            {complaint.adminReply}
                          </p>

                          {complaint.repliedAt && (
                            <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                              Replied {formatDate(complaint.repliedAt)}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

export default AdminSupport;
