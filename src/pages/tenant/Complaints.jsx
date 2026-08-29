import { useEffect, useState } from "react";
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

import {
  getTenantProperties,
} from "../../firebase/propertyService";

import {
  createPropertyComplaint,
  getMyComplaints,
} from "../../firebase/complaintService";

function Complaints() {
  const { user } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [properties, setProperties] =
    useState([]);

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

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] =
    useState({
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

      const [
        tenantProperties,
        tenantComplaints,
      ] = await Promise.all([
        getTenantProperties(user.uid),
        getMyComplaints(user.uid),
      ]);

      setProperties(
        tenantProperties,
      );

      setComplaints(
        tenantComplaints,
      );
    } catch (err) {
      console.error(
        "Error loading complaints:",
        err,
      );

      setError(
        "Unable to load your complaints. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // HANDLE INPUT
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
      setError(
        "You must be logged in to submit a complaint.",
      );

      return;
    }

    if (!formData.propertyId) {
      setError(
        "Please select the property this complaint is about.",
      );

      return;
    }

    if (!formData.subject.trim()) {
      setError(
        "Please enter a complaint subject.",
      );

      return;
    }

    if (!formData.category) {
      setError(
        "Please select a complaint category.",
      );

      return;
    }

    if (!formData.details.trim()) {
      setError(
        "Please describe the problem.",
      );

      return;
    }

    // -----------------------------------------------
    // Find selected property
    // -----------------------------------------------

    const selectedProperty =
      properties.find(
        (property) =>
          property.id ===
          formData.propertyId,
      );

    if (!selectedProperty) {
      setError(
        "The selected property could not be found.",
      );

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

      if (
        selectedProperty.managementType ===
        "agent"
      ) {
        agentId =
          selectedProperty.agentId ||
          null;

        recipientRole = "agent";
      } else {
        landlordId =
          selectedProperty.ownerId ||
          null;

        recipientRole =
          "landlord";
      }

      // -----------------------------------------------
      // Safety check
      // -----------------------------------------------

      if (
        !landlordId &&
        !agentId
      ) {
        throw new Error(
          "This property does not have a landlord or managing agent assigned.",
        );
      }

      // =================================================
      // CREATE COMPLAINT
      // =================================================

      const complaintId =
        await createPropertyComplaint({
          tenantId: user.uid,

          tenantName:
            user.displayName ||
            user.name ||
            "",

          tenantEmail:
            user.email || "",

          propertyId:
            selectedProperty.id,

          propertyTitle:
            selectedProperty.title ||
            "Property",

          propertyAddress:
            selectedProperty.address ||
            "",

          propertyCity:
            selectedProperty.city ||
            "",

          propertyState:
            selectedProperty.state ||
            "",

          landlordId,

          agentId,

          recipientRole,

          subject:
            formData.subject.trim(),

          category:
            formData.category,

          details:
            formData.details.trim(),
        });

      console.log(
        "Property complaint created:",
        complaintId,
      );

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
      const updatedComplaints =
        await getMyComplaints(
          user.uid,
        );

      setComplaints(
        updatedComplaints,
      );
    } catch (err) {
      console.error(
        "Error submitting complaint:",
        err,
      );

      setError(
        err.message ||
          "Failed to submit complaint. Please try again.",
      );
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

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      return timestamp
        .toDate()
        .toLocaleString();
    }

    if (
      timestamp instanceof Date
    ) {
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
            "bg-green-100 text-green-700",
          icon: (
            <FaCheckCircle />
          ),
          label: "Resolved",
        };

      case "in-progress":
        return {
          className:
            "bg-blue-100 text-blue-700",
          icon: <FaClock />,
          label: "In Progress",
        };

      case "rejected":
        return {
          className:
            "bg-red-100 text-red-700",
          icon: (
            <FaExclamationCircle />
          ),
          label: "Rejected",
        };

      default:
        return {
          className:
            "bg-yellow-100 text-yellow-700",
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
      <div className="mx-auto max-w-6xl space-y-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Complaints
          </h1>

          <p className="mt-2 text-slate-500">
            Report an issue with one of your
            rented properties.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FaExclamationCircle className="mt-1 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <FaCheckCircle className="mt-1 shrink-0" />

            <p>{success}</p>
          </div>
        )}

        {/* =================================================
            LODGE PROPERTY COMPLAINT
        ================================================= */}

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <div className="mb-8">

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FaHome />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Lodge a Property Complaint
                </h2>

                <p className="mt-1 text-slate-500">
                  Report an issue to the landlord
                  or agent managing your property.
                </p>
              </div>
            </div>

          </div>

          {/* =================================================
              NO PROPERTIES
          ================================================= */}

          {!loading &&
            properties.length === 0 && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">

                <div className="flex items-start gap-3 text-yellow-700">

                  <FaExclamationCircle className="mt-1" />

                  <div>
                    <h3 className="font-semibold">
                      No rented properties found
                    </h3>

                    <p className="mt-1 text-sm">
                      You need to have a rented
                      property before you can
                      lodge a property complaint.
                    </p>
                  </div>

                </div>

              </div>
            )}

          {/* =================================================
              FORM
          ================================================= */}

          {!loading &&
            properties.length > 0 && (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* PROPERTY */}

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Property
                  </label>

                  <select
                    name="propertyId"
                    value={
                      formData.propertyId
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">
                      Select the property
                    </option>

                    {properties.map(
                      (property) => (
                        <option
                          key={
                            property.id
                          }
                          value={
                            property.id
                          }
                        >
                          {property.title ||
                            "Untitled Property"}
                          {property.city
                            ? ` — ${property.city}`
                            : ""}
                        </option>
                      ),
                    )}
                  </select>

                  <p className="mt-2 text-sm text-slate-500">
                    Select the property where
                    you are experiencing the
                    problem.
                  </p>
                </div>

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
                    placeholder="e.g. Water supply problem"
                    className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Complaint Category
                  </label>

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>

                    <option value="Water Supply">
                      Water Supply
                    </option>

                    <option value="Electricity">
                      Electricity
                    </option>

                    <option value="Security">
                      Security
                    </option>

                    <option value="Plumbing">
                      Plumbing
                    </option>

                    <option value="Power">
                      Power
                    </option>

                    <option value="Rent">
                      Rent / Payment
                    </option>

                    <option value="Neighbour">
                      Neighbour / Community
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* DETAILS */}

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Complaint Details
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
                    placeholder="Describe the problem in detail..."
                    className="w-full resize-none rounded-xl border border-slate-300 p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* RECIPIENT INFORMATION */}

                {formData.propertyId && (
                  <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">

                    <p className="font-semibold">
                      Complaint recipient
                    </p>

                    <p className="mt-1">
                      Your complaint will be
                      automatically sent to the
                      landlord or managing agent
                      responsible for the selected
                      property.
                    </p>

                  </div>
                )}

                {/* SUBMIT */}

                <div className="flex justify-end">

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaPaperPlane />

                    {submitting
                      ? "Submitting..."
                      : "Submit Complaint"}
                  </button>

                </div>

              </form>
            )}

        </div>

        {/* =================================================
            MY COMPLAINTS
        ================================================= */}

        <div>

          <div className="mb-5 flex items-center gap-3">

            <FaBell className="text-blue-600" />

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My Property Complaints
              </h2>

              <p className="mt-1 text-slate-500">
                Track complaints you have sent
                to your landlord or agent.
              </p>
            </div>

          </div>

          {/* Loading */}

          {loading && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-slate-500">
                Loading complaints...
              </p>
            </div>
          )}

          {/* Empty */}

          {!loading &&
            complaints.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <FaBell className="text-2xl text-slate-400" />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-800">
                  No Property Complaints
                </h3>

                <p className="mt-2 text-slate-500">
                  You haven't submitted any
                  property complaints yet.
                </p>

              </div>
            )}

          {/* Complaints */}

          {!loading &&
            complaints.length > 0 && (
              <div className="space-y-5">

                {complaints.map(
                  (complaint) => {
                    const status =
                      getStatusStyle(
                        complaint.status,
                      );

                    return (
                      <div
                        key={
                          complaint.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        {/* Header */}

                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                          <div>

                            <h3 className="text-xl font-bold text-slate-900">
                              {
                                complaint.subject
                              }
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                              Property:{" "}
                              <span className="font-medium text-slate-700">
                                {
                                  complaint.propertyTitle
                                }
                              </span>
                            </p>

                            {complaint.category && (
                              <p className="mt-1 text-sm text-slate-500">
                                Category:{" "}
                                <span className="font-medium text-slate-700">
                                  {
                                    complaint.category
                                  }
                                </span>
                              </p>
                            )}

                          </div>

                          {/* STATUS */}

                          <div
                            className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
                          >
                            {status.icon}

                            {status.label}
                          </div>

                        </div>

                        {/* Date */}

                        <p className="mt-4 text-xs text-slate-400">
                          Submitted{" "}
                          {formatDate(
                            complaint.createdAt,
                          )}
                        </p>

                        {/* Details */}

                        <div className="mt-5 rounded-xl bg-slate-50 p-5">

                          <p className="text-sm font-semibold text-slate-700">
                            Your complaint
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-slate-600">
                            {
                              complaint.details
                            }
                          </p>

                        </div>

                        {/* REPLY */}

                        {complaint.managerReply && (
                          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">

                            <div className="flex items-center gap-2 text-green-700">

                              <FaReply />

                              <p className="font-semibold">
                                Reply from your{" "}
                                {
                                  complaint.recipientRole ===
                                  "agent"
                                    ? "agent"
                                    : "landlord"
                                }
                              </p>

                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-green-800">
                              {
                                complaint.managerReply
                              }
                            </p>

                            {complaint.repliedAt && (
                              <p className="mt-3 text-xs text-green-600">
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

export default Complaints;