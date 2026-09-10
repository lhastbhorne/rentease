import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHome,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileContract,
  FaExclamationCircle,
  FaEnvelope,
  FaFlag,
  FaCheckCircle,
  FaBuilding,
} from "react-icons/fa";

import { motion } from "framer-motion";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTenancies } from "../../firebase/tenancyService";

function MyRental() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ALL ACTIVE RENTALS
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
         * A rental is considered active only when:
         *
         * status === "active"
         *
         * AND
         *
         * paymentStatus === "paid"
         * OR
         * paymentStatus === "successful"
         *
         * Approval alone does NOT make a rental active.
         */

        const activeTenancies = Array.isArray(data)
          ? data.filter(
              (tenancy) =>
                tenancy?.status === "active" &&
                (tenancy?.paymentStatus === "paid" ||
                  tenancy?.paymentStatus === "successful"),
            )
          : [];

        setTenancies(activeTenancies);
      } catch (err) {
        console.error("Error loading rentals:", err);

        setError("Unable to load your rental information.");
        setTenancies([]);
      } finally {
        setLoading(false);
      }
    }

    loadTenancies();
  }, [user?.uid]);

  // ==========================================
  // REPORT MANAGER
  // ==========================================

  function handleReportManager(tenancy) {
    if (!tenancy?.managerId) {
      console.error("No property manager found for this tenancy.");
      return;
    }

    navigate("/tenant/report", {
      state: {
        reportedUser: {
          id: tenancy.managerId,
          fullName: tenancy.managerName || "",
          email: tenancy.managerEmail || "",
          role: tenancy.managerRole || "landlord",
        },

        property: {
          id: tenancy.propertyId || "",
          title: tenancy.propertyTitle || "Rental Property",
        },

        tenancyId: tenancy.id,
      },
    });
  }

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  function formatMoney(value) {
    return `₦${Number(value || 0).toLocaleString("en-NG")}`;
  }

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
  // GET MANAGER ROLE
  // ==========================================

  function getManagerRole(tenancy) {
    return tenancy?.managerRole === "agent" ? "Managing Agent" : "Landlord";
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
              Loading your rentals...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // NO ACTIVE RENTALS
  // ==========================================

  if (tenancies.length === 0) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {/* ICON */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FaHome size={28} />
            </div>

            {/* HEADING */}

            <h1 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
              You Don't Have an Active Rental
            </h1>

            {/* DESCRIPTION */}

            <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
              You will see your rentals here after your applications have been
              approved, your rent payments have been successfully verified, and
              your tenancies have been activated.
            </p>

            {/* RENTAL PROCESS */}

            <div className="mx-auto mt-7 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-5 text-left dark:border-slate-800 dark:bg-slate-950">
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Rental Process
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    1
                  </span>

                  <span className="text-slate-600 dark:text-slate-300">
                    Submit an application
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    2
                  </span>

                  <span className="text-slate-600 dark:text-slate-300">
                    Landlord or agent approves
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                    3
                  </span>

                  <span className="text-slate-600 dark:text-slate-300">
                    Property is temporarily reserved
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                    4
                  </span>

                  <span className="text-slate-600 dark:text-slate-300">
                    Complete rent payment within 7 days
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600 dark:bg-green-950/50 dark:text-green-400">
                    5
                  </span>

                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Rental becomes active
                  </span>
                </div>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* BROWSE */}

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="mt-7 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // ACTIVE RENTALS
  // ==========================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* ======================================
            HEADER
        ====================================== */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                My Rentals
              </h1>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Manage your active rentals and tenancy information.
              </p>
            </div>

            {/* RENT COUNT */}

            <span className="flex w-fit items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              <FaBuilding />
              {tenancies.length}{" "}
              {tenancies.length === 1 ? "Active Rental" : "Active Rentals"}
            </span>
          </div>
        </motion.div>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ======================================
            ALL ACTIVE RENTALS
        ====================================== */}

        <div className="space-y-10">
          {tenancies.map((tenancy, index) => {
            const managerRole = getManagerRole(tenancy);
            const managerName = getManagerName(tenancy);

            return (
              <motion.div
                key={tenancy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                className="space-y-6"
              >
                {/* ==================================
                    RENTAL HEADER
                ================================== */}

                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
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

                  <span className="flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    <FaCheckCircle />
                    Active
                  </span>
                </div>

                {/* ==================================
                    PAYMENT CONFIRMED
                ================================== */}

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20"
                >
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="mt-1 shrink-0 text-green-600 dark:text-green-400" />

                    <div>
                      <h2 className="font-semibold text-green-800 dark:text-green-300">
                        Payment Confirmed
                      </h2>

                      <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                        Your rent payment has been successfully verified and
                        this rental is now active.
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
                </motion.div>

                {/* ==================================
                    RENTAL STATUS
                ================================== */}

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Rental Status
                    </p>

                    <p className="mt-1 text-lg font-semibold capitalize text-slate-800 dark:text-white">
                      {tenancy.status || "Active"}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold capitalize text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    Active
                  </span>
                </motion.div>

                {/* ==================================
                    PROPERTY
                ================================== */}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="grid lg:grid-cols-2">
                    {/* PROPERTY IMAGE */}

                    <div className="min-h-[320px] bg-slate-100 dark:bg-slate-800">
                      {tenancy.propertyImage ? (
                        <img
                          src={tenancy.propertyImage}
                          alt={tenancy.propertyTitle || "Rental property"}
                          className="h-full min-h-[320px] w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full min-h-[320px] items-center justify-center text-slate-400 dark:text-slate-600">
                          <FaHome size={60} />
                        </div>
                      )}
                    </div>

                    {/* PROPERTY INFORMATION */}

                    <div className="p-8">
                      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                        Active Rental
                      </p>

                      <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                        {tenancy.propertyTitle || "Rental Property"}
                      </h2>

                      <div className="mt-6 space-y-5">
                        {/* PROPERTY */}

                        <div className="flex items-start gap-3">
                          <FaHome className="mt-1 text-blue-600 dark:text-blue-400" />

                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Property
                            </p>

                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {tenancy.propertyTitle || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* LOCATION */}

                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="mt-1 text-blue-600 dark:text-blue-400" />

                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Location
                            </p>

                            <p className="font-medium text-slate-800 dark:text-slate-200">
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
                          <div className="flex items-start gap-3">
                            <FaHome className="mt-1 text-indigo-600 dark:text-indigo-400" />

                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Address
                              </p>

                              <p className="font-medium text-slate-800 dark:text-slate-200">
                                {tenancy.propertyAddress}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* RENT */}

                        <div className="flex items-start gap-3">
                          <FaMoneyBillWave className="mt-1 text-green-600 dark:text-green-400" />

                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Rent Paid
                            </p>

                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {formatMoney(tenancy.rentAmount)}
                            </p>
                          </div>
                        </div>

                        {/* MOVE-IN */}

                        <div className="flex items-start gap-3">
                          <FaCalendarAlt className="mt-1 text-purple-600 dark:text-purple-400" />

                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Move-in Date
                            </p>

                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {formatDate(tenancy.moveInDate)}
                            </p>
                          </div>
                        </div>

                        {/* TENANT */}

                        <div className="flex items-start gap-3">
                          <FaUser className="mt-1 text-orange-600 dark:text-orange-400" />

                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Tenant
                            </p>

                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {tenancy.tenantName || user?.fullName || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* MANAGER */}

                        <div className="flex items-start gap-3">
                          <FaUser className="mt-1 text-indigo-600 dark:text-indigo-400" />

                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {managerRole}
                            </p>

                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {managerName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ==================================
                    TENANCY INFORMATION
                ================================== */}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white">
                    Tenancy Information
                  </h2>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* CONTRACT START */}

                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Contract Start
                      </p>

                      <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                        {formatDate(tenancy.contractStartDate)}
                      </p>
                    </div>

                    {/* CONTRACT END */}

                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Contract End
                      </p>

                      <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                        {formatDate(tenancy.contractEndDate)}
                      </p>
                    </div>

                    {/* LEASE DURATION */}

                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Lease Duration
                      </p>

                      <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                        {tenancy.leaseDuration || "12 Months"}
                      </p>
                    </div>

                    {/* PAYMENT */}

                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Initial Rent Payment
                      </p>

                      <p className="mt-1 font-semibold capitalize text-green-600 dark:text-green-400">
                        {tenancy.paymentStatus === "successful"
                          ? "Successful"
                          : tenancy.paymentStatus || "Paid"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ==================================
                    RENTAL SERVICES
                ================================== */}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white">
                    Rental Services
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* CONTRACT */}

                    <motion.button
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/tenant/contract", {
                          state: {
                            tenancyId: tenancy.id,
                            propertyId: tenancy.propertyId,
                          },
                        })
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-colors duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <FaFileContract
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                      />

                      <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
                        Rental Contract
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        View or download the contract for this rental.
                      </p>
                    </motion.button>

                    {/* PAYMENTS */}

                    <motion.button
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/tenant/payments", {
                          state: {
                            tenancyId: tenancy.id,
                            propertyId: tenancy.propertyId,
                          },
                        })
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-colors duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <FaMoneyBillWave
                        size={24}
                        className="text-green-600 dark:text-green-400"
                      />

                      <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
                        Rent Payments
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        View payment details and payment history.
                      </p>
                    </motion.button>

                    {/* COMPLAINTS */}

                    <motion.button
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/tenant/complaints", {
                          state: {
                            tenancyId: tenancy.id,
                            propertyId: tenancy.propertyId,
                          },
                        })
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-colors duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <FaExclamationCircle
                        size={24}
                        className="text-orange-600 dark:text-orange-400"
                      />

                      <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
                        Lodge Complaint
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Report an issue with this rental.
                      </p>
                    </motion.button>

                    {/* MESSAGES */}

                    <motion.button
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/tenant/messages", {
                          state: {
                            tenancyId: tenancy.id,
                            managerId: tenancy.managerId,
                            propertyId: tenancy.propertyId,
                          },
                        })
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-colors duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <FaEnvelope
                        size={24}
                        className="text-purple-600 dark:text-purple-400"
                      />

                      <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
                        Message Manager
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Contact the landlord or managing agent.
                      </p>
                    </motion.button>

                    {/* REPORT MANAGER */}

                    <motion.button
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReportManager(tenancy)}
                      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-left shadow-sm transition-colors duration-300 hover:shadow-md dark:border-red-900/50 dark:bg-red-950/20"
                    >
                      <FaFlag
                        size={24}
                        className="text-red-600 dark:text-red-400"
                      />

                      <h3 className="mt-4 font-semibold text-red-800 dark:text-red-300">
                        Report{" "}
                        {managerRole === "Managing Agent"
                          ? "Agent"
                          : "Landlord"}
                      </h3>

                      <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                        Report an issue concerning this property manager.
                      </p>
                    </motion.button>
                  </div>
                </motion.div>

                {/* ==================================
                    SEPARATOR BETWEEN RENTALS
                ================================== */}

                {index < tenancies.length - 1 && (
                  <div className="pt-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-800" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyRental;
