import { useEffect, useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaFileAlt,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getPendingProperties,
  approveProperty,
  rejectProperty,
} from "../../firebase/adminService";

function Verification() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  async function loadProperties() {
    try {
      setLoading(true);

      const data = await getPendingProperties();

      setProperties(data);
    } catch (error) {
      console.error(
        "Error loading pending properties:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  // ==========================================
  // APPROVE PROPERTY
  // ==========================================

  async function handleApprove(property) {
    try {
      setProcessingId(property.id);

      await approveProperty(
        property.id,
        user?.uid
      );

      alert("Property approved successfully.");

      await loadProperties();
    } catch (error) {
      console.error(
        "Error approving property:",
        error
      );

      alert(
        error.message ||
          "Failed to approve property."
      );
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // REJECT PROPERTY
  // ==========================================

  async function handleReject(property) {
    const reason = window.prompt(
      "Why is this property being rejected?"
    );

    if (reason === null) {
      return;
    }

    try {
      setProcessingId(property.id);

      await rejectProperty(
        property.id,
        user?.uid,
        reason
      );

      alert("Property rejected.");

      await loadProperties();
    } catch (error) {
      console.error(
        "Error rejecting property:",
        error
      );

      alert(
        error.message ||
          "Failed to reject property."
      );
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Property Verification
          </h1>

          <p className="mt-2 text-slate-500">
            Review properties submitted by landlords
            and agents before they become publicly
            available.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading pending properties...
            </p>
          </div>
        )}

        {/* No Properties */}

        {!loading &&
          properties.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <FaCheck className="text-2xl" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-800">
                All Caught Up
              </h2>

              <p className="mt-2 text-slate-500">
                There are no properties waiting for
                verification.
              </p>

            </div>
          )}

        {/* Pending Properties */}

        {!loading &&
          properties.length > 0 && (
            <div className="space-y-6">

              {properties.map((property) => (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >

                  <div className="grid lg:grid-cols-3">

                    {/* Property Image */}

                    <div>
                      <img
                        src={
                          property.images?.[0] ||
                          "https://placehold.co/800x600?text=Property"
                        }
                        alt={
                          property.title ||
                          "Property"
                        }
                        className="h-full min-h-64 w-full object-cover"
                      />
                    </div>

                    {/* Property Details */}

                    <div className="p-6 lg:col-span-2">

                      <div className="flex flex-col justify-between gap-4 sm:flex-row">

                        <div>
                          <h2 className="text-2xl font-bold text-slate-800">
                            {property.title ||
                              "Untitled Property"}
                          </h2>

                          <p className="mt-2 text-slate-500">
                            {property.city ||
                              "Unknown City"}

                            {property.state
                              ? `, ${property.state}`
                              : ""}
                          </p>
                        </div>

                        <span className="h-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                          Pending
                        </span>

                      </div>

                      {/* Property Information */}

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-sm text-slate-400">
                            Property Type
                          </p>

                          <p className="font-semibold text-slate-700">
                            {property.type ||
                              property.propertyType ||
                              "Not specified"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">
                            Price
                          </p>

                          <p className="font-semibold text-blue-600">
                            ₦
                            {Number(
                              property.price || 0
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">
                            Bedrooms
                          </p>

                          <p className="font-semibold text-slate-700">
                            {property.bedrooms || 0}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">
                            Bathrooms
                          </p>

                          <p className="font-semibold text-slate-700">
                            {property.bathrooms || 0}
                          </p>
                        </div>

                      </div>

                      {/* Submitted By */}

                      <div className="mt-6 rounded-xl bg-slate-50 p-4">

                        <p className="text-sm font-medium text-slate-500">
                          Submitted By
                        </p>

                        <p className="mt-1 font-semibold capitalize text-slate-800">
                          {property.submittedByRole ||
                            property.role ||
                            "Unknown"}
                        </p>

                      </div>

                      {/* Ownership Proof */}

                      {property.submittedByRole ===
                        "landlord" && (
                        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

                          <div className="flex items-center gap-3">

                            <FaFileAlt className="text-blue-600" />

                            <div>
                              <p className="font-semibold text-slate-800">
                                Proof of Ownership
                              </p>

                              {property.ownershipProof ? (
                                <a
                                  href={
                                    property.ownershipProof
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-medium text-blue-600 hover:underline"
                                >
                                  View Ownership Document
                                </a>
                              ) : (
                                <p className="text-sm text-red-600">
                                  No ownership document uploaded.
                                </p>
                              )}
                            </div>

                          </div>

                        </div>
                      )}

                      {/* Agent Property */}

                      {property.submittedByRole ===
                        "agent" && (
                        <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-4">

                          <p className="font-semibold text-slate-800">
                            Agent Submission
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            This property was submitted
                            by a registered RentEase agent.
                          </p>

                        </div>
                      )}

                      {/* Actions */}

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                        <button
                          type="button"
                          onClick={() =>
                            handleApprove(property)
                          }
                          disabled={
                            processingId ===
                            property.id
                          }
                          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaCheck />

                          {processingId ===
                          property.id
                            ? "Processing..."
                            : "Approve Property"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleReject(property)
                          }
                          disabled={
                            processingId ===
                            property.id
                          }
                          className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaTimes />

                          Reject Property
                        </button>

                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </div>
    </DashboardLayout>
  );
}

export default Verification;