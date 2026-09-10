import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEdit,
  FaClipboardCheck,
  FaBan,
  FaCreditCard,
  FaLock,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getMyInspections,
  acceptRescheduledInspection,
  rejectRescheduledInspection,
  cancelInspection,
  createInspectionPayment,
  markInspectionCompletedByTenant,
  confirmInspectionCompletion,
} from "../../firebase/inspectionService";

import { INSPECTION_FEE } from "../../firebase/rentalConstants";

// =====================================================
// STATUS CONFIG
// =====================================================

function getStatusConfig(status) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        icon: FaHourglassHalf,
        classes:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      };

    case "accepted":
      return {
        label: "Accepted",
        icon: FaCheckCircle,
        classes:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      };

    case "payment_pending":
      return {
        label: "Payment Required",
        icon: FaCreditCard,
        classes:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      };

    case "confirmed":
      return {
        label: "Confirmed",
        icon: FaCheckCircle,
        classes:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      };

    case "awaiting_tenant_confirmation":
      return {
        label: "Action Required",
        icon: FaEdit,
        classes:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };

    case "rescheduled":
      return {
        label: "Rescheduled",
        icon: FaEdit,
        classes:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };

    case "rejected":
      return {
        label: "Rejected",
        icon: FaTimesCircle,
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        icon: FaBan,
        classes:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      };

    case "completed":
      return {
        label: "Completed",
        icon: FaClipboardCheck,
        classes:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      };

    case "completion_pending_confirmation":
      return {
        label: "Awaiting Confirmation",
        icon: FaHourglassHalf,
        classes:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      };

    case "completion_confirmation_expired":
      return {
        label: "Confirmation Expired",
        icon: FaClock,
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };

    default:
      return {
        label: status || "Unknown",
        icon: FaHourglassHalf,
        classes:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      };
  }
}

// =====================================================
// DATE FORMATTER
// =====================================================

