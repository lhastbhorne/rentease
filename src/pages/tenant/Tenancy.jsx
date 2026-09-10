import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaFileContract,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaBuilding,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTenancies } from "../../firebase/tenancyService";

function Tenancy() {
  const { user } = useAuth();

  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ALL ACTIVE TENANCIES
  // ==========================================

  useEffect(() => {
    async function loadTenancies() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyTenancies(user.uid);

        /*
         * getMyTenancies() returns an array.
         *
         * Every tenancy must already satisfy:
         *
         * status === "active"
         * AND
         * paymentStatus === "paid"
         *
         * This means approval alone cannot make
         * a tenancy appear here.
         */

     const activeTenancies = Array.isArray(data)
  ? data.filter(
      (tenancy) =>
        tenancy?.status === "active" &&
        (tenancy?.paymentStatus === "successful" ||
          tenancy?.paymentStatus === "paid"),
    )
  : [];

        setTenancies(activeTenancies);
      } catch (err) {
        console.error("Error loading tenancies:", err);

        setError("Unable to load your tenancy information.");
        setTenancies([]);
      } finally {
        setLoading(false);
      }
    }

    loadTenancies();
  }, [user?.uid]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(value) {
    if (!value) {
      return "Not specified";
    }

    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleDateString("en-NG", {
        dateStyle: "medium",
      });
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleDateString("en-NG", {
      dateStyle: "medium",
    });
  }

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  function formatMoney(value) {
    const amount = Number(value || 0);

    return `₦${amount.toLocaleString("en-NG")}`;
  }

  // ==========================================
  // GET MANAGER ROLE
  // ==========================================

  function getManagerRole(tenancy) {
    if (tenancy?.managerRole === "agent") {
      return "Managing Agent";
    }

    return "Landlord";
  }

  // ==========================================
  // GET MANAGER NAME
  // ==========================================

  function getManagerName(tenancy) {
    return (
      tenancy?.managerName ||
      tenancy?.landlordName ||
      (tenancy?.managerRole === "agent" ? "Managing Agent" : "Landlord")
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Loading tenancy information...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* ========================================
            HEADER
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                My Tenancy
              </h1>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                View your active rentals and tenancy information.
              </p>
            </div>

            {tenancies.length > 0 && (
              <div className="flex w-fit items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                <FaBuilding />
                {tenancies.length}{" "}
                {tenancies.length === 1 ? "Active Rental" : "Active Rentals"}
              </div>
            )}
          </div>
        </motion.div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* ========================================
            NO ACTIVE TENANCY
        ======================================== */}

        {tenancies.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FaHome className="text-2xl" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
              No Active Tenancy
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-slate-500 dark:text-slate-400">
              You don't currently have an active tenancy. Your tenancy will
              appear here after your rental application has been approved and
              your rent payment has been successfully completed.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Rental process
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <p>1. Application approved</p>
                <p>2. Property temporarily reserved</p>
                <p>3. Complete rent payment</p>
                <p>4. Tenancy becomes active</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================
            ACTIVE TENANCIES
        ======================================== */}

        {tenancies.length > 0 && (
          <div className="space-y-8">
            {tenancies.map((tenancy, index) => {
              const managerRole = getManagerRole(tenancy);
              const managerName = getManagerName(tenancy);

              return (
                <motion.div
                  key={tenancy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.08,
                  }}
                  className="space-y-6"
                >
                  {/* ==================================
                      RENTAL HEADER
                  ================================== */}

                  <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Rental {index + 1}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                        {tenancy.propertyTitle || "Rental Property"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Tenancy ID: {tenancy.id}
                      </p>
                    </div>

                    <span className="flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                      <FaCheckCircle />
                      Active
                    </span>
                  </div>

                  {/* ==================================
                      PAYMENT CONFIRMED
                  ================================== */}

                  <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="mt-1 shrink-0 text-green-600 dark:text-green-400" />

                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-300">
                          Rent Payment Confirmed
                        </h3>

                        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                          Your rent payment has been successfully completed and
                          this tenancy is now active.
                        </p>

                        {tenancy.paymentReference && (
                          <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                            Payment Reference:{" "}
                            <span className="font-semibold">
                              {tenancy.paymentReference}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ==================================
                      PROPERTY
                  ================================== */}

                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                      <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white">
                        <FaHome className="text-blue-600 dark:text-blue-400" />
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
                          className="h-64 w-full rounded-xl object-cover md:h-full md:min-h-[300px]"
                          onError={(event) => {
                            event.currentTarget.src =
                              "https://placehold.co/800x500?text=Property";
                          }}
                        />
                      </div>

                      {/* PROPERTY INFORMATION */}

                      <div className="flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                          {tenancy.propertyTitle || "Rental Property"}
                        </h3>

                        {/* LOCATION */}

                        <div className="mt-5 space-y-3">
                          <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="mt-1 shrink-0 text-blue-600 dark:text-blue-400" />

                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Property Location
                              </p>

                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                                {[
                                  tenancy.propertyAreaName,
                                  tenancy.propertyCity,
                                  tenancy.propertyState,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "Location not specified"}
                              </p>
                            </div>
                          </div>

                          {/* EXACT ADDRESS */}

                          {tenancy.propertyAddress && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Rental Address
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {tenancy.propertyAddress}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* RENT */}

                        <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Rent Amount
                          </p>

                          <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formatMoney(tenancy.rentAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ==================================
                      TENANCY DETAILS
                  ================================== */}

                  <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                    <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white">
                      <FaFileContract className="text-blue-600 dark:text-blue-400" />
                      Tenancy Details
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {/* START DATE */}

                      <div>
                        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <FaCalendarAlt />
                          Start Date
                        </p>

                        <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                          {formatDate(tenancy.contractStartDate)}
                        </p>
                      </div>

                      {/* END DATE */}

                      <div>
                        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <FaCalendarAlt />
                          End Date
                        </p>

                        <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                          {formatDate(tenancy.contractEndDate)}
                        </p>
                      </div>

                      {/* RENT */}

                      <div>
                        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <FaMoneyBillWave />
                          Rent
                        </p>

                        <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                          {formatMoney(tenancy.rentAmount)}
                        </p>
                      </div>

                      {/* PAYMENT */}

                      <div>
                        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <FaCheckCircle />
                          Payment
                        </p>

                        <p className="mt-2 font-semibold capitalize text-green-600 dark:text-green-400">
                          {tenancy.paymentStatus === "successful" ||
                          tenancy.paymentStatus === "paid"
                            ? "Paid"
                            : tenancy.paymentStatus || "Paid"}
                        </p>
                      </div>
                    </div>

                    {/* LEASE DURATION */}

                    {tenancy.leaseDuration && (
                      <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Lease Duration
                        </p>

                        <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                          {tenancy.leaseDuration}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ==================================
                      PROPERTY MANAGER
                  ================================== */}

                  <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                    <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white">
                      <FaUser className="text-blue-600 dark:text-blue-400" />
                      Property Manager
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* NAME */}

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Name
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
                          <FaUser />

                          {managerName}
                        </p>
                      </div>

                      {/* ROLE */}

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Role
                        </p>

                        <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                          {managerRole}
                        </p>
                      </div>

                      {/* EMAIL */}

                      {(tenancy.managerEmail || tenancy.landlordEmail) && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Email
                          </p>

                          <p className="mt-1 flex items-center gap-2 break-all font-semibold text-slate-800 dark:text-white">
                            <FaEnvelope />

                            {tenancy.managerEmail || tenancy.landlordEmail}
                          </p>
                        </div>
                      )}

                      {/* PHONE */}

                      {(tenancy.managerPhone || tenancy.landlordPhone) && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Phone
                          </p>

                          <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
                            <FaPhone />

                            {tenancy.managerPhone || tenancy.landlordPhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Tenancy;
