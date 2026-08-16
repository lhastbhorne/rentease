import { useEffect, useState } from "react";
import {
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaFileContract,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTenancy } from "../../firebase/tenancyService";

function Tenancy() {
  const { user } = useAuth();

  const [tenancy, setTenancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTenancy() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyTenancy(user.uid);

        setTenancy(data);
      } catch (err) {
        console.error("Error loading tenancy:", err);

        setError("Unable to load your tenancy information.");
      } finally {
        setLoading(false);
      }
    }

    loadTenancy();
  }, [user?.uid]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(value) {
    if (!value) {
      return "Not specified";
    }

    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleDateString();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleDateString();
  }

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  function formatMoney(value) {
    const amount = Number(value || 0);

    return `₦${amount.toLocaleString()}`;
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-slate-500">Loading tenancy information...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Tenancy</h1>

          <p className="mt-2 text-slate-500">
            View your current rental and tenancy information.
          </p>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* ========================================
            NO ACTIVE TENANCY
        ======================================== */}

        {!tenancy && !error && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FaHome className="text-2xl" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              No Active Tenancy
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-slate-500">
              You don't currently have an active tenancy. Once a landlord
              approves your application, your tenancy information will appear
              here.
            </p>
          </div>
        )}

        {/* ========================================
            ACTIVE TENANCY
        ======================================== */}

        {tenancy && (
          <div className="space-y-6">
            {/* ======================================
                STATUS
            ====================================== */}

            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Tenancy Status
                </p>

                <h2 className="mt-1 text-2xl font-bold capitalize text-slate-800">
                  {tenancy.status || "Active"}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-green-100 px-4 py-2 font-semibold capitalize text-green-700">
                {tenancy.status || "Active"}
              </span>
            </div>

            {/* ======================================
                PROPERTY
            ====================================== */}

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b p-6">
                <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <FaHome className="text-blue-600" />
                  Rental Property
                </h2>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                {/* PROPERTY IMAGE */}

                <div>
                  <img
                    src={
                      tenancy.propertyImage ||
                      "https://placehold.co/800x500?text=Property"
                    }
                    alt={tenancy.propertyTitle || "Rental property"}
                    className="h-64 w-full rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/800x500?text=Property";
                    }}
                  />
                </div>

                {/* PROPERTY INFORMATION */}

                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {tenancy.propertyTitle || "Rental Property"}
                  </h3>

                  <div className="mt-4 space-y-2">
                    <p className="flex items-start gap-2 text-slate-500">
                      <FaMapMarkerAlt className="mt-1 shrink-0 text-blue-600" />

                      <span>
                        {tenancy.propertyAddress || "Address not specified"}
                      </span>
                    </p>

                    {(tenancy.propertyCity || tenancy.propertyState) && (
                      <p className="ml-6 text-slate-500">
                        {tenancy.propertyCity || ""}

                        {tenancy.propertyCity && tenancy.propertyState
                          ? ", "
                          : ""}

                        {tenancy.propertyState || ""}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-slate-500">Rent</p>

                    <p className="mt-1 text-2xl font-bold text-blue-600">
                      {formatMoney(tenancy.rentAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================
                TENANCY DETAILS
            ====================================== */}

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800">
                <FaFileContract className="text-blue-600" />
                Tenancy Details
              </h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* START DATE */}

                <div>
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <FaCalendarAlt />
                    Start Date
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    {formatDate(tenancy.contractStartDate)}
                  </p>
                </div>

                {/* END DATE */}

                <div>
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <FaCalendarAlt />
                    End Date
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    {formatDate(tenancy.contractEndDate)}
                  </p>
                </div>

                {/* RENT */}

                <div>
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <FaMoneyBillWave />
                    Rent
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    {formatMoney(tenancy.rentAmount)}
                  </p>
                </div>

                {/* CONTRACT */}

                <div>
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <FaFileContract />
                    Contract
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    {tenancy.contractEndDate
                      ? "Active Contract"
                      : "Contract Active"}
                  </p>
                </div>
              </div>
            </div>

            {/* ======================================
                LANDLORD INFORMATION
            ====================================== */}

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800">
                <FaUser className="text-blue-600" />
                Landlord Information
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* NAME */}

                <div>
                  <p className="text-sm text-slate-500">Name</p>

                  <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800">
                    <FaUser />
                    {tenancy.landlordName || "Not specified"}
                  </p>
                </div>

                {/* EMAIL */}

                <div>
                  <p className="text-sm text-slate-500">Email</p>

                  <p className="mt-1 flex items-center gap-2 break-all font-semibold text-slate-800">
                    <FaEnvelope />
                    {tenancy.landlordEmail || "Not specified"}
                  </p>
                </div>

                {/* PHONE */}

                {tenancy.landlordPhone && (
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>

                    <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800">
                      <FaPhone />
                      {tenancy.landlordPhone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Tenancy;
