import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaEye,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  getAllComplaints,
  updateComplaintStatus,
} from "../../firebase/adminComplaintService";

function Complaints() {
  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState(null);

  async function loadComplaints() {
    try {
      setLoading(true);

      const data =
        await getAllComplaints();

      setComplaints(data);
    } catch (error) {
      console.error(
        "Error loading complaints:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function handleStatusChange(
    complaintId,
    status
  ) {
    try {
      setProcessingId(complaintId);

      await updateComplaintStatus(
        complaintId,
        status
      );

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status,
              }
            : complaint
        )
      );
    } catch (error) {
      console.error(
        "Error updating complaint:",
        error
      );

      alert(
        error.message ||
          "Failed to update complaint."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "in_progress":
        return "bg-blue-100 text-blue-700";

      case "resolved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  function formatStatus(status) {
    if (!status) return "Pending";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function formatDate(timestamp) {
    if (!timestamp?.toDate) {
      return "—";
    }

    return timestamp
      .toDate()
      .toLocaleString();
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FaClipboardList />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Complaints
              </h1>

              <p className="mt-1 text-slate-500">
                Review and manage tenant complaints.
              </p>
            </div>

          </div>

        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">
              Loading complaints...
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          complaints.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <FaClipboardList className="mx-auto text-5xl text-slate-300" />

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No Complaints
              </h2>

              <p className="mt-2 text-slate-500">
                There are currently no complaints to review.
              </p>

            </div>
          )}

        {/* Complaints */}

        {!loading &&
          complaints.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead className="border-b bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Complaint
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Tenant
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Date
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {complaints.map(
                      (complaint) => (
                        <tr
                          key={complaint.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-6 py-5">

                            <p className="font-semibold text-slate-800">
                              {complaint.subject ||
                                complaint.title ||
                                complaint.category ||
                                "Complaint"}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                              {complaint.description ||
                                "No description"}
                            </p>

                          </td>

                          <td className="px-6 py-5">

                            <p className="font-medium text-slate-800">
                              {complaint.tenantName ||
                                complaint.userName ||
                                "Tenant"}
                            </p>

                            <p className="text-sm text-slate-500">
                              {complaint.tenantEmail ||
                                complaint.userEmail ||
                                ""}
                            </p>

                          </td>

                          <td className="px-6 py-5 text-slate-600">
                            {complaint.category ||
                              "—"}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(
                              complaint.createdAt
                            )}
                          </td>

                          <td className="px-6 py-5">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                complaint.status
                              )}`}
                            >
                              {formatStatus(
                                complaint.status
                              )}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <select
                              value={
                                complaint.status ||
                                "pending"
                              }
                              disabled={
                                processingId ===
                                complaint.id
                              }
                              onChange={(event) =>
                                handleStatusChange(
                                  complaint.id,
                                  event.target.value
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >

                              <option value="pending">
                                Pending
                              </option>

                              <option value="in_progress">
                                In Progress
                              </option>

                              <option value="resolved">
                                Resolved
                              </option>

                              <option value="rejected">
                                Rejected
                              </option>

                            </select>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

      </div>
    </DashboardLayout>
  );
}

export default Complaints;