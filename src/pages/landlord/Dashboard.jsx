import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaPlus,
  FaFileAlt,
  FaArrowRight,
  FaHome,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { collection, getDocs, query, where } from "firebase/firestore";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firestore";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD LANDLORD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.uid) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        // =================================================
        // GET LANDLORD PROPERTIES
        // =================================================

        const propertiesQuery = query(
          collection(db, "properties"),
          where("ownerId", "==", user.uid),
        );

        const propertiesSnapshot = await getDocs(propertiesQuery);

        const landlordProperties = propertiesSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setProperties(landlordProperties);

        // =================================================
        // GET LANDLORD APPLICATIONS
        // =================================================

        const applicationsQuery = query(
          collection(db, "applications"),
          where("landlordId", "==", user.uid),
        );

        const applicationsSnapshot = await getDocs(applicationsQuery);

        const landlordApplications = applicationsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setApplications(landlordApplications);

        // =================================================
        // GET LANDLORD PAYMENTS
        // =================================================

        const paymentsQuery = query(
          collection(db, "payments"),
          where("landlordId", "==", user.uid),
        );

        const paymentsSnapshot = await getDocs(paymentsQuery);

        const landlordPayments = paymentsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setPayments(landlordPayments);
      } catch (err) {
        console.error("Landlord dashboard error:", err);

        setError("Unable to load your dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  // =====================================================
  // TOTAL PROPERTIES
  // =====================================================

  const totalProperties = properties.length;

  // =====================================================
  // OCCUPIED PROPERTIES
  // =====================================================

  const occupiedProperties = properties.filter(
    (property) => property.tenantId || property.status === "occupied",
  );

  const occupiedUnits = occupiedProperties.length;

  // =====================================================
  // PENDING APPLICATIONS
  // =====================================================

  const pendingApplications = applications.filter(
    (application) => application.status?.toLowerCase() === "pending",
  ).length;

  // =====================================================
  // MONTHLY REVENUE
  // =====================================================

  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyRevenue = payments
    .filter((payment) => {
      const status = payment.status?.toLowerCase();

      if (
        status !== "paid" &&
        status !== "successful" &&
        status !== "completed"
      ) {
        return false;
      }

      const paymentDate =
        payment.paidAt || payment.createdAt || payment.paymentDate;

      if (!paymentDate) {
        return false;
      }

      let date;

      if (typeof paymentDate.toDate === "function") {
        date = paymentDate.toDate();
      } else {
        date = new Date(paymentDate);
      }

      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    })
    .reduce((total, payment) => {
      return (
        total +
        Number(payment.amount || payment.totalAmount || payment.rentAmount || 0)
      );
    }, 0);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // =====================================================
  // PROPERTY STATUS
  // =====================================================

  function getPropertyStatus(property) {
    if (property.tenantId || property.status === "occupied") {
      return "Occupied";
    }

    if (property.status === "available") {
      return "Vacant";
    }

    if (property.approvalStatus === "pending") {
      return "Pending";
    }

    if (property.approvalStatus === "rejected") {
      return "Rejected";
    }

    return property.status || "Unknown";
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  function getStatusClass(status) {
    switch (status.toLowerCase()) {
      case "occupied":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";

      case "vacant":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";

      case "pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";

      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  }

  // =====================================================
  // APPROVED PROPERTIES
  // =====================================================

  const approvedProperties = properties.filter(
    (property) => property.approvalStatus === "approved",
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="text-center"
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading dashboard...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="mx-auto max-w-7xl"
      >
        {/* =================================================
            WELCOME
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: -15,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:flex">
              <FaHome />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Welcome back, {user?.fullName?.split(" ")[0] || "Landlord"} 👋
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                Here's an overview of your properties and rental business.
              </p>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <FaExclamationTriangle className="mt-0.5 shrink-0" />

              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STATS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            title="Total Properties"
            value={totalProperties}
            icon={<FaBuilding />}
            color="bg-blue-600"
          />

          <StatCard
            title="Occupied Units"
            value={occupiedUnits}
            icon={<FaUsers />}
            color="bg-green-600"
          />

          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyRevenue)}
            icon={<FaMoneyBillWave />}
            color="bg-yellow-500"
          />

          <StatCard
            title="Pending Applications"
            value={pendingApplications}
            icon={<FaClipboardCheck />}
            color="bg-purple-600"
          />
        </motion.div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* =================================================
              PROPERTY SUMMARY
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:col-span-2"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                  Property Summary
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  Your latest approved properties.
                </p>
              </div>

              <Link
                to="/landlord/my-properties"
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sm:text-sm"
              >
                View All
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            {/* ONLY APPROVED PROPERTIES */}

            {approvedProperties.length === 0 ? (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="rounded-xl border border-dashed border-slate-300 p-7 text-center dark:border-slate-700 sm:p-8"
              >
                <FaBuilding className="mx-auto mb-3 text-3xl text-slate-300 dark:text-slate-600" />

                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                  No approved properties yet
                </h3>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                  Properties will appear here after they have been approved by
                  the administrator.
                </p>

                <motion.div
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="mt-4 inline-block"
                >
                  <Link
                    to="/landlord/add-property"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <FaPlus />
                    Add Property
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {approvedProperties.slice(0, 2).map((property, index) => {
                  const status = getPropertyStatus(property);

                  return (
                    <motion.div
                      key={property.id}
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      whileHover={{
                        y: -2,
                      }}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* PROPERTY INFORMATION */}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                          {property.title ||
                            property.name ||
                            "Untitled Property"}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                          {[property.city, property.state]
                            .filter(Boolean)
                            .join(", ") || "Location not specified"}
                        </p>

                        {property.price && (
                          <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 sm:text-sm">
                            {formatCurrency(Number(property.price))}
                          </p>
                        )}
                      </div>

                      {/* PROPERTY STATUS */}

                      <span
                        className={`self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${getStatusClass(
                          status,
                        )}`}
                      >
                        {status}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
              Quick Actions
            </h2>

            <div className="space-y-3">
              {/* ADD PROPERTY */}

              <ActionButton
                onClick={() => navigate("/landlord/add-property")}
                icon={<FaPlus />}
                variant="primary"
              >
                Add Property
              </ActionButton>

              {/* APPLICATIONS */}

              <ActionButton
                onClick={() => navigate("/landlord/applications")}
                icon={<FaClipboardCheck />}
              >
                View Applications
              </ActionButton>

              {/* DOCUMENTS */}

              <ActionButton
                onClick={() => navigate("/landlord/documents")}
                icon={<FaFileAlt />}
              >
                Upload Documents
              </ActionButton>
            </div>

            {/* APPLICATION SUMMARY */}

            <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FaClipboardCheck className="text-purple-500" />

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Pending Applications
                  </span>
                </div>

                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {pendingApplications}
                </span>
              </div>

              {pendingApplications > 0 && (
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  You have applications waiting for your review.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* =================================================
            PROPERTY BREAKDOWN
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="mt-6 grid gap-4 sm:grid-cols-3"
        >
          {/* TOTAL */}

          <BreakdownCard
            title="Total Properties"
            value={totalProperties}
            icon={<FaBuilding />}
            iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />

          {/* OCCUPIED */}

          <BreakdownCard
            title="Occupied"
            value={occupiedUnits}
            icon={<FaUsers />}
            iconClassName="bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
          />

          {/* VACANT */}

          <BreakdownCard
            title="Vacant"
            value={Math.max(totalProperties - occupiedUnits, 0)}
            icon={<FaHome />}
            iconClassName="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
          />
        </motion.div>

        {/* =================================================
            BUSINESS OVERVIEW
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Rental Business Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Keep track of your property portfolio and tenant activity.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <FaCheckCircle />
              RentEase is managing your portfolio
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <OverviewItem label="Approved" value={approvedProperties.length} />

            <OverviewItem label="Occupied" value={occupiedUnits} />

            <OverviewItem
              label="Pending Applications"
              value={pendingApplications}
            />
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

// =====================================================
// ACTION BUTTON
// =====================================================

function ActionButton({ children, onClick, icon, variant = "secondary" }) {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.97,
      }}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        isPrimary
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      {icon}

      {children}
    </motion.button>
  );
}

// =====================================================
// BREAKDOWN CARD
// =====================================================

function BreakdownCard({ title, value, icon, iconClassName }) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// OVERVIEW ITEM
// =====================================================

function OverviewItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default Dashboard;
