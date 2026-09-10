import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFlag,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaUser,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAllReports,
  markReportUnderReview,
  dismissReport,
  suspendReportedUser,
} from "../../firebase/reportService";

function Reports() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedReport, setSelectedReport] = useState(null);

  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showDismissModal, setShowDismissModal] = useState(false);

  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const [adminNotes, setAdminNotes] = useState("");

  const [suspensionReason, setSuspensionReason] = useState("");

  const [appealDays, setAppealDays] = useState(7);

  // ==========================================
  // LOAD REPORTS
  // ==========================================

  async function handleDismissReport() {
    try {
      setActionLoading(true);
      setError("");

      if (!selectedReport?.id) {
        throw new Error("Report ID is missing.");
      }

      if (!user?.uid) {
        throw new Error("Admin authentication could not be verified.");
      }

      await dismissReport(selectedReport.id, user.uid, adminNotes);

      setShowDismissModal(false);
      setSelectedReport(null);
      setAdminNotes("");

      await loadReports();
    } catch (error) {
      console.error("Error dismissing report:", error);

      setError(error.message || "Unable to dismiss this report.");
    } finally {
      setActionLoading(false);
    }
  }

async function handleSuspendUser() {
  try {
    setActionLoading(true);
    setError("");

    if (!selectedReport?.id) {
      throw new Error("Report ID is missing.");
    }

    if (!selectedReport?.reportedUserId) {
      throw new Error("Reported user ID is missing.");
    }

    if (!user?.uid) {
      throw new Error("Admin authentication could not be verified.");
    }

    if (!suspensionReason.trim()) {
      throw new Error("Please provide a suspension reason.");
    }

    const days = Number(appealDays);

    if (!days || days < 1) {
      throw new Error("Appeal period must be at least 1 day.");
    }

    const appealDeadline = new Date();

    appealDeadline.setDate(appealDeadline.getDate() + days);

    await suspendReportedUser({
      reportId: selectedReport.id,

      userId: selectedReport.reportedUserId,

      adminId: user.uid,

      reason: suspensionReason,

      appealDeadline,
    });

    setShowSuspendModal(false);
    setSelectedReport(null);

    setSuspensionReason("");
    setAppealDays(7);

    await loadReports();
  } catch (error) {
    console.error("Error suspending account:", error);

    setError(error.message || "Unable to suspend this account.");
  } finally {
    setActionLoading(false);
  }
}

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const reportData = await getAllReports();

      setReports(reportData);
    } catch (error) {
      console.error("Error loading reports:", error);

      setError(error.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  // ==========================================
  // FILTER REPORTS
  // ==========================================

  const filteredReports = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !searchValue ||
        report.reporterName?.toLowerCase().includes(searchValue) ||
        report.reportedUserName?.toLowerCase().includes(searchValue) ||
        report.reporterEmail?.toLowerCase().includes(searchValue) ||
        report.reportedUserEmail?.toLowerCase().includes(searchValue) ||
        report.reason?.toLowerCase().includes(searchValue) ||
        report.description?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  // ==========================================
  // REPORT COUNTS
  // ==========================================

  const pendingCount = reports.filter(
    (report) => report.status === "pending",
  ).length;

  const underReviewCount = reports.filter(
    (report) => report.status === "under_review",
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "resolved" || report.status === "dismissed",
  ).length;

  // ==========================================
  // HELPERS
  // ==========================================

  function formatDate(timestamp) {
    if (!timestamp) {
      return "N/A";
    }

    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }

    return "N/A";
  }

  function formatStatus(status) {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatReason(reason) {
    if (!reason) {
      return "Unknown";
    }

    return reason
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStatusClasses(status) {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";

      case "under_review":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";

      case "resolved":
        return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400";

      case "dismissed":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  }

  // ==========================================
  // MARK REPORT UNDER REVIEW
  // ==========================================

  async function handleMarkUnderReview(report) {
    try {
      setError("");

      if (!report?.id) {
        throw new Error("Report ID is missing.");
      }

      if (!user?.uid) {
        throw new Error("Admin authentication could not be verified.");
      }

      await markReportUnderReview(report.id, user.uid);

      setSelectedReport(null);

      await loadReports();
    } catch (error) {
      console.error("Error marking report under review:", error);

      setError(error.message || "Unable to update the report.");
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* ======================================
            HEADER
        ====================================== */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <FaFlag size={20} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Reports
                </h1>

                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Review reports submitted against landlords and agents.
                </p>
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={loadReports}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </motion.div>

        {/* ======================================
            STATS
        ====================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Reports
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {reports.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <FaFlag />
              </div>
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <FaClock />
              </div>
            </div>
          </motion.div>

          {/* Under Review */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Under Review
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {underReviewCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <FaExclamationTriangle />
              </div>
            </div>
          </motion.div>

          {/* Resolved */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {resolvedCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                <FaCheckCircle />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ======================================
            FILTERS
        ====================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>

              <option value="pending">Pending</option>

              <option value="under_review">Under Review</option>

              <option value="resolved">Resolved</option>

              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </motion.div>

        {/* ======================================
            ERROR
        ====================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-center">
              <FaSyncAlt className="mx-auto animate-spin text-2xl text-blue-600" />

              <p className="mt-4 text-slate-500 dark:text-slate-400">
                Loading reports...
              </p>
            </div>
          </motion.div>
        ) : filteredReports.length === 0 ? (
          /* ======================================
             EMPTY
          ====================================== */

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <FaFlag size={25} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
              No Reports Found
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              There are no reports matching your current filters.
            </p>
          </motion.div>
        ) : (
          /* ======================================
             REPORT LIST
          ====================================== */

          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
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
                    scale: 0.98,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  whileHover={{
                    y: -2,
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Report information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            report.status,
                          )}`}
                        >
                          {formatStatus(report.status)}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                        {formatReason(report.reason)}
                      </h3>

                      <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:flex-wrap sm:gap-6">
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            Reporter:
                          </strong>{" "}
                          {report.reporterName || "Unknown"}
                        </span>

                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            Reported:
                          </strong>{" "}
                          {report.reportedUserName || "Unknown"}
                        </span>

                        <span className="capitalize">
                          <strong className="text-slate-700 dark:text-slate-300">
                            Role:
                          </strong>{" "}
                          {report.reportedUserRole || "Unknown"}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {report.description}
                      </p>
                    </div>

                    {/* View */}
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Report
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ======================================
            FOOTER
        ====================================== */}

        {!loading && filteredReports.length > 0 && (
          <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        )}
      </div>

      {/* ========================================
          REPORT DETAILS MODAL
      ======================================== */}

      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Report Details
                  </h2>

                  <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                    Report ID: {selectedReport.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal body */}
              <div className="space-y-6 p-6">
                {/* Status */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                      selectedReport.status,
                    )}`}
                  >
                    {formatStatus(selectedReport.status)}
                  </span>
                </div>

                {/* Reporter */}
                <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-blue-600 dark:text-blue-400" />

                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Reporter
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">Name</p>

                      <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                        {selectedReport.reporterName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Email</p>

                      <p className="mt-1 break-all font-medium text-slate-800 dark:text-slate-200">
                        {selectedReport.reporterEmail || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reported account */}
                <div className="rounded-xl bg-red-50 p-5 dark:bg-red-950/20">
                  <div className="flex items-center gap-3">
                    <FaFlag className="text-red-600 dark:text-red-400" />

                    <h3 className="font-bold text-red-800 dark:text-red-300">
                      Reported Account
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-red-500 dark:text-red-400">
                        Name
                      </p>

                      <p className="mt-1 font-medium text-red-900 dark:text-red-200">
                        {selectedReport.reportedUserName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-red-500 dark:text-red-400">
                        Role
                      </p>

                      <p className="mt-1 capitalize font-medium text-red-900 dark:text-red-200">
                        {selectedReport.reportedUserRole || "N/A"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs text-red-500 dark:text-red-400">
                        Email
                      </p>

                      <p className="mt-1 break-all font-medium text-red-900 dark:text-red-200">
                        {selectedReport.reportedUserEmail || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Reason
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {formatReason(selectedReport.reason)}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <div className="mt-2 rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                      {selectedReport.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Submitted */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Submitted
                  </p>

                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(selectedReport.createdAt)}
                  </p>
                </div>

                {/* Review information */}
                {selectedReport.reviewedBy && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Review Information
                    </p>

                    <div className="mt-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Reviewed by:{" "}
                        <span className="font-semibold">
                          {selectedReport.reviewedBy}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Reviewed at: {formatDate(selectedReport.reviewedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:flex-wrap sm:justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Close
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {selectedReport.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleMarkUnderReview(selectedReport)}
                      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Mark as Under Review
                    </button>
                  )}

                  {(selectedReport.status === "pending" ||
                    selectedReport.status === "under_review") && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowDismissModal(true)}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Dismiss Report
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSuspendModal(true)}
                        className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                      >
                        Suspend Account
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDismissModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Dismiss Report
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Dismissing this report means no enforcement action will be
                    taken against the reported account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDismissModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="admin-notes"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Admin Notes
                </label>

                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  rows={5}
                  placeholder="Optional: explain why this report is being dismissed..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowDismissModal(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleDismissReport}
                  className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-600 dark:hover:bg-slate-500"
                >
                  {actionLoading ? "Dismissing..." : "Dismiss Report"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuspendModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/50 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                    Suspend Account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    You are about to temporarily suspend{" "}
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedReport.reportedUserName || "this account"}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Warning */}
              <div className="mt-6 rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
                <p className="text-sm leading-6 text-red-800 dark:text-red-300">
                  The account will be temporarily deactivated and the user will
                  be given an opportunity to appeal the decision.
                </p>
              </div>

              {/* Reason */}
              <div className="mt-6">
                <label
                  htmlFor="suspension-reason"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Suspension Reason
                </label>

                <textarea
                  id="suspension-reason"
                  value={suspensionReason}
                  onChange={(event) => setSuspensionReason(event.target.value)}
                  rows={5}
                  placeholder="Explain why this account is being suspended..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              {/* Appeal period */}
              <div className="mt-6">
                <label
                  htmlFor="appeal-days"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Appeal Period
                </label>

                <select
                  id="appeal-days"
                  value={appealDays}
                  onChange={(event) => setAppealDays(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-red-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  If the user does not appeal before this deadline, the account
                  will become eligible for permanent termination in the next
                  stage of the system.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowSuspendModal(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSuspendUser}
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? "Suspending..." : "Suspend Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default Reports;
