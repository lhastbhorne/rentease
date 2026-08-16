import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileContract,
  FaCreditCard,
  FaExclamationCircle,
  FaEnvelope,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTenancy } from "../../firebase/tenancyService";

function MyRental() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tenancy, setTenancy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenancy() {
      if (!user?.uid) return;

      try {
        setLoading(true);

        const data = await getMyTenancy(user.uid);

        setTenancy(data);
      } catch (error) {
        console.error("Error loading tenancy:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTenancy();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-slate-500">Loading your rental...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!tenancy) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FaHome size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-800">
              You Don't Have an Active Rental
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              Once a landlord approves your application, your rental property
              will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Rental</h1>

          <p className="mt-2 text-slate-500">
            Manage your current rental and tenancy information.
          </p>
        </div>

        {/* Rental Status */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Rental Status</p>

            <p className="mt-1 text-lg font-semibold capitalize text-slate-800">
              {tenancy.status || "Active"}
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold capitalize text-green-700">
            {tenancy.status || "active"}
          </span>
        </div>

        {/* Property */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* Property image */}
            <div className="min-h-[320px] bg-slate-100">
              {tenancy.propertyImage ? (
                <img
                  src={tenancy.propertyImage}
                  alt={tenancy.propertyTitle}
                  className="h-full min-h-[320px] w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center text-slate-400">
                  <FaHome size={60} />
                </div>
              )}
            </div>

            {/* Property information */}
            <div className="p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Current Rental
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {tenancy.propertyTitle || "Rental Property"}
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 text-blue-600" />

                  <div>
                    <p className="text-sm text-slate-500">Property</p>

                    <p className="font-medium text-slate-800">
                      {tenancy.propertyTitle || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaMoneyBillWave className="mt-1 text-green-600" />

                  <div>
                    <p className="text-sm text-slate-500">Rent</p>

                    <p className="font-semibold text-slate-800">
                      ₦{Number(tenancy.rentAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="mt-1 text-purple-600" />

                  <div>
                    <p className="text-sm text-slate-500">Move-in Date</p>

                    <p className="font-medium text-slate-800">
                      {tenancy.moveInDate || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaUser className="mt-1 text-orange-600" />

                  <div>
                    <p className="text-sm text-slate-500">Tenant</p>

                    <p className="font-medium text-slate-800">
                      {tenancy.tenantName || user?.fullName || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rental Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Rental Services
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Contract */}
            <button
              type="button"
              onClick={() => navigate("/tenant/contract")}
              className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaFileContract size={24} className="text-blue-600" />

              <h3 className="mt-4 font-semibold text-slate-800">
                Rental Contract
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View or download your rental contract.
              </p>
            </button>

            {/* Payment */}
            <button
              type="button"
              onClick={() => navigate("/tenant/payments")}
              className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaCreditCard size={24} className="text-green-600" />

              <h3 className="mt-4 font-semibold text-slate-800">Pay Rent</h3>

              <p className="mt-1 text-sm text-slate-500">
                Make your rent payment online.
              </p>
            </button>

            {/* Complaint */}
            <button
              type="button"
              onClick={() => navigate("/tenant/complaints")}
              className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaExclamationCircle size={24} className="text-orange-600" />

              <h3 className="mt-4 font-semibold text-slate-800">
                Lodge Complaint
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Report an issue with your rental.
              </p>
            </button>

            {/* Messages */}
            <button
              type="button"
              onClick={() => navigate("/tenant/messages")}
              className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaEnvelope size={24} className="text-purple-600" />

              <h3 className="mt-4 font-semibold text-slate-800">
                Message Landlord
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Contact your landlord or managing agent.
              </p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyRental;
