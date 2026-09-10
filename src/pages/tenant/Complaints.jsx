import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaBell,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaHome,
  FaPaperPlane,
  FaReply,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import { getTenantProperties } from "../../firebase/propertyService";

import {
  createPropertyComplaint,
  getMyComplaints,
} from "../../firebase/complaintService";

function Complaints() {
  const { user } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [properties, setProperties] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState({
    propertyId: "",
    subject: "",
    category: "",
    details: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    loadData();
  }, [user?.uid]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [tenantProperties, tenantComplaints] = await Promise.all([
        getTenantProperties(user.uid),
        getMyComplaints(user.uid),
      ]);

      setProperties(tenantProperties);
      setComplaints(tenantComplaints);
    } catch (err) {
      console.error("Error loading complaints:", err);

      setError("Unable to load your complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // HANDLE INPUT
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
  // SUBMIT COMPLAINT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (!user?.uid) {
      setError("You must be logged in to submit a complaint.");

      return;
    }

    if (!formData.propertyId) {
      setError("Please select the property this complaint is about.");

      return;
    }

    if (!formData.subject.trim()) {
      setError("Please enter a complaint subject.");

      return;
    }

    if (!formData.category) {
      setError("Please select a complaint category.");

      return;
    }

    if (!formData.details.trim()) {
      setError("Please describe the problem.");

      return;
    }

    // -----------------------------------------------
    // Find selected property
    // -----------------------------------------------

    const selectedProperty = properties.find(
      (property) => property.id === formData.propertyId,
    );

    if (!selectedProperty) {
      setError("The selected property could not be found.");

      return;
    }

    try {
      setSubmitting(true);

      // =================================================
      // DETERMINE WHO MANAGES THE PROPERTY
      // =================================================

      let landlordId = null;
      let agentId = null;
      let recipientRole = "";

      if (selectedProperty.managementType === "agent") {
        agentId = selectedProperty.agentId || null;

        recipientRole = "agent";
      } else {
        landlordId = selectedProperty.ownerId || null;

        recipientRole = "landlord";
      }

      // -----------------------------------------------
      // Safety check
      // -----------------------------------------------

      if (!landlordId && !agentId) {
        throw new Error(
          "This property does not have a landlord or managing agent assigned.",
        );
      }

      // =================================================
      // CREATE COMPLAINT
      // =================================================

      const complaintId = await createPropertyComplaint({
        tenantId: user.uid,

        tenantName: user.displayName || user.name || "",

        tenantEmail: user.email || "",

        propertyId: selectedProperty.id,

        propertyTitle: selectedProperty.title || "Property",

        propertyAddress: selectedProperty.address || "",

        propertyCity: selectedProperty.city || "",

        propertyState: selectedProperty.state || "",

        landlordId,

        agentId,

        recipientRole,

        subject: formData.subject.trim(),

        category: formData.category,

        details: formData.details.trim(),
      });

      console.log("Property complaint created:", complaintId);

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        `Your complaint has been sent to the ${recipientRole} managing this property.`,
      );

      // Reset form

      setFormData({
        propertyId: "",
        subject: "",
        category: "",
        details: "",
      });

      // Refresh complaints

      const updatedComplaints = await getMyComplaints(user.uid);

      setComplaints(updatedComplaints);
    } catch (err) {
      console.error("Error submitting complaint:", err);

      setError(err.message || "Failed to submit complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(timestamp) {
    if (!timestamp) {
      return "Just now";
    }

    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    }

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }

    return "";
  }

  // =====================================================
  // STATUS
  // =====================================================

  function getStatusStyle(status) {
    switch (status) {
      case "resolved":
        return {
          className:
            "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
          icon: <FaCheckCircle />,
          label: "Resolved",
        };

      case "in-progress":
        return {
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
          icon: <FaClock />,
          label: "In Progress",
        };

      case "rejected":
        return {
          className:
            "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
          icon: <FaExclamationCircle />,
          label: "Rejected",
        };

      default:
        return {
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
          icon: <FaClock />,
          label: "Pending",
        };
    }
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
            PAGE HEADER
        ================================================= */}

        <div>
          <motion.h1
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl"
          >
            Complaints
          </motion.h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Report an issue with one of your rented properties.
          </p>
        </div>

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
            LODGE PROPERTY COMPLAINT
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          {/* Header */}

          <div className="mb-7">
            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotate: 2,
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:h-12 sm:w-12"
              >
                <FaHome />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  Lodge a Property Complaint
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Report an issue to the landlord or agent managing your
                  property.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              LOADING PROPERTIES
          ================================================= */}

          {loading && (
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Loading your properties...
                </span>
              </div>
            </div>
          )}

          {/* =================================================
              NO PROPERTIES
          ================================================= */}

          {!loading && properties.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-500/20 dark:bg-yellow-500/10 sm:p-6"
            >
              <div className="flex items-start gap-3 text-yellow-700 dark:text-yellow-400">
                <FaExclamationCircle className="mt-1 shrink-0" />

                <div>
                  <h3 className="font-semibold">No rented properties found</h3>

                  <p className="mt-1 text-sm leading-6 text-yellow-600 dark:text-yellow-400/80">
                    You need to have a rented property before you can lodge a
                    property complaint.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          {!loading && properties.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PROPERTY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Property
                </label>

                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                >
                  <option value="">Select the property</option>

                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title || "Untitled Property"}
                      {property.city ? ` — ${property.city}` : ""}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                  Select the property where you are experiencing the problem.
                </p>
              </div>

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
                  placeholder="e.g. Water supply problem"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Complaint Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                >
                  <option value="">Select category</option>

                  <option value="Maintenance">Maintenance</option>

                  <option value="Water Supply">Water Supply</option>

                  <option value="Electricity">Electricity</option>

                  <option value="Security">Security</option>

                  <option value="Plumbing">Plumbing</option>

                  <option value="Power">Power</option>

                  <option value="Rent">Rent / Payment</option>

                  <option value="Neighbour">Neighbour / Community</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              {/* DETAILS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Complaint Details
                </label>

                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="7"
                  placeholder="Describe the problem in detail..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* RECIPIENT INFORMATION */}

              <AnimatePresence>
                {formData.propertyId && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
                      <div className="flex items-start gap-3">
                        <FaBell className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />

                        <div>
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                            Complaint recipient
                          </p>

                          <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400 sm:text-sm">
                            Your complaint will be automatically sent to the
                            landlord or managing agent responsible for the
                            selected property.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SUBMIT */}

              <div className="flex justify-end pt-1">
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Submit Complaint
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>

        {/* =================================================
            MY COMPLAINTS
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Section Header */}

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <FaBell />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                My Property Complaints
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track complaints you have sent to your landlord or agent.
              </p>
            </div>
          </div>

          {/* Loading */}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Loading complaints...
              </p>
            </div>
          )}

          {/* Empty */}

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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <FaBell className="text-2xl text-slate-400 dark:text-slate-500" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                No Property Complaints
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You haven't submitted any property complaints yet.
              </p>
            </motion.div>
          )}

          {/* Complaints */}

          {!loading && complaints.length > 0 && (
            <div className="space-y-5">
              <AnimatePresence>
                {complaints.map((complaint) => {
                  const status = getStatusStyle(complaint.status);

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
                      transition={{
                        duration: 0.3,
                      }}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                    >
                      {/* Header */}

                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                            {complaint.subject}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Property:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {complaint.propertyTitle}
                            </span>
                          </p>

                          {complaint.category && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              Category:{" "}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {complaint.category}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* STATUS */}

                        <div
                          className={`flex w-fit shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${status.className}`}
                        >
                          {status.icon}

                          {status.label}
                        </div>
                      </div>

                      {/* Date */}

                      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                        Submitted {formatDate(complaint.createdAt)}
                      </p>

                      {/* Details */}

                      <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-950 sm:p-5">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Your complaint
                        </p>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {complaint.details}
                        </p>
                      </div>

                      {/* REPLY */}

                      {complaint.managerReply && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10 sm:p-5"
                        >
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <FaReply />

                            <p className="text-sm font-semibold sm:text-base">
                              Reply from your{" "}
                              {complaint.recipientRole === "agent"
                                ? "agent"
                                : "landlord"}
                            </p>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-green-800 dark:text-green-300">
                            {complaint.managerReply}
                          </p>

                          {complaint.repliedAt && (
                            <p className="mt-3 text-xs text-green-600 dark:text-green-500">
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

export default Complaints;
