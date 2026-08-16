import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getAgentApplications,
  approveApplication,
  rejectApplication,
} from "../../firebase/applicationService";

import { createTenancy } from "../../firebase/tenancyService";

import {
  assignPropertyToTenant,
} from "../../firebase/propertyService";

function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState(null);

  async function loadApplications() {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getAgentApplications(user.uid);

      setApplications(data);
    } catch (error) {
      console.error("Error loading agent applications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [user?.uid]);

  async function handleStatus(applicationId, status) {
    try {
      setProcessingId(applicationId);

      await updateApplicationStatus(applicationId, status);

      await loadApplications();
    } catch (error) {
      console.error("Error updating application:", error);

      alert("Unable to update application.");
    } finally {
      setProcessingId(null);
    }
  }

async function handleApprove(application) {
  try {
    setProcessingId(application.id);

    // 1. Approve application
    await approveApplication(
      application.id,
    );

    // 2. Create tenancy
    await createTenancy({
      application,

      tenantId:
        application.tenantId,

      managerId:
        user.uid,

      managerRole:
        "agent",

      managerName:
        user.fullName ||
        user.displayName ||
        "",

      managerEmail:
        user.email ||
        "",
    });

    // 3. Assign property to tenant
    await assignPropertyToTenant(
      application.propertyId,
      application.tenantId,
    );

    alert(
      "Application approved and tenancy created successfully.",
    );

    // 4. Refresh applications
    await loadApplications();

  } catch (error) {
    console.error(
      "Approval error:",
      error,
    );

    alert(
      error.message ||
        "Failed to approve application.",
    );
  } finally {
    setProcessingId(null);
  }
}

  async function handleReject(application) {
    try {
      setProcessingId(application.id);

      await rejectApplication(application.id);

      alert("Application rejected successfully.");

      await loadApplications();
    } catch (error) {
      console.error("Rejection error:", error);

      alert(error.message || "Failed to reject application.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Applications</h1>

          <p className="mt-2 text-slate-500">
            Review applications submitted for properties you manage.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Loading applications...</p>
          </div>
        )}

        {/* Empty */}

        {!loading && applications.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FaClipboardList className="text-2xl" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              No Applications
            </h2>

            <p className="mt-2 text-slate-500">
              Applications for your managed properties will appear here.
            </p>
          </div>
        )}

        {/* Applications */}

        {!loading && applications.length > 0 && (
          <div className="space-y-5">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  {/* Information */}

                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {application.propertyTitle || "Property"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {application.propertyCity || ""}
                      {application.propertyState
                        ? `, ${application.propertyState}`
                        : ""}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-400">Applicant</p>

                        <p className="font-semibold text-slate-700">
                          {application.tenantName || "Tenant"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Email</p>

                        <p className="font-semibold text-slate-700">
                          {application.tenantEmail || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Phone</p>

                        <p className="font-semibold text-slate-700">
                          {application.phone || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Move-in Date</p>

                        <p className="font-semibold text-slate-700">
                          {application.moveInDate || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status / Actions */}

                  <div className="flex flex-col items-start gap-4 lg:items-end">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                        application.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : application.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {application.status}
                    </span>

                    {application.status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(application)}
                          disabled={processingId === application.id}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <FaCheck />
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(application)}
                          disabled={processingId === application.id}
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <FaTimes />
                          Reject
                        </button>
                      </div>
                    )}
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

export default Applications;
