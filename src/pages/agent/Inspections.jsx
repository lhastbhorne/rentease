import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaExclamationCircle,
  FaEye,
  FaMapMarkerAlt,
  FaPhone,
  FaRedo,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  acceptInspection,
  completeInspection,
  confirmInspectionCompletionByManager,
  getAgentInspections,
  rejectInspection,
  rescheduleInspection,
} from "../../firebase/inspectionService";

// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },

  accepted: {
    label: "Accepted",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },

  payment_pending: {
    label: "Payment Pending",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },

  confirmed: {
    label: "Confirmed",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },

  completion_pending_confirmation: {
    label: "Awaiting Confirmation",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },

  completion_confirmation_expired: {
    label: "Confirmation Expired",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },

  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },

  rescheduled: {
    label: "Rescheduled",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },

  awaiting_tenant_confirmation: {
    label: "Awaiting Tenant",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },

  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },

  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Inspections() {
  const { user } = useAuth();

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");

  const [selectedInspection, setSelectedInspection] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [responseMessage, setResponseMessage] = useState("");

  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    reason: "",
  });

  // ===================================================
  // LOAD AGENT INSPECTIONS
  // ===================================================

  const loadInspections = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAgentInspections(user.uid);

      setInspections(data || []);
    } catch (err) {
      console.error("Error loading agent inspections:", err);
      setError(err?.message || "Failed to load inspection requests.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // ===================================================
  // FILTER
  // ===================================================

  const filteredInspections = useMemo(() => {
    if (activeFilter === "all") {
      return inspections;
    }

    return inspections.filter(
      (inspection) => inspection.status === activeFilter,
    );
  }, [inspections, activeFilter]);

  // ===================================================
  // COUNTS
  // ===================================================

  const counts = useMemo(() => {
    return {
      all: inspections.length,

      pending: inspections.filter((item) => item.status === "pending").length,

      paymentPending: inspections.filter(
        (item) => item.status === "payment_pending",
      ).length,

      confirmed: inspections.filter((item) => item.status === "confirmed")
        .length,

      awaitingConfirmation: inspections.filter(
        (item) =>
          item.status === "completion_pending_confirmation" ||
          item.status === "awaiting_tenant_confirmation",
      ).length,

      completed: inspections.filter((item) => item.status === "completed")
        .length,
    };
  }, [inspections]);

  // ===================================================
  // ACCEPT
  // ===================================================

  const handleAccept = async (inspection) => {
    try {
      setActionLoading(true);
      setError("");

      await acceptInspection(
        inspection.id,
        "Inspection request accepted. Please complete the inspection payment to confirm the appointment.",
        user.uid,
      );

      await loadInspections();
    } catch (err) {
      console.error("Accept inspection error:", err);
      setError(err?.message || "Failed to accept inspection request.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===================================================
  // REJECT
  // ===================================================

  const openRejectModal = (inspection) => {
    setSelectedInspection(inspection);
    setResponseMessage("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedInspection) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await rejectInspection(selectedInspection.id, responseMessage, user.uid);

      setShowRejectModal(false);
      setSelectedInspection(null);
      setResponseMessage("");

      await loadInspections();
    } catch (err) {
      console.error("Reject inspection error:", err);
      setError(err?.message || "Failed to reject inspection request.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===================================================
  // RESCHEDULE
  // ===================================================

  const openRescheduleModal = (inspection) => {
    setSelectedInspection(inspection);

    setRescheduleData({
      date: inspection.proposedDate || inspection.requestedDate || "",
      time: inspection.proposedTime || inspection.requestedTime || "",
      reason: "",
    });

    setShowRescheduleModal(true);
  };

  const handleReschedule = async () => {
    if (!selectedInspection) {
      return;
    }

    if (!rescheduleData.date || !rescheduleData.time) {
      setError("Please select a date and time.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await rescheduleInspection(
        selectedInspection.id,
        rescheduleData.date,
        rescheduleData.time,
        rescheduleData.reason,
        user.uid,
      );

      setShowRescheduleModal(false);
      setSelectedInspection(null);

      setRescheduleData({
        date: "",
        time: "",
        reason: "",
      });

      await loadInspections();
    } catch (err) {
      console.error("Reschedule inspection error:", err);
      setError(err?.message || "Failed to reschedule inspection.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===================================================
  // COMPLETION
  // ===================================================

  const openCompletionModal = (inspection) => {
    setSelectedInspection(inspection);
    setShowCompletionModal(true);
  };

  const handleComplete = async () => {
    if (!selectedInspection) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await completeInspection(selectedInspection.id, user.uid);

      setShowCompletionModal(false);
      setSelectedInspection(null);

      await loadInspections();
    } catch (err) {
      console.error("Complete inspection error:", err);
      setError(err?.message || "Failed to confirm inspection completion.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCompletion = async (inspection) => {
    try {
      setActionLoading(true);
      setError("");

      await confirmInspectionCompletionByManager(inspection.id, user.uid);

      await loadInspections();
    } catch (err) {
      console.error("Confirm inspection completion error:", err);
      setError(err?.message || "Failed to confirm inspection completion.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===================================================
  // DETAILS
  // ===================================================

  const openDetails = (inspection) => {
    setSelectedInspection(inspection);
    setShowDetailsModal(true);
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>

            <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Inspection Requests
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage inspection requests for properties you manage.
                </p>
              </div>

              <button
                onClick={loadInspections}
                disabled={loading || actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <FaRedo />
                Refresh
              </button>
            </div>
          </motion.div>

          {/* ERROR */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            >
              <FaExclamationCircle className="mt-0.5 shrink-0" />

              <span>{error}</span>

              <button
                onClick={() => setError("")}
                className="ml-auto rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
                aria-label="Dismiss error"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}

          {/* STAT CARDS */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              title="Total"
              value={counts.all}
              icon={<FaEye />}
              onClick={() => setActiveFilter("all")}
              active={activeFilter === "all"}
            />

            <StatCard
              title="Pending"
              value={counts.pending}
              icon={<FaClock />}
              onClick={() => setActiveFilter("pending")}
              active={activeFilter === "pending"}
            />

            <StatCard
              title="Payment Pending"
              value={counts.paymentPending}
              icon={<FaClock />}
              onClick={() => setActiveFilter("payment_pending")}
              active={activeFilter === "payment_pending"}
            />

            <StatCard
              title="Confirmed"
              value={counts.confirmed}
              icon={<FaCalendarAlt />}
              onClick={() => setActiveFilter("confirmed")}
              active={activeFilter === "confirmed"}
            />

            <StatCard
              title="Awaiting Confirmation"
              value={counts.awaitingConfirmation}
              icon={<FaClock />}
              onClick={() => setActiveFilter("completion_pending_confirmation")}
              active={activeFilter === "completion_pending_confirmation"}
            />

            <StatCard
              title="Completed"
              value={counts.completed}
              icon={<FaCheck />}
              onClick={() => setActiveFilter("completed")}
              active={activeFilter === "completed"}
            />
          </div>

          {/* FILTERS */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["payment_pending", "Payment Pending"],
              ["confirmed", "Confirmed"],
              ["completion_pending_confirmation", "Awaiting Confirmation"],
              ["completed", "Completed"],
              ["rejected", "Rejected"],
              ["cancelled", "Cancelled"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* LIST */}
          {filteredInspections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                <FaCalendarAlt />
              </div>

              <h2 className="text-lg font-semibold">No inspection requests</h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                There are no inspection requests in this category.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {filteredInspections.map((inspection, index) => (
                <InspectionCard
                  key={inspection.id}
                  inspection={inspection}
                  index={index}
                  actionLoading={actionLoading}
                  onAccept={handleAccept}
                  onReject={openRejectModal}
                  onReschedule={openRescheduleModal}
                  onComplete={openCompletionModal}
                  onConfirmCompletion={handleConfirmCompletion}
                  onDetails={openDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* REJECT MODAL */}
        {showRejectModal && selectedInspection && (
          <Modal
            title="Reject Inspection Request"
            onClose={() => {
              if (!actionLoading) {
                setShowRejectModal(false);
              }
            }}
          >
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to reject the inspection request from{" "}
              <strong>{selectedInspection.tenantName || "the tenant"}</strong>?
            </p>

            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={4}
              placeholder="Optional reason..."
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
            />

            <div className="mt-5 flex justify-end gap-3">
              <ModalButton
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </ModalButton>

              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </Modal>
        )}

        {/* RESCHEDULE MODAL */}
        {showRescheduleModal && selectedInspection && (
          <Modal
            title="Reschedule Inspection"
            onClose={() => {
              if (!actionLoading) {
                setShowRescheduleModal(false);
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  New Date
                </label>

                <input
                  type="date"
                  value={rescheduleData.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setRescheduleData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  New Time
                </label>

                <input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) =>
                    setRescheduleData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Reason</label>

                <textarea
                  rows={3}
                  value={rescheduleData.reason}
                  onChange={(e) =>
                    setRescheduleData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="Why are you proposing a new time?"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <ModalButton
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </ModalButton>

                <button
                  onClick={handleReschedule}
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? "Sending..." : "Propose New Time"}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* COMPLETION MODAL */}
        {showCompletionModal && selectedInspection && (
          <Modal
            title="Confirm Inspection Completion"
            onClose={() => {
              if (!actionLoading) {
                setShowCompletionModal(false);
              }
            }}
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <FaCheck className="mt-1 text-emerald-600 dark:text-emerald-400" />

                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Mark this inspection as completed?
                    </p>

                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                      The tenant will be notified and will have 24 hours to
                      confirm the inspection was completed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-slate-800">
                <p>
                  <strong>Property:</strong>{" "}
                  {selectedInspection.propertyTitle || "Not specified"}
                </p>

                <p className="mt-1">
                  <strong>Tenant:</strong>{" "}
                  {selectedInspection.tenantName || "Not specified"}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <ModalButton
                  onClick={() => setShowCompletionModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </ModalButton>

                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? "Confirming..." : "Mark as Completed"}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* DETAILS MODAL */}
        {showDetailsModal && selectedInspection && (
          <Modal
            title="Inspection Details"
            onClose={() => setShowDetailsModal(false)}
          >
            <InspectionDetails inspection={selectedInspection} />

            <div className="mt-6 flex justify-end">
              <ModalButton onClick={() => setShowDetailsModal(false)}>
                Close
              </ModalButton>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ title, value, icon, onClick, active }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
          : "border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {title}
        </span>

        <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
      </div>

      <p className="text-2xl font-bold">{value}</p>
    </motion.button>
  );
}

// =====================================================
// INSPECTION CARD
// =====================================================

function InspectionCard({
  inspection,
  index,
  actionLoading,
  onAccept,
  onReject,
  onReschedule,
  onComplete,
  onConfirmCompletion,
  onDetails,
}) {
  const status = STATUS_CONFIG[inspection.status] || STATUS_CONFIG.pending;

  const isPending = inspection.status === "pending";

  const isPaymentPending = inspection.status === "payment_pending";

  const isConfirmed = inspection.status === "confirmed";

  const isCompletionPending =
    inspection.status === "completion_pending_confirmation";

  const isLegacyAwaiting = inspection.status === "awaiting_tenant_confirmation";

  const tenantAlreadyConfirmed = inspection.tenantCompletionConfirmed === true;

  const managerAlreadyConfirmed =
    inspection.managerCompletionConfirmed === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col lg:flex-row">
        {/* PROPERTY IMAGE */}
        <div className="h-48 w-full shrink-0 bg-gray-100 dark:bg-slate-800 lg:h-auto lg:w-64">
          {inspection.propertyImage ? (
            <img
              src={inspection.propertyImage}
              alt={inspection.propertyTitle || "Property"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center text-gray-400">
              <FaEye size={28} />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div>
              <h2 className="text-lg font-bold">
                {inspection.propertyTitle || "Property Inspection"}
              </h2>

              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FaMapMarkerAlt />

                <span>
                  {[
                    inspection.propertyAreaName,
                    inspection.propertyCity,
                    inspection.propertyState,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Location not specified"}
                </span>
              </div>
            </div>

            <span
              className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          {/* TENANT */}
          <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-slate-800/60">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Tenant
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-2 text-sm">
                <FaUser className="text-indigo-500" />
                {inspection.tenantName || "Not provided"}
              </div>

              {inspection.tenantEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaEnvelope className="text-indigo-500" />
                  {inspection.tenantEmail}
                </div>
              )}

              {inspection.tenantPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaPhone className="text-indigo-500" />
                  {inspection.tenantPhone}
                </div>
              )}
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoBox
              icon={<FaCalendarAlt />}
              label={
                inspection.proposedDate ? "Proposed Date" : "Requested Date"
              }
              value={inspection.proposedDate || inspection.requestedDate}
            />

            <InfoBox
              icon={<FaClock />}
              label={
                inspection.proposedTime ? "Proposed Time" : "Requested Time"
              }
              value={inspection.proposedTime || inspection.requestedTime}
            />
          </div>

          {/* PAYMENT PENDING */}
          {isPaymentPending && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-300">
              <p className="font-semibold">Waiting for inspection payment</p>

              <p className="mt-1">
                You have accepted this request. The tenant must pay the
                inspection fee before the appointment becomes confirmed.
              </p>
            </div>
          )}

          {/* CONFIRMED */}
          {isConfirmed && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
              <p className="font-semibold">Inspection confirmed</p>

              <p className="mt-1">
                {inspection.confirmedDate ||
                  inspection.proposedDate ||
                  inspection.requestedDate}

                {(inspection.confirmedTime ||
                  inspection.proposedTime ||
                  inspection.requestedTime) &&
                  ` at ${
                    inspection.confirmedTime ||
                    inspection.proposedTime ||
                    inspection.requestedTime
                  }`}
              </p>
            </div>
          )}

          {/* COMPLETION CONFIRMATION */}
          {isCompletionPending && (
            <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300">
              <p className="font-semibold">
                Completion confirmation in progress
              </p>

              {tenantAlreadyConfirmed ? (
                <p className="mt-1">
                  The tenant has confirmed the inspection completion. Confirm it
                  too to finalize the inspection.
                </p>
              ) : managerAlreadyConfirmed ? (
                <p className="mt-1">
                  You have confirmed completion. The inspection is now waiting
                  for the tenant to confirm.
                </p>
              ) : (
                <p className="mt-1">
                  Completion has been submitted and is waiting for the other
                  party's confirmation.
                </p>
              )}
            </div>
          )}

          {/* EXPIRED */}
          {inspection.status === "completion_confirmation_expired" && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <p className="font-semibold">Completion confirmation expired</p>

              <p className="mt-1">
                The 24-hour confirmation window has expired.
              </p>
            </div>
          )}

          {/* MESSAGE */}
          {inspection.message && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tenant Message
              </p>

              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {inspection.message}
              </p>
            </div>
          )}

          {/* RESPONSE */}
          {inspection.responseMessage && (
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
              <strong>Your Response:</strong> {inspection.responseMessage}
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => onDetails(inspection)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <FaEye />
              Details
            </button>

            {isPending && (
              <>
                <button
                  onClick={() => onAccept(inspection)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <FaCheck />
                  Accept
                </button>

                <button
                  onClick={() => onReschedule(inspection)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FaRedo />
                  Reschedule
                </button>

                <button
                  onClick={() => onReject(inspection)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <FaTimes />
                  Reject
                </button>
              </>
            )}

            {isConfirmed && (
              <button
                onClick={() => onComplete(inspection)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <FaCheck />
                Mark Inspection Completed
              </button>
            )}

            {isCompletionPending &&
              tenantAlreadyConfirmed &&
              !managerAlreadyConfirmed && (
                <button
                  onClick={() => onConfirmCompletion(inspection)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <FaCheck />
                  Confirm Completion
                </button>
              )}

            {isCompletionPending &&
              managerAlreadyConfirmed &&
              !tenantAlreadyConfirmed && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                  <FaClock />
                  Waiting for tenant confirmation
                </span>
              )}

            {isLegacyAwaiting && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                <FaClock />
                Waiting for tenant confirmation
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// INFO BOX
// =====================================================

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3 dark:border-slate-800">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-sm font-semibold">{value || "Not specified"}</p>
    </div>
  );
}

// =====================================================
// DETAILS
// =====================================================

function InspectionDetails({ inspection }) {
  const status = STATUS_CONFIG[inspection.status] || STATUS_CONFIG.pending;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Status
        </p>

        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Property
        </p>

        <p className="mt-1 font-semibold">
          {inspection.propertyTitle || "Not specified"}
        </p>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {[
            inspection.propertyAreaName,
            inspection.propertyCity,
            inspection.propertyState,
          ]
            .filter(Boolean)
            .join(", ") || "Location not specified"}
        </p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Tenant
        </p>

        <div className="mt-2 space-y-2 text-sm">
          <p>
            <strong>Name:</strong> {inspection.tenantName || "Not provided"}
          </p>

          <p>
            <strong>Email:</strong> {inspection.tenantEmail || "Not provided"}
          </p>

          <p>
            <strong>Phone:</strong> {inspection.tenantPhone || "Not provided"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Original Request
        </p>

        <div className="mt-2 space-y-2 text-sm">
          <p>
            <strong>Date:</strong> {inspection.requestedDate || "Not provided"}
          </p>

          <p>
            <strong>Time:</strong> {inspection.requestedTime || "Not provided"}
          </p>

          {inspection.message && (
            <p>
              <strong>Message:</strong> {inspection.message}
            </p>
          )}
        </div>
      </div>

      {inspection.proposedDate && (
        <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Proposed Schedule
          </p>

          <p className="mt-2 text-sm">
            {inspection.proposedDate} at{" "}
            {inspection.proposedTime || "Time not specified"}
          </p>

          {inspection.rescheduleReason && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <strong>Reason:</strong> {inspection.rescheduleReason}
            </p>
          )}
        </div>
      )}

      {inspection.confirmedDate && (
        <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
            Confirmed Schedule
          </p>

          <p className="mt-2 text-sm">
            {inspection.confirmedDate} at{" "}
            {inspection.confirmedTime || "Time not specified"}
          </p>
        </div>
      )}

      {inspection.inspectionFee != null && (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Inspection Fee
          </p>

          <p className="mt-1 text-lg font-bold">
            ₦{Number(inspection.inspectionFee || 0).toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Payment status: {inspection.feeStatus || "Not started"}
          </p>
        </div>
      )}

      {inspection.completionConfirmationDeadline && (
        <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            Completion Confirmation
          </p>

          <p className="mt-2 text-sm">
            Confirmation deadline:{" "}
            {formatTimestamp(inspection.completionConfirmationDeadline)}
          </p>

          <div className="mt-3 space-y-1 text-sm">
            <p>
              <strong>Agent confirmed:</strong>{" "}
              {inspection.managerCompletionConfirmed ? "Yes" : "No"}
            </p>

            <p>
              <strong>Tenant confirmed:</strong>{" "}
              {inspection.tenantCompletionConfirmed ? "Yes" : "No"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MODAL
// =====================================================

function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {children}
      </motion.div>
    </div>
  );
}

// =====================================================
// MODAL BUTTON
// =====================================================

function ModalButton({ children, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

// =====================================================
// TIMESTAMP FORMATTER
// =====================================================

function formatTimestamp(value) {
  if (!value) {
    return "Not specified";
  }

  try {
    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleString();
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleString();
  } catch {
    return "Not specified";
  }
}
