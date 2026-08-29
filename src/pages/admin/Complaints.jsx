import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaExclamationCircle,
  FaHeadset,
  FaReply,
  FaUser,
  FaTimes,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getAllComplaints,
  replyToComplaint,
  updateComplaintStatus,
} from "../../firebase/complaintService";

function AdminComplaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [reply, setReply] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // LOAD COMPLAINTS
  // =====================================================

  useEffect(() => {
    if (user?.uid) {
      loadComplaints();
    }
  }, [user?.uid]);

  async function loadComplaints() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAllComplaints();

      setComplaints(data);
    } catch (err) {
      console.error(
        "Error loading admin complaints:",
        err,
      );

      setError(
        "Unable to load support requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // OPEN COMPLAINT
  // =====================================================

  function openComplaint(complaint) {
    setSelectedComplaint(
      complaint,
    );

    setReply(
      complaint.adminReply || "",
    );

    setError("");
    setSuccess("");
  }

  // =====================================================
  // CLOSE COMPLAINT
  // =====================================================

  function closeComplaint() {
    setSelectedComplaint(null);
    setReply("");
  }

  // =====================================================
  // SEND REPLY
  // =====================================================

  async function handleReply() {
    if (!selectedComplaint) {
      return;
    }

    if (!reply.trim()) {
      setError(
        "Please enter a reply.",
      );

      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      await replyToComplaint(
        selectedComplaint.id,
        reply,
      );

      setSuccess(
        "Reply sent successfully.",
      );

      // Update selected complaint
      const updatedComplaint = {
        ...selectedComplaint,
        adminReply:
          reply.trim(),
        status: "resolved",
      };

      setSelectedComplaint(
        updatedComplaint,
      );

      // Update list
      setComplaints((prev) =>
        prev.map((item) =>
          item.id ===
          selectedComplaint.id
            ? updatedComplaint
            : item,
        ),
      );

      setReply("");
    } catch (err) {
      console.error(
        "Error replying to complaint:",
        err,
      );

      setError(
        err.message ||
          "Failed to send reply.",
      );
    } finally {
      setProcessing(false);
    }
  }

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  async function handleStatusChange(
    status,
  ) {
    if (!selectedComplaint) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      await updateComplaintStatus(
        selectedComplaint.id,
        status,
      );

      const updatedComplaint = {
        ...selectedComplaint,
        status,
      };

      setSelectedComplaint(
        updatedComplaint,
      );

      setComplaints((prev) =>
        prev.map((item) =>
          item.id ===
          selectedComplaint.id
            ? updatedComplaint
            : item,
        ),
      );

      setSuccess(
        "Complaint status updated.",
      );
    } catch (err) {
      console.error(
        "Error updating complaint:",
        err,
      );

      setError(
        err.message ||
          "Failed to update status.",
      );
    } finally {
      setProcessing(false);
    }
  }

  // =====================================================
  // DATE
  // =====================================================

  function formatDate(timestamp) {
    if (!timestamp) {
      return "Just now";
    }

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      return timestamp
        .toDate()
        .toLocaleString();
    }

    return "";
  }

  // =====================================================
  // STATUS
  // =====================================================

  function getStatus(status) {
    switch (status) {
      case "resolved":
        return {
          label: "Resolved",
          className:
            "bg-green-100 text-green-700",
          icon: (
            <FaCheckCircle />
          ),
        };

      case "in-progress":
        return {
          label: "In Progress",
          className:
            "bg-blue-100 text-blue-700",
          icon: <FaClock />,
        };

      case "rejected":
        return {
          label: "Rejected",
          className:
            "bg-red-100 text-red-700",
          icon: (
            <FaExclamationCircle />
          ),
        };

      default:
        return {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700",
          icon: <FaClock />,
        };
    }
  }

  // =====================================================
  // USER ROLE
  // =====================================================

  function getRoleLabel(role) {
    switch (role) {
      case "tenant":
        return "Tenant";

      case "landlord":
        return "Landlord";

      case "agent":
        return "Agent";

      default:
        return "User";
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FaHeadset className="text-xl" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Complaints & Support
              </h1>

              <p className="mt-1 text-slate-500">
                Manage support requests submitted
                by RentEase users.
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FaExclamationCircle className="mt-1 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <FaCheckCircle className="mt-1 shrink-0" />

            <p>{success}</p>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">
              Loading support requests...
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          complaints.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FaHeadset className="text-2xl text-slate-400" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-800">
                No Support Requests
              </h2>

              <p className="mt-2 text-slate-500">
                There are currently no complaints
                or support requests from users.
              </p>

            </div>
          )}

        {/* =================================================
            COMPLAINT LIST
        ================================================= */}

        {!loading &&
          complaints.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">

              {complaints.map(
                (complaint) => {
                  const status =
                    getStatus(
                      complaint.status,
                    );

                  return (
                    <button
                      key={
                        complaint.id
                      }
                      type="button"
                      onClick={() =>
                        openComplaint(
                          complaint,
                        )
                      }
                      className="text-left rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                      {/* HEADER */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <FaUser />
                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold text-slate-800">
                              {complaint.userName ||
                                "RentEase User"}
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {complaint.userEmail ||
                                "No email"}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.icon}

                          {status.label}
                        </span>

                      </div>

                      {/* USER ROLE */}

                      <div className="mt-5 flex items-center gap-2">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {getRoleLabel(
                            complaint.userRole,
                          )}
                        </span>

                        {complaint.category && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                            {
                              complaint.category
                            }
                          </span>
                        )}

                      </div>

                      {/* SUBJECT */}

                      <h3 className="mt-5 text-lg font-bold text-slate-900">
                        {
                          complaint.subject
                        }
                      </h3>

                      {/* MESSAGE PREVIEW */}

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {
                          complaint.details
                        }
                      </p>

                      {/* FOOTER */}

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            complaint.createdAt,
                          )}
                        </span>

                        <span className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                          <FaReply />
                          View & Reply
                        </span>

                      </div>

                    </button>
                  );
                },
              )}

            </div>
          )}

        {/* =================================================
            DETAIL / REPLY MODAL
        ================================================= */}

        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Support Request
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review and respond to the
                    user's request.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeComplaint
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <FaTimes />
                </button>

              </div>

              {/* MODAL CONTENT */}

              <div className="space-y-6 p-6">

                {/* USER */}

                <div className="rounded-xl bg-slate-50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FaUser />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {
                          selectedComplaint.userName ||
                          "RentEase User"
                        }
                      </p>

                      <p className="text-sm text-slate-500">
                        {
                          selectedComplaint.userEmail ||
                          "No email"
                        }
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {getRoleLabel(
                        selectedComplaint.userRole,
                      )}
                    </span>

                    {selectedComplaint.category && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {
                          selectedComplaint.category
                        }
                      </span>
                    )}

                  </div>

                </div>

                {/* SUBJECT */}

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Subject
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {
                      selectedComplaint.subject
                    }
                  </h3>

                  <p className="mt-2 text-xs text-slate-400">
                    Submitted{" "}
                    {formatDate(
                      selectedComplaint.createdAt,
                    )}
                  </p>
                </div>

                {/* ORIGINAL MESSAGE */}

                <div className="rounded-xl border border-slate-200 p-5">

                  <p className="font-semibold text-slate-700">
                    User's Complaint
                  </p>

                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                    {
                      selectedComplaint.details
                    }
                  </p>

                </div>

                {/* EXISTING REPLY */}

                {selectedComplaint.adminReply && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

                    <div className="flex items-center gap-2 text-blue-700">

                      <FaReply />

                      <p className="font-semibold">
                        Previous Admin Reply
                      </p>

                    </div>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-blue-900">
                      {
                        selectedComplaint.adminReply
                      }
                    </p>

                    {selectedComplaint.repliedAt && (
                      <p className="mt-3 text-xs text-blue-600">
                        Replied{" "}
                        {formatDate(
                          selectedComplaint.repliedAt,
                        )}
                      </p>
                    )}

                  </div>
                )}

                {/* STATUS */}

                <div>

                  <label className="mb-2 block font-semibold text-slate-800">
                    Complaint Status
                  </label>

                  <select
                    value={
                      selectedComplaint.status ||
                      "pending"
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        e.target.value,
                      )
                    }
                    disabled={
                      processing
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-500"
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="in-progress">
                      In Progress
                    </option>

                    <option value="resolved">
                      Resolved
                    </option>

                    <option value="rejected">
                      Rejected
                    </option>
                  </select>

                </div>

                {/* REPLY */}

                <div>

                  <label className="mb-2 block font-semibold text-slate-800">
                    Reply to User
                  </label>

                  <textarea
                    value={reply}
                    onChange={(e) =>
                      setReply(
                        e.target.value,
                      )
                    }
                    rows="6"
                    placeholder="Write your response to the user..."
                    className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* SEND */}

                <div className="flex justify-end">

                  <button
                    type="button"
                    onClick={
                      handleReply
                    }
                    disabled={
                      processing ||
                      !reply.trim()
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaEnvelope />

                    {processing
                      ? "Sending..."
                      : "Send Reply"}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default AdminComplaints;