function formatInspectionDate(dateString) {
  if (!dateString) {
    return "Not specified";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// =====================================================
// COMPONENT
// =====================================================

function Inspections() {
  const { user } = useAuth();

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  // ===================================================
  // LOAD INSPECTIONS
  // ===================================================

  useEffect(() => {
    async function loadInspections() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyInspections(user.uid);

        setInspections(data || []);
      } catch (err) {
        console.error("Error loading inspections:", err);

        setError(err.message || "Unable to load your inspection requests.");
      } finally {
        setLoading(false);
      }
    }

    loadInspections();
  }, [user?.uid]);

  // ===================================================
  // MARK / CONFIRM INSPECTION COMPLETION
  // ===================================================

  async function handleInspectionCompletion(inspection) {
    if (!user?.uid || !inspection?.id) {
      return;
    }

    try {
      setProcessingId(inspection.id);
      setError("");

      // If the manager has already confirmed, the tenant
      // is completing the second half.
      if (inspection.status === "completion_pending_confirmation") {
        await confirmInspectionCompletion(inspection.id, user.uid);

        setInspections((previous) =>
          previous.map((item) =>
            item.id === inspection.id
              ? {
                  ...item,
                  status: "completed",
                  tenantCompletionConfirmed: true,
                  completedAt: new Date(),
                }
              : item,
          ),
        );

        return;
      }

      // Otherwise the tenant is the first party
      // confirming completion.
      if (inspection.status === "confirmed") {
        await markInspectionCompletedByTenant(inspection.id, user.uid);

        setInspections((previous) =>
          previous.map((item) =>
            item.id === inspection.id
              ? {
                  ...item,
                  status: "completion_pending_confirmation",
                  tenantCompletionConfirmed: true,
                  tenantCompletionConfirmedBy: user.uid,
                  completionConfirmationDeadline: new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                  ),
                }
              : item,
          ),
        );

        return;
      }
    } catch (err) {
      console.error("Inspection completion error:", err);

      setError(err.message || "Unable to confirm inspection completion.");
    } finally {
      setProcessingId(null);
    }
  }

  // ===================================================
  // PAY INSPECTION FEE
  // ===================================================

  async function handlePayInspection(inspection) {
    if (!user?.uid || !inspection?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Pay ₦${(
        inspection.inspectionFee || INSPECTION_FEE
      ).toLocaleString()} inspection fee to confirm this inspection?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(inspection.id);
      setError("");

      // Development payment reference.
      // Real Paystack verification will replace this.
      const paymentReference = `INSPECTION-DEMO-${Date.now()}`;

      await createInspectionPayment(inspection.id, user.uid, paymentReference);

      setInspections((previous) =>
        previous.map((item) =>
          item.id === inspection.id
            ? {
                ...item,
                status: "confirmed",
                feeStatus: "successful",
                paymentReference,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Inspection payment error:", err);

      setError(err.message || "Unable to process inspection payment.");
    } finally {
      setProcessingId(null);
    }
  }

  // ===================================================
  // ACCEPT RESCHEDULE
  // ===================================================

  async function handleAcceptReschedule(inspection) {
    if (!user?.uid || !inspection?.id) {
      return;
    }

    try {
      setProcessingId(inspection.id);
      setError("");

      await acceptRescheduledInspection(inspection.id, user.uid);

      setInspections((previous) =>
        previous.map((item) =>
          item.id === inspection.id
            ? {
                ...item,
                status: "payment_pending",
                confirmedDate: inspection.proposedDate,
                confirmedTime: inspection.proposedTime,
                tenantResponse: "accepted",
                feeStatus: "pending",
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error accepting rescheduled inspection:", err);

      setError(err.message || "Unable to accept the new inspection time.");
    } finally {
      setProcessingId(null);
    }
  }

  // ===================================================
  // REJECT RESCHEDULE
  // ===================================================

  async function handleRejectReschedule(inspection) {
    if (!user?.uid || !inspection?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject the proposed inspection time?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(inspection.id);
      setError("");

      await rejectRescheduledInspection(inspection.id, user.uid);

      setInspections((previous) =>
        previous.map((item) =>
          item.id === inspection.id
            ? {
                ...item,
                status: "cancelled",
                tenantResponse: "rejected",
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error rejecting rescheduled inspection:", err);

      setError(err.message || "Unable to reject the new inspection time.");
    } finally {
      setProcessingId(null);
    }
  }

  // ===================================================
  // CANCEL REQUEST
  // ===================================================

  async function handleCancelInspection(inspection) {
    if (!inspection?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this inspection request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(inspection.id);
      setError("");

      await cancelInspection(
        inspection.id,
        user?.uid || null,
        "tenant",
        "Cancelled by tenant.",
      );

      setInspections((previous) =>
        previous.map((item) =>
          item.id === inspection.id
            ? {
                ...item,
                status: "cancelled",
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error cancelling inspection:", err);

      setError(err.message || "Unable to cancel the inspection.");
    } finally {
      setProcessingId(null);
    }
  }

  
  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

              <p className="mt-4 text-slate-500 dark:text-slate-400">
                Loading your inspections...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Inspections
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Track your property inspection requests and respond to updates.
          </p>
        </motion.div>

        {/* ERROR */}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* EMPTY */}

        {inspections.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <FaCalendarAlt className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              No Inspection Requests
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500 dark:text-slate-400">
              You haven't requested an inspection for any property yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {inspections.map((inspection, index) => {
              const statusConfig = getStatusConfig(inspection.status);

              const StatusIcon = statusConfig.icon;

              const isProcessing = processingId === inspection.id;

              const needsTenantResponse =
                inspection.status === "awaiting_tenant_confirmation";

              const needsPayment = inspection.status === "payment_pending";

              const canCancel =
                inspection.status === "pending" ||
                inspection.status === "accepted" ||
                inspection.status === "payment_pending" ||
                inspection.status === "rescheduled" ||
                needsTenantResponse;

              return (
                <motion.div
                  key={inspection.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* PROPERTY HEADER */}

                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
                    {/* IMAGE */}

                    <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:w-48">
                      {inspection.propertyImage ? (
                        <img
                          src={inspection.propertyImage}
                          alt={inspection.propertyTitle || "Property"}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* PROPERTY INFO */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {inspection.propertyTitle || "Rental Property"}
                          </h2>

                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <FaMapMarkerAlt className="shrink-0 text-blue-600 dark:text-blue-400" />

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

                        {/* STATUS */}

                        <span
                          className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig.classes}`}
                        >
                          <StatusIcon />

                          {statusConfig.label}
                        </span>
                      </div>

                      {/* MANAGER */}

                      <div className="mt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Property Manager
                        </p>

                        <p className="mt-1 font-medium text-slate-700 dark:text-slate-300">
                          {inspection.managerName || "Property Manager"}

                          <span className="ml-2 text-xs capitalize text-slate-400">
                            ({inspection.managerRole || "manager"})
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SCHEDULE */}

                  <div className="border-t border-slate-200 p-5 dark:border-slate-800">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* REQUESTED TIME */}

                      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Your Requested Schedule
                        </p>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />

                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {formatInspectionDate(inspection.requestedDate)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <FaClock className="text-blue-600 dark:text-blue-400" />

                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {inspection.requestedTime || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CONFIRMED / PROPOSED */}

                      {inspection.confirmedDate || inspection.proposedDate ? (
                        <div
                          className={`rounded-xl p-4 ${
                            needsTenantResponse
                              ? "bg-blue-50 dark:bg-blue-950/30"
                              : "bg-green-50 dark:bg-green-950/30"
                          }`}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {needsTenantResponse
                              ? "New Proposed Schedule"
                              : "Confirmed Schedule"}
                          </p>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-3">
                              <FaCalendarAlt
                                className={
                                  needsTenantResponse
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-green-600 dark:text-green-400"
                                }
                              />

                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {formatInspectionDate(
                                  needsTenantResponse
                                    ? inspection.proposedDate
                                    : inspection.confirmedDate,
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <FaClock
                                className={
                                  needsTenantResponse
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-green-600 dark:text-green-400"
                                }
                              />

                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {needsTenantResponse
                                  ? inspection.proposedTime
                                  : inspection.confirmedTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Schedule
                          </p>

                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                            Waiting for the property manager to respond.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RESCHEDULE MESSAGE */}

                    {needsTenantResponse && inspection.rescheduleReason && (
                      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                          Manager's Message
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {inspection.rescheduleReason}
                        </p>
                      </div>
                    )}

                    {/* ORIGINAL MESSAGE */}

                    {inspection.message && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Your Message
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {inspection.message}
                        </p>
                      </div>
                    )}

                    {/* RESPONSE MESSAGE */}

                    {!needsTenantResponse && inspection.responseMessage && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Manager Response
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {inspection.responseMessage}
                        </p>
                      </div>
                    )}

                    {/* =================================
                            PAYMENT REQUIRED
                      ================================= */}

                    {needsPayment && (
                      <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/50 dark:bg-orange-950/20">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <FaCreditCard className="text-orange-600 dark:text-orange-400" />

                              <h3 className="font-bold text-orange-800 dark:text-orange-300">
                                Inspection Accepted
                              </h3>
                            </div>

                            <p className="mt-1 text-sm leading-6 text-orange-700 dark:text-orange-400">
                              The property manager has accepted your inspection
                              request. Pay the inspection fee to confirm your
                              inspection.
                            </p>

                            <p className="mt-2 text-lg font-bold text-orange-800 dark:text-orange-300">
                              ₦
                              {(
                                inspection.inspectionFee || INSPECTION_FEE
                              ).toLocaleString()}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handlePayInspection(inspection)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FaCreditCard />

                            {isProcessing
                              ? "Processing..."
                              : "Pay Inspection Fee"}
                          </button>
                        </div>

                        <div className="mt-4 flex items-start gap-2 border-t border-orange-200 pt-4 text-xs text-orange-700 dark:border-orange-900/50 dark:text-orange-400">
                          <FaLock className="mt-0.5 shrink-0" />

                          <span>
                            The inspection fee is separate from RentEase's 5%
                            rental platform fee.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CONFIRMED PAYMENT */}

                    {inspection.status === "confirmed" &&
                      (inspection.feeStatus === "successful" ||
                        inspection.feeStatus === "paid") && (
                        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">
                          <div className="flex items-start gap-3">
                            <FaCheckCircle className="mt-1 shrink-0 text-green-600 dark:text-green-400" />

                            <div>
                              <h3 className="font-bold text-green-800 dark:text-green-300">
                                Inspection Confirmed
                              </h3>

                              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                                Your inspection fee has been recorded and your
                                inspection is confirmed.
                              </p>

                              {inspection.paymentReference && (
                                <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                                  Payment Reference:{" "}
                                  <span className="font-semibold">
                                    {inspection.paymentReference}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* =================================
      INSPECTION COMPLETION
================================= */}

                    {inspection.status === "confirmed" && (
                      <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">
                        <div className="flex items-start gap-3">
                          <FaClipboardCheck className="mt-1 shrink-0 text-green-600 dark:text-green-400" />

                          <div className="flex-1">
                            <h3 className="font-bold text-green-800 dark:text-green-300">
                              Inspection Ready for Completion
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
                              If you have inspected the property, mark this
                              inspection as completed. The property manager will
                              then be asked to confirm it.
                            </p>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                handleInspectionCompletion(inspection)
                              }
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                              <FaClipboardCheck />

                              {isProcessing
                                ? "Processing..."
                                : "Mark Inspection Completed"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {inspection.status ===
                      "completion_pending_confirmation" && (
                      <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/50 dark:bg-orange-950/20">
                        <div className="flex items-start gap-3">
                          <FaHourglassHalf className="mt-1 shrink-0 text-orange-600 dark:text-orange-400" />

                          <div>
                            <h3 className="font-bold text-orange-800 dark:text-orange-300">
                              Waiting for Property Manager Confirmation
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-orange-700 dark:text-orange-400">
                              You have confirmed that the inspection took place.
                              The property manager must also confirm the
                              inspection before it becomes officially completed.
                            </p>

                            <div className="mt-4 rounded-xl bg-white/70 p-4 dark:bg-slate-900/60">
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <FaCheckCircle className="text-green-600 dark:text-green-400" />
                                You confirmed the inspection
                              </div>

                              <div className="mt-2 flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                                <FaHourglassHalf />
                                Waiting for{" "}
                                {inspection.managerRole === "agent"
                                  ? "agent"
                                  : "landlord"}{" "}
                                confirmation
                              </div>
                            </div>

                            {inspection.completionConfirmationDeadline && (
                              <p className="mt-3 text-xs text-orange-700 dark:text-orange-400">
                                Confirmation window: 24 hours from the first
                                confirmation.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TENANT ACTION REQUIRED */}

                    {needsTenantResponse && (
                      <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
                        <div>
                          <h3 className="font-bold text-blue-800 dark:text-blue-300">
                            The manager proposed a new inspection time
                          </h3>

                          <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                            Review the new schedule above and choose whether you
                            want to accept it.
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleAcceptReschedule(inspection)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FaCheckCircle />

                            {isProcessing ? "Processing..." : "Accept New Time"}
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleRejectReschedule(inspection)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            <FaTimesCircle />
                            Reject New Time
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CANCEL */}

                    {canCancel && (
                      <div className="mt-5 flex justify-end">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleCancelInspection(inspection)}
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <FaBan />
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Inspections;
