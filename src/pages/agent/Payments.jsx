import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBuilding,
  FaUser,
  FaReceipt,
  FaCalendarAlt,
  FaHome,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getAgentPayments } from "../../firebase/paymentService";

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

const formatRentPeriod = (start, end) => {
  if (!start && !end) return null;

  if (start && end) {
    return `${formatDate(start)} → ${formatDate(end)}`;
  }

  if (start) return `From ${formatDate(start)}`;
  if (end) return `Until ${formatDate(end)}`;

  return null;
};

const formatPaymentType = (type = "") => {
  const labels = {
    rent: "Rent",
    inspection: "Inspection",
    platform_fee: "Platform Fee",
    settlement: "Settlement",
    refund: "Refund",
  };

  return labels[type] || type?.replace(/_/g, " ") || "Payment";
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

const statusConfig = {
  successful: {
    label: "Successful",
    icon: FaCheckCircle,
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },

  pending: {
    label: "Pending",
    icon: FaClock,
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },

  processing: {
    label: "Processing",
    icon: FaClock,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },

  failed: {
    label: "Failed",
    icon: FaTimesCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },

  cancelled: {
    label: "Cancelled",
    icon: FaTimesCircle,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "successful", label: "Successful" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
];

export default function AgentPayments() {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError("");

        const data = await getAgentPayments(user.uid);
        setPayments(data || []);
      } catch (err) {
        console.error("Failed to load agent payments:", err);
        setError(err?.message || "Failed to load payment transactions.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [user?.uid]);

  const stats = useMemo(() => {
    const successful = payments.filter(
      (payment) => payment.status === "successful",
    );

    const totalGross = successful.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || payment.grossAmount || 0),
      0,
    );

    const platformFees = successful.reduce(
      (sum, payment) =>
        sum + Number(payment.platformFee || payment.rentEaseFee || 0),
      0,
    );

    const netAmount = successful.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.managerAmount ||
            payment.recipientAmount ||
            payment.netAmount ||
            payment.amountAfterFee ||
            Math.max(
              Number(payment.amount || payment.grossAmount || 0) -
                Number(payment.platformFee || payment.rentEaseFee || 0),
              0,
            ),
        ),
      0,
    );

    return {
      totalGross,
      platformFees,
      netAmount,
      successfulCount: successful.length,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesTab = activeTab === "all" || payment.status === activeTab;

      if (!matchesTab) return false;

      if (!term) return true;

      const searchableText = [
        payment.reference,
        payment.transactionReference,
        payment.paymentReference,
        payment.propertyTitle,
        payment.tenantName,
        payment.tenantEmail,
        payment.paymentType,
        payment.type,
        payment.status,
        payment.rentPaymentNumber,
        payment.rentFrequency,
        payment.rentPeriodStart,
        payment.rentPeriodEnd,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [payments, activeTab, search]);

  const statCards = [
    {
      title: "Total Gross",
      value: formatCurrency(stats.totalGross),
      icon: FaMoneyBillWave,
    },
    {
      title: "Successful Payments",
      value: stats.successfulCount,
      icon: FaCheckCircle,
    },
    {
      title: "RentEase Fee",
      value: formatCurrency(stats.platformFees),
      icon: FaReceipt,
    },
    {
      title: "Net Amount",
      value: formatCurrency(stats.netAmount),
      icon: FaMoneyBillWave,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View rental payments and your RentEase earnings.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </p>

                      <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                        {stat.value}
                      </h2>
                    </div>

                    <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <Icon />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Search + Filters */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tenant, property or reference..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-56 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <FaMoneyBillWave className="mx-auto mb-4 text-4xl text-gray-300 dark:text-slate-600" />

              <h3 className="text-lg font-semibold">No payment transactions</h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Payment transactions related to your properties will appear
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment, index) => {
                const status =
                  statusConfig[payment.status] || statusConfig.pending;

                const StatusIcon = status.icon;

                const grossAmount = Number(
                  payment.grossAmount || payment.amount || 0,
                );

                const platformFee = Number(
                  payment.platformFee || payment.rentEaseFee || 0,
                );

                const netAmount = Number(
                  payment.managerAmount ||
                    payment.recipientAmount ||
                    payment.netAmount ||
                    payment.amountAfterFee ||
                    Math.max(grossAmount - platformFee, 0),
                );

                const rentPeriod = formatRentPeriod(
                  payment.rentPeriodStart,
                  payment.rentPeriodEnd,
                );

                const isRentPayment =
                  payment.paymentType === "rent" ||
                  payment.type === "rent" ||
                  payment.rentPaymentNumber;

                return (
                  <motion.div
                    key={
                      payment.id ||
                      payment.reference ||
                      payment.transactionReference ||
                      index
                    }
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.04, 0.3),
                    }}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    {/* Header */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="hidden rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 sm:block">
                          <FaBuilding />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {payment.propertyTitle || "Rental Property"}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FaUser className="text-xs" />
                              {payment.tenantName || "Tenant"}
                            </span>

                            {(payment.paymentType || payment.type) && (
                              <>
                                <span>•</span>
                                <span>
                                  {formatPaymentType(
                                    payment.paymentType || payment.type,
                                  )}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Rent Payment Number */}
                          {isRentPayment && payment.rentPaymentNumber && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                              <FaReceipt />
                              Rent Payment #{payment.rentPaymentNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon />
                        {status.label}
                      </span>
                    </div>

                    {/* Rent Period */}
                    {isRentPayment && (
                      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <FaCalendarAlt />
                              Rent Period
                            </div>

                            <p className="mt-1 font-semibold">
                              {rentPeriod || "—"}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <FaHome />
                              Payment Frequency
                            </div>

                            <p className="mt-1 font-semibold">
                              {formatFrequency(payment.rentFrequency)}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <FaCalendarAlt />
                              Next Rent Due
                            </div>

                            <p className="mt-1 font-semibold">
                              {formatDate(payment.nextRentDueDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Financial Details */}
                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Gross Amount
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatCurrency(grossAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          RentEase 5%
                        </p>

                        <p className="mt-1 font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(platformFee)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Your Net Amount
                        </p>

                        <p className="mt-1 font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(netAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Payment Date
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatDate(payment.createdAt || payment.paidAt)}
                        </p>
                      </div>
                    </div>

                    {/* Reference */}
                    <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-slate-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Reference:{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {payment.reference ||
                            payment.transactionReference ||
                            payment.paymentReference ||
                            "—"}
                        </span>
                      </span>

                      {payment.tenantEmail && (
                        <span>{payment.tenantEmail}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
