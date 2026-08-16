import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import { getMyApplications } from "../../firebase/applicationService";

import { useAuth } from "../../contexts/AuthContext";

function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await getMyApplications(user.uid);

        setApplications(data);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadApplications();
    }
  }, [user]);

  function getStatusStyle(status) {
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>

          <p className="mt-2 text-slate-500">
            Track the properties you have applied for.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              No Applications Yet
            </h2>

            <p className="mt-2 text-slate-500">
              You haven't applied for any properties yet.
            </p>
          </div>
        ) : (
          /* Applications */
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="p-6">
                  {/* Top */}
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        {application.propertyTitle || "Property Application"}
                      </h2>

                      <p className="mt-2 text-slate-500">
                        Application ID: {application.id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                        application.status,
                      )}`}
                    >
                      {application.status || "pending"}
                    </span>
                  </div>

                  {/* Information */}
                  <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-500">Move-in Date</p>

                      <p className="mt-1 flex items-center gap-2 font-medium">
                        <FaCalendarAlt className="text-blue-600" />

                        {application.moveInDate || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Employment Status
                      </p>

                      <p className="mt-1 font-medium">
                        {application.employmentStatus || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Monthly Income</p>

                      <p className="mt-1 font-medium">
                        {application.monthlyIncome
                          ? `₦${Number(
                              application.monthlyIncome,
                            ).toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  {application.message && (
                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-600">
                        Your message
                      </p>

                      <p className="mt-2 text-slate-700">
                        {application.message}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {(application.city || application.state) && (
                    <p className="mt-5 flex items-center gap-2 text-slate-500">
                      <FaMapMarkerAlt className="text-blue-600" />
                      {application.city}, {application.state}
                    </p>
                  )}
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
