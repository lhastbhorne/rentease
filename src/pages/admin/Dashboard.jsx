import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  FaUsers,
  FaBuilding,
  FaClipboardCheck,
  FaHome,
  FaClock,
  FaMoneyBillWave,
  FaReceipt,
  FaChartLine,
  FaUserTie,
  FaCalendarAlt,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getAllUsers,
  getAllAdminProperties,
} from "../../firebase/adminService";

import { getAllPayments } from "../../firebase/paymentService";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  try {
    const value =
      typeof date?.toDate === "function" ? date.toDate() : new Date(date);

    if (Number.isNaN(value.getTime())) return "—";

    return value.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const getPaymentDate = (payment) => {
  if (!payment?.createdAt) return 0;

  if (typeof payment.createdAt.toMillis === "function") {
    return payment.createdAt.toMillis();
  }

  if (payment.createdAt instanceof Date) {
    return payment.createdAt.getTime();
  }

  if (typeof payment.createdAt === "number") {
    return payment.createdAt;
  }

  return 0;
};

const formatFrequency = (frequency = "") => {
  const labels = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    half_yearly: "Half-Yearly",
    annual: "Annual",
  };

  return labels[frequency] || frequency?.replace(/_/g, " ") || "—";
};

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    tenants: 0,
    landlords: 0,
    agents: 0,
    properties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    occupiedProperties: 0,

    totalRentCollected: 0,
    totalPlatformFees: 0,
    totalManagerEarnings: 0,
    successfulRentPayments: 0,
  });

  const [recentPayments, setRecentPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [users, properties, payments] = await Promise.all([
          getAllUsers(),
          getAllAdminProperties(),
          getAllPayments(),
        ]);

        // =================================================
        // USER STATS
        // =================================================

        const tenants = users.filter((item) => item.role === "tenant").length;

        const landlords = users.filter(
          (item) => item.role === "landlord",
        ).length;

        const agents = users.filter((item) => item.role === "agent").length;

        // Admin accounts are NOT included.
        const totalUsers = tenants + landlords + agents;

        // =================================================
        // PROPERTY STATS
        // =================================================

        const pendingProperties = properties.filter(
          (item) => item.approvalStatus === "pending",
        ).length;

        const approvedProperties = properties.filter(
          (item) => item.approvalStatus === "approved",
        ).length;

        const occupiedProperties = properties.filter(
          (item) => item.status === "occupied",
        ).length;

        // =================================================
        // FINANCIAL STATS
        // =================================================

        const successfulRentPayments = payments.filter(
          (payment) =>
            payment.status === "successful" &&
            (payment.paymentType === "rent" || payment.type === "rent"),
        );

        const totalRentCollected = successfulRentPayments.reduce(
          (sum, payment) =>
            sum + Number(payment.grossAmount || payment.amount || 0),
          0,
        );

        const totalPlatformFees = successfulRentPayments.reduce(
          (sum, payment) =>
            sum + Number(payment.platformFee || payment.rentEaseFee || 0),
          0,
        );

        const totalManagerEarnings = successfulRentPayments.reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.managerAmount ||
                payment.recipientAmount ||
                payment.netAmount ||
                payment.amountAfterFee ||
                0,
            ),
          0,
        );

        // =================================================
        // RECENT PAYMENTS
        // =================================================

        const sortedRecentPayments = [...successfulRentPayments]
          .sort((a, b) => getPaymentDate(b) - getPaymentDate(a))
          .slice(0, 5);

        setRecentPayments(sortedRecentPayments);

        // =================================================
        // SET STATS
        // =================================================

        setStats({
          users: totalUsers,
          tenants,
          landlords,
          agents,
          properties: properties.length,
          pendingProperties,
          approvedProperties,
          occupiedProperties,

          totalRentCollected,
          totalPlatformFees,
          totalManagerEarnings,
          successfulRentPayments: successfulRentPayments.length,
        });
      } catch (error) {
        console.error("Error loading admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // =====================================================
  // MAIN STATISTIC CARDS
  // =====================================================

  const cards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: <FaUsers />,
      bg: "bg-blue-100 dark:bg-blue-950/50",
      text: "text-blue-600 dark:text-blue-400",
    },

    {
      title: "Total Properties",
      value: stats.properties,
      icon: <FaBuilding />,
      bg: "bg-purple-100 dark:bg-purple-950/50",
      text: "text-purple-600 dark:text-purple-400",
    },

    {
      title: "Pending Verification",
      value: stats.pendingProperties,
      icon: <FaClipboardCheck />,
      bg: "bg-yellow-100 dark:bg-yellow-950/50",
      text: "text-yellow-600 dark:text-yellow-400",
    },

    {
      title: "Occupied Properties",
      value: stats.occupiedProperties,
      icon: <FaHome />,
      bg: "bg-green-100 dark:bg-green-950/50",
      text: "text-green-600 dark:text-green-400",
    },
  ];

  // =====================================================
  // FINANCIAL CARDS
  // =====================================================

  const financialCards = [
    {
      title: "Total Rent Collected",
      value: formatCurrency(stats.totalRentCollected),
      icon: <FaMoneyBillWave />,
      bg: "bg-emerald-100 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
    },

    {
      title: "RentEase Revenue",
      value: formatCurrency(stats.totalPlatformFees),
      icon: <FaChartLine />,
      bg: "bg-indigo-100 dark:bg-indigo-950/40",
      text: "text-indigo-600 dark:text-indigo-400",
    },

    {
      title: "Manager Earnings",
      value: formatCurrency(stats.totalManagerEarnings),
      icon: <FaUserTie />,
      bg: "bg-orange-100 dark:bg-orange-950/40",
      text: "text-orange-600 dark:text-orange-400",
    },

    {
      title: "Successful Rent Payments",
      value: stats.successfulRentPayments,
      icon: <FaReceipt />,
      bg: "bg-cyan-100 dark:bg-cyan-950/40",
      text: "text-cyan-600 dark:text-cyan-400",
    },
  ];

  // =====================================================
  // FRAMER MOTION
  // =====================================================

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 25,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.96,
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <DashboardLayout>
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div variants={itemVariants} className="mb-8">
          <motion.h1
            className="text-3xl font-bold text-slate-800 dark:text-white"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Admin Dashboard
          </motion.h1>

          <motion.p
            className="mt-2 text-slate-500 dark:text-slate-400"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
            }}
          >
            Welcome back,{" "}
            {user?.fullName || user?.displayName || "Administrator"}. Manage the
            RentEase platform from here.
          </motion.p>
        </motion.div>

        {/* =================================================
            MAIN STATISTICS
        ================================================= */}

        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={{
                y: -6,
                scale: 1.02,
                transition: {
                  duration: 0.2,
                },
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-6
                shadow-sm
                transition-colors duration-300
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>

                  <motion.h2
                    className="mt-2 text-3xl font-bold text-slate-800 dark:text-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.25,
                    }}
                  >
                    {loading ? "..." : card.value}
                  </motion.h2>
                </div>

                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.text}`}
                >
                  {card.icon}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* =================================================
            FINANCIAL OVERVIEW
        ================================================= */}

        <motion.div variants={itemVariants} className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Financial Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Platform-wide rental payment and earnings overview.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
          >
            {financialCards.map((card) => (
              <motion.div
                key={card.title}
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
                className="
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-colors duration-300
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {card.title}
                    </p>

                    <h3 className="mt-2 truncate text-xl font-bold text-slate-800 dark:text-white sm:text-2xl">
                      {loading ? "..." : card.value}
                    </h3>
                  </div>

                  <div
                    className={`ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.text}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* =================================================
            RECENT RENT TRANSACTIONS
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="
            mt-8
            rounded-2xl
            border border-slate-200
            bg-white
            p-6
            shadow-sm
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Recent Rent Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest successful rental payments across the platform.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <FaCalendarAlt />
              Latest 5
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center dark:bg-slate-800">
                <FaReceipt className="mx-auto mb-3 text-3xl text-slate-300 dark:text-slate-600" />

                <p className="font-medium text-slate-700 dark:text-slate-200">
                  No successful rent payments yet.
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Successful rental transactions will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment, index) => {
                  const grossAmount = Number(
                    payment.grossAmount || payment.amount || 0,
                  );

                  const platformFee = Number(
                    payment.platformFee || payment.rentEaseFee || 0,
                  );

                  const managerAmount = Number(
                    payment.managerAmount ||
                      payment.recipientAmount ||
                      payment.netAmount ||
                      payment.amountAfterFee ||
                      Math.max(grossAmount - platformFee, 0),
                  );

                  return (
                    <motion.div
                      key={
                        payment.id ||
                        payment.paymentReference ||
                        payment.reference ||
                        index
                      }
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="
                        rounded-xl
                        border border-slate-100
                        bg-slate-50
                        p-4
                        transition-colors
                        dark:border-slate-800
                        dark:bg-slate-800/60
                      "
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Property + Tenant */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="hidden rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 sm:block">
                              <FaBuilding />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                                {payment.propertyTitle || "Rental Property"}
                              </h3>

                              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                  Tenant: {payment.tenantName || "Tenant"}
                                </span>

                                {payment.managerName && (
                                  <>
                                    <span>•</span>
                                    <span>Manager: {payment.managerName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rent Payment Number */}
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Rent Payment
                          </p>

                          <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                            #{payment.rentPaymentNumber || "—"}
                          </p>
                        </div>

                        {/* Gross */}
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Gross
                          </p>

                          <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(grossAmount)}
                          </p>
                        </div>

                        {/* RentEase */}
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            RentEase 5%
                          </p>

                          <p className="mt-1 font-semibold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(platformFee)}
                          </p>
                        </div>

                        {/* Manager */}
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Manager Net
                          </p>

                          <p className="mt-1 font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(managerAmount)}
                          </p>
                        </div>

                        {/* Date */}
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                            {formatDate(payment.createdAt || payment.paidAt)}
                          </p>
                        </div>
                      </div>

                      {/* Period + Reference */}
                      <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                          Rent Period:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {payment.rentPeriodStart && payment.rentPeriodEnd
                              ? `${formatDate(
                                  payment.rentPeriodStart,
                                )} → ${formatDate(payment.rentPeriodEnd)}`
                              : "—"}
                          </span>
                        </span>

                        <span>
                          Frequency:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {formatFrequency(payment.rentFrequency)}
                          </span>
                        </span>

                        <span>
                          Reference:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {payment.paymentReference ||
                              payment.reference ||
                              payment.transactionReference ||
                              "—"}
                          </span>
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* =================================================
            USER + PROPERTY OVERVIEW
        ================================================= */}

        <motion.div
          variants={containerVariants}
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          {/* USER OVERVIEW */}

          <motion.div
            variants={itemVariants}
            whileHover={{
              y: -3,
              transition: {
                duration: 0.2,
              },
            }}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-6
              shadow-sm
              transition-colors duration-300
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              User Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Complete breakdown of registered platform users.
            </p>

            <motion.div variants={containerVariants} className="mt-6 space-y-4">
              {/* TENANTS */}

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="
                  flex items-center justify-between
                  rounded-xl
                  bg-slate-50
                  p-4
                  dark:bg-slate-800
                "
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Tenants
                </span>

                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {loading ? "..." : stats.tenants}
                </span>
              </motion.div>

              {/* LANDLORDS */}

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="
                  flex items-center justify-between
                  rounded-xl
                  bg-slate-50
                  p-4
                  dark:bg-slate-800
                "
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Landlords
                </span>

                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {loading ? "..." : stats.landlords}
                </span>
              </motion.div>

              {/* AGENTS */}

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="
                  flex items-center justify-between
                  rounded-xl
                  bg-slate-50
                  p-4
                  dark:bg-slate-800
                "
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Agents
                </span>

                <span className="font-bold text-green-600 dark:text-green-400">
                  {loading ? "..." : stats.agents}
                </span>
              </motion.div>

              {/* TOTAL */}

              <motion.div
                variants={itemVariants}
                whileHover={{
                  scale: 1.01,
                  x: 4,
                }}
                className="
                  flex items-center justify-between
                  rounded-xl
                  border border-blue-100
                  bg-blue-50
                  p-4
                  dark:border-blue-900/50
                  dark:bg-blue-950/30
                "
              >
                <span className="font-semibold text-slate-800 dark:text-white">
                  Total Platform Users
                </span>

                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {loading ? "..." : stats.users}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* PROPERTY OVERVIEW */}

          <motion.div
            variants={itemVariants}
            whileHover={{
              y: -3,
              transition: {
                duration: 0.2,
              },
            }}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-6
              shadow-sm
              transition-colors duration-300
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Property Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Current property verification and occupancy status.
            </p>

            <motion.div variants={containerVariants} className="mt-6 space-y-4">
              {/* PENDING */}

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="
                  flex items-center justify-between
                  rounded-xl
                  bg-yellow-50
                  p-4
                  dark:bg-yellow-950/30
                "
              >
                <div className="flex items-center gap-3">
                  <FaClock className="text-yellow-600 dark:text-yellow-400" />

                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Awaiting Verification
                  </span>
                </div>

                <span className="font-bold text-yellow-600 dark:text-yellow-400">
                  {loading ? "..." : stats.pendingProperties}
                </span>
              </motion.div>

              {/* APPROVED */}

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="
                  flex items-center justify-between
                  rounded-xl
                  bg-green-50
                  p-4
                  dark:bg-green-950/30
                "
              >
                <div className="flex items-center gap-3">
                  <FaClipboardCheck className="text-green-600 dark:text-green-400" />

                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Approved
                  </span>
                </div>

                <span className="font-bold text-green-600 dark:text-green-400">
                  {loading ? "..." : stats.approvedProperties}
                </span>
              </motion.div>

              {/* OCCUPIED */}

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="
                  flex items-center justify-between
                  rounded-xl
                  bg-blue-50
                  p-4
                  dark:bg-blue-950/30
                "
              >
                <div className="flex items-center gap-3">
                  <FaHome className="text-blue-600 dark:text-blue-400" />

                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Occupied
                  </span>
                </div>

                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {loading ? "..." : stats.occupiedProperties}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* =================================================
            ADMIN ACTIONS
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="
            mt-8
            rounded-2xl
            border border-slate-200
            bg-white
            p-6
            shadow-sm
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Administration
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage the most important parts of the RentEase platform.
          </p>

          <motion.div
            variants={containerVariants}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* USERS */}

            <motion.a
              href="/admin/users"
              variants={itemVariants}
              whileHover={{
                y: -5,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
                rounded-xl
                border border-slate-200
                p-5
                transition-colors
                hover:border-blue-300
                hover:bg-blue-50
                dark:border-slate-700
                dark:hover:border-blue-700
                dark:hover:bg-blue-950/30
              "
            >
              <motion.div
                whileHover={{
                  scale: 1.15,
                  rotate: 5,
                }}
              >
                <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
              </motion.div>

              <h3 className="mt-3 font-bold text-slate-800 dark:text-white">
                Manage Users
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                View registered tenants, landlords and agents.
              </p>
            </motion.a>

            {/* PROPERTIES */}

            <motion.a
              href="/admin/properties"
              variants={itemVariants}
              whileHover={{
                y: -5,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
                rounded-xl
                border border-slate-200
                p-5
                transition-colors
                hover:border-purple-300
                hover:bg-purple-50
                dark:border-slate-700
                dark:hover:border-purple-700
                dark:hover:bg-purple-950/30
              "
            >
              <motion.div
                whileHover={{
                  scale: 1.15,
                  rotate: -5,
                }}
              >
                <FaBuilding className="text-2xl text-purple-600 dark:text-purple-400" />
              </motion.div>

              <h3 className="mt-3 font-bold text-slate-800 dark:text-white">
                Manage Properties
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                View and manage all properties.
              </p>
            </motion.a>

            {/* VERIFICATION */}

            <motion.a
              href="/admin/verification"
              variants={itemVariants}
              whileHover={{
                y: -5,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
                rounded-xl
                border border-slate-200
                p-5
                transition-colors
                hover:border-green-300
                hover:bg-green-50
                dark:border-slate-700
                dark:hover:border-green-700
                dark:hover:bg-green-950/30
              "
            >
              <motion.div
                whileHover={{
                  scale: 1.15,
                  rotate: 5,
                }}
              >
                <FaClipboardCheck className="text-2xl text-green-600 dark:text-green-400" />
              </motion.div>

              <h3 className="mt-3 font-bold text-slate-800 dark:text-white">
                Property Verification
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review pending property submissions.
              </p>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

export default Dashboard;
