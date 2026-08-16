import { useEffect, useState } from "react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getLandlordApplications,
  updateApplicationStatus,
} from "../../firebase/applicationService";

import { createTenancy } from "../../firebase/tenancyService";

import { assignPropertyToTenant } from "../../firebase/propertyService";

import { createNotification } from "../../firebase/notificationService";

function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // ==========================================
  // LOAD APPLICATIONS
  // ==========================================

  useEffect(() => {
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
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [user]);

  // ==========================================
  // APPROVE / REJECT APPLICATION
  // ==========================================

  async function handleStatusChange(application, newStatus) {
    try {
      setProcessingId(application.id);

      // ========================================
      // REJECT APPLICATION
      // ========================================

      if (newStatus === "rejected") {
        // 1. Update application
        await updateApplicationStatus(application.id, "rejected");

        // 2. Create notification for tenant
        await createNotification({
          userId: application.tenantId,

          title: "Application Rejected",

          message: `Your application for ${application.propertyTitle} has been rejected.`,

          type: "rejected",

          link: "/tenant/applications",
        });

        // 3. Update landlord page
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

        alert("Application rejected. The tenant has been notified.");

        return;
      }

      // ========================================
      // APPROVE APPLICATION
      // ========================================

      if (newStatus === "approved") {
        // 1. Approve application
        await updateApplicationStatus(application.id, "approved");

        // 2. Assign property to tenant
        await assignPropertyToTenant(
          application.propertyId,
          application.tenantId,
        );

        // 3. Create tenancy
        await createTenancy({
          application,

          tenantId: application.tenantId,

          landlordId: user.uid,

          landlordName: user.fullName || user.displayName || "",

          landlordEmail: user.email || "",
        });

        // 4. Notify tenant
        await createNotification({
          userId: application.tenantId,

          title: "Application Approved",

          message: `Your application for ${application.propertyTitle} has been approved.`,

          type: "approved",

          link: "/tenant/applications",
        });

        // 5. Update landlord page
        setApplications((prev) =>
          prev.map((item) =>
            item.id === application.id
              ? {
                  ...item,
                  status: "approved",
                }
              : item,
          ),
        );

        alert(
          "Application approved successfully. The property has been assigned to the tenant.",
        );
      }
    } catch (error) {
      console.error("Error processing application:", error);

      alert(
        error.message ||
          "Something went wrong while processing the application.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // STATUS STYLING
  // ==========================================

  function getStatusClasses(status) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">Loading applications...</p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Applications</h1>

          <p className="mt-2 text-slate-500">
            Review and manage applications submitted for your properties.
          </p>
        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              No Applications Yet
            </h2>

            <p className="mt-2 text-slate-500">
              You don't have any tenant applications for your properties yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* ================================= */}
                {/* APPLICATION HEADER */}
                {/* ================================= */}

                <div className="border-b p-6">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {application.propertyTitle || "Property"}
                      </h2>

                      <p className="mt-1 text-slate-500">
                        Applicant:{" "}
                        <span className="font-medium text-slate-700">
                          {application.tenantName || "Unknown Tenant"}
                        </span>
                      </p>

                      <p className="text-sm text-slate-500">
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

                {/* ================================= */}
                {/* APPLICATION INFORMATION */}
                {/* ================================= */}

                <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Applicant */}
                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800">
                      Applicant Information
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Name:</span>{" "}
                        {application.tenantName || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500">Email:</span>{" "}
                        {application.tenantEmail || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500">Phone:</span>{" "}
                        {application.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Employment */}
                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800">
                      Employment Information
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Status:</span>{" "}
                        {application.employmentStatus || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500">Occupation:</span>{" "}
                        {application.occupation || "N/A"}
                      </p>

                      <p>
                        <span className="text-slate-500">Monthly Income:</span>{" "}
                        ₦
                        {Number(
                          application.monthlyIncome || 0,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Property */}
                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800">
                      Property Information
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Location:</span>{" "}
                        {application.propertyCity || "N/A"}
                        {application.propertyState
                          ? `, ${application.propertyState}`
                          : ""}
                      </p>

                      <p>
                        <span className="text-slate-500">Rent:</span> ₦
                        {Number(
                          application.propertyPrice || 0,
                        ).toLocaleString()}
                      </p>

                      <p>
                        <span className="text-slate-500">Move-in:</span>{" "}
                        {application.moveInDate || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ================================= */}
                {/* APPLICANT MESSAGE */}
                {/* ================================= */}

                {application.message && (
                  <div className="mx-6 mb-6 rounded-xl bg-slate-50 p-5">
                    <h3 className="mb-2 font-semibold text-slate-800">
                      Message from Applicant
                    </h3>

                    <p className="leading-7 text-slate-600">
                      {application.message}
                    </p>
                  </div>
                )}

                {/* ================================= */}
                {/* ACTION BUTTONS */}
                {/* ================================= */}

                {application.status === "pending" && (
                  <div className="flex flex-col gap-3 border-t bg-slate-50 p-6 sm:flex-row sm:justify-end">
                    {/* Reject */}
                    <button
                      type="button"
                      disabled={processingId === application.id}
                      onClick={() =>
                        handleStatusChange(application, "rejected")
                      }
                      className="rounded-lg border border-red-200 px-6 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingId === application.id
                        ? "Processing..."
                        : "Reject"}
                    </button>

                    {/* Approve */}
                    <button
                      type="button"
                      disabled={processingId === application.id}
                      onClick={() =>
                        handleStatusChange(application, "approved")
                      }
                      className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingId === application.id
                        ? "Processing..."
                        : "Approve Application"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Applications;
