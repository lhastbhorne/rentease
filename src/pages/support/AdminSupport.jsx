import { useEffect, useState } from "react";
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

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formData, setFormData] =
    useState({
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

      const data =
        await getMyAdminComplaints(
          user.uid,
        );

      setComplaints(data);
    } catch (err) {
      console.error(
        "Error loading admin support:",
        err,
      );

      setError(
        "Unable to load your support requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INPUT
  // =====================================================

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

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
      setError(
        "You must be logged in.",
      );
      return;
    }

    if (!formData.subject.trim()) {
      setError(
        "Please enter a subject.",
      );
      return;
    }

    if (!formData.category) {
      setError(
        "Please select a category.",
      );
      return;
    }

    if (!formData.details.trim()) {
      setError(
        "Please describe your problem.",
      );
      return;
    }

    try {
      setSubmitting(true);

      await createAdminComplaint({
        userId: user.uid,

        userName:
          user.fullName ||
          user.displayName ||
          user.name ||
          "",

        userEmail:
          user.email || "",

        userRole:
          user.role || "",

        subject:
          formData.subject.trim(),

        category:
          formData.category,

        details:
          formData.details.trim(),
      });

      setFormData({
        subject: "",
        category: "",
        details: "",
      });

      setSuccess(
        "Your support request has been sent to RentEase Admin.",
      );

      await loadComplaints();
    } catch (err) {
      console.error(
        "Admin support error:",
        err,
      );

      setError(
        err.message ||
          "Failed to send support request.",
      );
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
    if (status === "resolved") {
      return {
        label: "Resolved",
        className:
          "bg-green-100 text-green-700",
        icon: <FaCheckCircle />,
      };
    }

    if (
      status === "in-progress"
    ) {
      return {
        label: "In Progress",
        className:
          "bg-blue-100 text-blue-700",
        icon: <FaClock />,
      };
    }

    return {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-700",
      icon: <FaClock />,
    };
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FaHeadset className="text-xl" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Admin Support
              </h1>

              <p className="mt-1 text-slate-500">
                Contact RentEase support for
                website or account-related
                problems.
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FaExclamationCircle className="mt-1" />

            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <FaCheckCircle className="mt-1" />

            <p>{success}</p>
          </div>
        )}

        {/* =================================================
            CONTACT ADMIN
        ================================================= */}

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Contact RentEase Admin
          </h2>

          <p className="mt-2 text-slate-500">
            This support form is only for
            problems concerning the RentEase
            website, your account, payments on
            the platform, or other platform
            services.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            {/* SUBJECT */}

            <div>
              <label className="mb-2 block font-semibold text-slate-800">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={
                  formData.subject
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. I cannot access my account"
                className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block font-semibold text-slate-800">
                Category
              </label>

              <select
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="">
                  Select category
                </option>

                <option value="Account">
                  Account
                </option>

                <option value="Login">
                  Login / Authentication
                </option>

                <option value="Technical">
                  Technical Problem
                </option>

                <option value="Payment">
                  Platform Payment
                </option>

                <option value="Verification">
                  Account Verification
                </option>

                <option value="Property Listing">
                  Property Listing
                </option>

                <option value="Application">
                  Rental Application
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* DETAILS */}

            <div>
              <label className="mb-2 block font-semibold text-slate-800">
                Description
              </label>

              <textarea
                name="details"
                value={
                  formData.details
                }
                onChange={
                  handleChange
                }
                rows="7"
                placeholder="Describe the problem you are experiencing..."
                className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* SUBMIT */}

            <div className="flex justify-end">

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaPaperPlane />

                {submitting
                  ? "Sending..."
                  : "Send to Admin"}
              </button>

            </div>

          </form>
        </div>

        {/* =================================================
            PREVIOUS REQUESTS
        ================================================= */}

        <div>

          <h2 className="mb-5 text-2xl font-bold text-slate-900">
            My Support Requests
          </h2>

          {loading && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-slate-500">
                Loading support requests...
              </p>
            </div>
          )}

          {!loading &&
            complaints.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <FaHeadset className="text-xl text-slate-400" />
                </div>

                <h3 className="mt-4 text-xl font-bold text-slate-800">
                  No Support Requests
                </h3>

                <p className="mt-2 text-slate-500">
                  Your conversations with
                  RentEase Admin will appear here.
                </p>

              </div>
            )}

          {!loading &&
            complaints.length > 0 && (
              <div className="space-y-5">

                {complaints.map(
                  (complaint) => {
                    const status =
                      getStatus(
                        complaint.status,
                      );

                    return (
                      <div
                        key={
                          complaint.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <div className="flex flex-col justify-between gap-4 md:flex-row">

                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {
                                complaint.subject
                              }
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {
                                complaint.category
                              }
                            </p>
                          </div>

                          <div
                            className={`flex h-fit w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
                          >
                            {status.icon}

                            {status.label}
                          </div>

                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          Submitted{" "}
                          {formatDate(
                            complaint.createdAt,
                          )}
                        </p>

                        <div className="mt-5 rounded-xl bg-slate-50 p-5">

                          <p className="font-semibold text-slate-700">
                            Your message
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-slate-600">
                            {
                              complaint.details
                            }
                          </p>

                        </div>

                        {/* ADMIN REPLY */}

                        {complaint.adminReply && (
                          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">

                            <div className="flex items-center gap-2 text-blue-700">

                              <FaReply />

                              <p className="font-semibold">
                                RentEase Admin
                              </p>

                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-blue-900">
                              {
                                complaint.adminReply
                              }
                            </p>

                            {complaint.repliedAt && (
                              <p className="mt-3 text-xs text-blue-600">
                                Replied{" "}
                                {formatDate(
                                  complaint.repliedAt,
                                )}
                              </p>
                            )}

                          </div>
                        )}

                      </div>
                    );
                  },
                )}

              </div>
            )}

        </div>

      </div>
    </DashboardLayout>
  );
}

export default AdminSupport;