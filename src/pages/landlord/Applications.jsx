import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getLandlordApplications,
  approveApplication,
  rejectApplication,
} from "../../firebase/applicationService";

function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // ==========================================
  // LOAD APPLICATIONS
  // ==========================================

  async function loadApplications() {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getLandlordApplications(user.uid);

      setApplications(data);
    } catch (error) {
      console.error("Error loading landlord applications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [user?.uid]);

  // ==========================================
  // APPROVE APPLICATION
  // ==========================================

  async function handleApprove(application) {
    try {
      setProcessingId(application.id);

      /*
       * IMPORTANT:
       *
       * approveApplication() now handles:
       *
       * 1. Application → approved
       * 2. Payment → pending
       * 3. Payment deadline → 7 days
       * 4. Property → reserved
       * 5. Tenancy → awaiting_payment
       *
       * It does NOT:
       *
       * - create an active tenancy
       * - assign the property to the tenant
       *
       * The tenant only becomes an active tenant
       * after verified payment.
       */

      const updatedApplication = await approveApplication(application.id, user);

      // Update the page immediately
      setApplications((prev) =>
        prev.map((item) =>
          item.id === application.id
            ? {
                ...item,
                ...updatedApplication,
                status: "approved",
                paymentStatus: updatedApplication?.paymentStatus || "pending",
                tenancyStatus:
                  updatedApplication?.tenancyStatus || "awaiting_payment",
                reservationStatus:
                  updatedApplication?.reservationStatus || "reserved",
              }
            : item,
        ),
      );

      alert(
        "Application approved. The property has been reserved for the tenant for 7 days while they complete payment.",
      );
    } catch (error) {
      console.error("Approval error:", error);

      alert(error.message || "Failed to approve application.");
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // REJECT APPLICATION
  // ==========================================

  async function handleReject(application) {
    try {
      setProcessingId(application.id);

      await rejectApplication(application.id);

      setApplications((prev) =>
        prev.map((item) =>
          item.id === application.id
            ? {
                ...item,
                status: "rejected",
              }
            : item,
        ),
      );

      alert("Application rejected successfully.");
    } catch (error) {
      console.error("Rejection error:", error);

      alert(error.message || "Failed to reject application.");
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // APPLICATION STATUS
  // ==========================================

  function getStatusClasses(status) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

      case "expired":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";
    }
  }

  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  function getPaymentStatusClasses(status) {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

      case "pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400";

      case "expired":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  }

  // ==========================================
  // FORMAT DEADLINE
  // ==========================================

  function formatDeadline(deadline) {
    if (!deadline) {
      return "Not specified";
    }

    try {
      const date =
        typeof deadline?.toDate === "function"
          ? deadline.toDate()
          : deadline instanceof Date
            ? deadline
            : new Date(deadline);

      if (Number.isNaN(date.getTime())) {
        return "Not specified";
      }

      return date.toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (error) {
      return "Not specified";
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">
            Loading applications...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* ======================================
            HEADER
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Applications
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Review and manage applications submitted for your properties.
          </p>
        </motion.div>

        {/* ======================================
            EMPTY STATE
        ====================================== */}

        {applications.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FaClipboardList className="text-2xl" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-800 dark:text-white">
              No Applications Yet
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              You don't have any tenant applications for your properties yet.
            </p>
          </motion.div>
        ) : (
          /* ======================================
             APPLICATIONS
          ====================================== */

          <div className="space-y-6">
            {applications.map((application, index) => (
              <motion.div
                key={application.id}
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
                className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900"
              >
                {/* =================================
                      APPLICATION HEADER
                  ================================= */}

                <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {application.propertyTitle || "Property"}
                      </h2>

                      <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Applicant:{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {application.tenantName || "Unknown Tenant"}
                        </span>
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {application.tenantEmail || ""}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusClasses(
                        application.status,
                      )}`}
                    >
                      {application.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* =================================
                      APPLICATION INFORMATION
                  ================================= */}

                <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Applicant */}

                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">
                      Applicant Information
                    </h3>

                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Name:
                        </span>{" "}
                        {application.tenantName || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Email:
                        </span>{" "}
                        {application.tenantEmail || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Phone:
                        </span>{" "}
                        {application.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Employment */}

                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">
                      Employment Information
                    </h3>

                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Status:
                        </span>{" "}
                        {application.employmentStatus || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Occupation:
                        </span>{" "}
                        {application.occupation || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Monthly Income:
                        </span>{" "}
                        ₦
                        {Number(
                          application.monthlyIncome || 0,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Property */}

                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">
                      Property Information
                    </h3>

                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Location:
                        </span>{" "}
                        {application.propertyAreaName
                          ? `${application.propertyAreaName}, `
                          : ""}
                        {application.propertyCity || "N/A"}
                        {application.propertyState
                          ? `, ${application.propertyState}`
                          : ""}
                      </p>

                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Rent:
                        </span>{" "}
                        ₦
                        {Number(
                          application.propertyPrice || 0,
                        ).toLocaleString()}
                      </p>

                      <p>
                        <span className="text-slate-500 dark:text-slate-400">
                          Move-in:
                        </span>{" "}
                        {application.moveInDate || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================
                      PAYMENT / RESERVATION
                  ================================= */}

                {application.status === "approved" && (
                  <div className="mx-6 mb-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">
                    <div className="flex flex-col gap-5">
                      {/* Heading */}

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                          <FaCheck />
                        </div>

                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-300">
                            Application Approved
                          </h3>

                          <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                            The property is reserved for this tenant while they
                            complete payment.
                          </p>
                        </div>
                      </div>

                      {/* Payment / Reservation Grid */}

                      <div className="grid gap-4 border-t border-green-200 pt-4 dark:border-green-900/50 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Payment */}

                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Payment Status
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentStatusClasses(
                              application.paymentStatus,
                            )}`}
                          >
                            {(application.paymentStatus || "pending").replace(
                              "_",
                              " ",
                            )}
                          </span>
                        </div>

                        {/* Amount */}

                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Rent Amount
                          </p>

                          <p className="mt-1 flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
                            <FaMoneyBillWave />₦
                            {Number(
                              application.paymentAmount ||
                                application.propertyPrice ||
                                0,
                            ).toLocaleString()}
                          </p>
                        </div>

                        {/* Deadline */}

                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Payment Deadline
                          </p>

                          <p className="mt-1 flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
                            <FaClock />

                            {formatDeadline(application.paymentDeadline)}
                          </p>
                        </div>

                        {/* Tenancy */}

                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Tenancy Status
                          </p>

                          <p className="mt-1 font-semibold capitalize text-green-900 dark:text-green-200">
                            {(
                              application.tenancyStatus || "awaiting_payment"
                            ).replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      {/* Important notice */}

                      <div className="rounded-lg bg-white p-4 dark:bg-slate-900">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-white">
                            Important:
                          </span>{" "}
                          The property has been temporarily reserved. The tenant
                          has 7 days to complete payment. The property will only
                          become occupied and the tenancy active after payment
                          has been successfully verified.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================
                      APPLICANT MESSAGE
                  ================================= */}

                {application.message && (
                  <div className="mx-6 mb-6 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60">
                    <h3 className="mb-2 font-semibold text-slate-800 dark:text-white">
                      Message from Applicant
                    </h3>

                    <p className="leading-7 text-slate-600 dark:text-slate-300">
                      {application.message}
                    </p>
                  </div>
                )}

                {/* =================================
                      ACTION BUTTONS
                  ================================= */}

                {application.status === "pending" && (
                  <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950/50">
                    {/* Reject */}

                    <button
                      type="button"
                      disabled={processingId === application.id}
                      onClick={() => handleReject(application)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <FaTimes />

                      {processingId === application.id
                        ? "Processing..."
                        : "Reject"}
                    </button>

                    {/* Approve */}

                    <button
                      type="button"
                      disabled={processingId === application.id}
                      onClick={() => handleApprove(application)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaCheck />

                      {processingId === application.id
                        ? "Processing..."
                        : "Approve Application"}
                    </button>
                  </div>
                )}

                {/* =================================
                      APPROVED FOOTER
                  ================================= */}

                {application.status === "approved" && (
                  <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      The property is currently{" "}
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        reserved
                      </span>{" "}
                      and is awaiting payment. It will become occupied only
                      after the tenant's payment is verified.
                    </p>
                  </div>
                )}

                {/* =================================
                      EXPIRED FOOTER
                  ================================= */}

                {application.status === "expired" && (
                  <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      The tenant did not complete payment within the 7-day
                      deadline. The property's reservation has been released.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Applications;
