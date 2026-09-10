import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaReceipt,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getAllPayments } from "../../firebase/paymentService";

const PLATFORM_FEE_RATE = 0.05;

function formatCurrency(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function getTimestampValue(value) {
  if (!value) return 0;

  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value) {
  const timestamp = getTimestampValue(value);

  if (!timestamp) return "—";

  return new Date(timestamp).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPaymentType(payment) {
  return String(
    payment?.paymentType || payment?.type || payment?.transactionType || "",
  ).toLowerCase();
}

function isRentPayment(payment) {
  const type = getPaymentType(payment);

  return type === "rent" || type === "rental" || type === "rent_payment";
}

function isSuccessful(payment) {
  const status = String(payment?.status || "").toLowerCase();

  return (
    status === "successful" ||
    status === "success" ||
    status === "paid" ||
    status === "completed"
  );
}

function getPaymentAmount(payment) {
  return Number(
    payment?.amount ??
      payment?.grossAmount ??
      payment?.rentAmount ??
      payment?.totalAmount ??
      0,
  );
}

function getPlatformFee(payment) {
  const storedFee = Number(
    payment?.platformFee ?? payment?.adminFee ?? payment?.rentEaseFee ?? 0,
  );

  if (storedFee > 0) return storedFee;

  return Math.round(getPaymentAmount(payment) * PLATFORM_FEE_RATE);
}

function getManagerAmount(payment) {
  const amount = getPaymentAmount(payment);
  const storedAmount = Number(
    payment?.managerAmount ??
      payment?.managerEarnings ??
      payment?.recipientAmount ??
      payment?.netAmount ??
      0,
  );

  if (storedAmount > 0) return storedAmount;

  return Math.max(0, amount - getPlatformFee(payment));
}

function getMonthKey(value) {
  const timestamp = getTimestampValue(value);

  if (!timestamp) return null;

  const date = new Date(timestamp);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getMonthLabel(monthKey) {
  if (!monthKey) return "Unknown";

  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized === "successful" ||
    normalized === "success" ||
    normalized === "paid" ||
    normalized === "completed"
  ) {
    return {
      className:
        "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
      icon: <FaCheckCircle />,
      label: "Successful",
    };
  }

  if (normalized === "pending" || normalized === "processing") {
    return {
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
      icon: <FaClock />,
      label: "Pending",
    };
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
      icon: <FaTimesCircle />,
      label: "Failed",
    };
  }

  return {
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: <FaReceipt />,
    label: status || "Unknown",
  };
}

function StatCard({ title, value, subtitle, icon, iconClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {value}
          </p>

          {subtitle && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg text-white ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function MonthlyChart({ data }) {
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.rent, item.earnings)),
    1,
  );

  return (
    <div className="mt-6">
      <div className="mb-5 flex flex-wrap items-center gap-5 text-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
          Rent Collected
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          RentEase 5%
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="flex min-w-[700px] items-end gap-4"
          style={{ height: 300 }}
        >
          {data.map((item) => {
            const rentHeight = Math.max(
              8,
              Math.round((item.rent / maxValue) * 235),
            );

            const earningsHeight = Math.max(
              5,
              Math.round((item.earnings / maxValue) * 235),
            );

            return (
              <div
                key={item.month}
                className="flex min-w-[70px] flex-1 flex-col items-center justify-end"
              >
                <div className="mb-2 flex h-[235px] items-end gap-2">
                  <div className="group relative flex items-end">
                    <div
                      className="w-5 rounded-t-md bg-blue-600 transition-all duration-300 hover:bg-blue-700"
                      style={{ height: rentHeight }}
                      title={`${item.month}: ${formatCurrency(item.rent)}`}
                    />
                  </div>

                  <div className="group relative flex items-end">
                    <div
                      className="w-5 rounded-t-md bg-green-500 transition-all duration-300 hover:bg-green-600"
                      style={{ height: earningsHeight }}
                      title={`${item.month}: ${formatCurrency(item.earnings)}`}
                    />
                  </div>
                </div>

                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Earnings() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("rent");
  const [periodFilter, setPeriodFilter] = useState("all");

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllPayments();

        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Admin earnings loading error:", err);
        setError(err?.message || "Unable to load earnings data.");
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  const rentPayments = useMemo(
    () => payments.filter(isRentPayment),
    [payments],
  );

  const filteredPayments = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const difference = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - difference);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const search = searchTerm.trim().toLowerCase();

    return rentPayments
      .filter((payment) => {
        const status = String(payment?.status || "").toLowerCase();

        if (statusFilter !== "all") {
          if (statusFilter === "successful" && !isSuccessful(payment)) {
            return false;
          }

          if (
            statusFilter === "pending" &&
            !["pending", "processing"].includes(status)
          ) {
            return false;
          }

          if (
            statusFilter === "failed" &&
            !["failed", "cancelled", "canceled"].includes(status)
          ) {
            return false;
          }
        }

        if (periodFilter !== "all") {
          const timestamp = getTimestampValue(
            payment?.createdAt ||
              payment?.paidAt ||
              payment?.paymentDate ||
              payment?.date,
          );

          if (!timestamp) return false;

          const paymentDate = new Date(timestamp);

          if (periodFilter === "today" && paymentDate < startOfToday) {
            return false;
          }

          if (periodFilter === "week" && paymentDate < startOfWeek) {
            return false;
          }

          if (periodFilter === "month" && paymentDate < startOfMonth) {
            return false;
          }

          if (periodFilter === "year" && paymentDate < startOfYear) {
            return false;
          }
        }

        if (!search) return true;

        const searchable = [
          payment?.propertyTitle,
          payment?.tenantName,
          payment?.tenantEmail,
          payment?.managerName,
          payment?.landlordName,
          payment?.agentName,
          payment?.reference,
          payment?.paymentReference,
          payment?.rentPaymentNumber,
          payment?.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(search);
      })
      .sort(
        (a, b) =>
          getTimestampValue(
            b?.createdAt || b?.paidAt || b?.paymentDate || b?.date,
          ) -
          getTimestampValue(
            a?.createdAt || a?.paidAt || a?.paymentDate || a?.date,
          ),
      );
  }, [rentPayments, searchTerm, statusFilter, periodFilter]);

  const successfulRentPayments = useMemo(
    () => rentPayments.filter(isSuccessful),
    [rentPayments],
  );

  const totalRentCollected = useMemo(
    () =>
      successfulRentPayments.reduce(
        (sum, payment) => sum + getPaymentAmount(payment),
        0,
      ),
    [successfulRentPayments],
  );

  const totalPlatformFees = useMemo(
    () =>
      successfulRentPayments.reduce(
        (sum, payment) => sum + getPlatformFee(payment),
        0,
      ),
    [successfulRentPayments],
  );

  const totalManagerEarnings = useMemo(
    () =>
      successfulRentPayments.reduce(
        (sum, payment) => sum + getManagerAmount(payment),
        0,
      ),
    [successfulRentPayments],
  );

  const pendingCount = useMemo(
    () =>
      rentPayments.filter((payment) => {
        const status = String(payment?.status || "").toLowerCase();
        return ["pending", "processing"].includes(status);
      }).length,
    [rentPayments],
  );

  const failedCount = useMemo(
    () =>
      rentPayments.filter((payment) => {
        const status = String(payment?.status || "").toLowerCase();
        return ["failed", "cancelled", "canceled"].includes(status);
      }).length,
    [rentPayments],
  );

  const monthlyData = useMemo(() => {
    const months = [];

    const now = new Date();

    for (let index = 11; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      months.push({
        key: monthKey,
        month: date.toLocaleDateString("en-NG", {
          month: "short",
        }),
        rent: 0,
        earnings: 0,
      });
    }

    successfulRentPayments.forEach((payment) => {
      const dateValue =
        payment?.createdAt ||
        payment?.paidAt ||
        payment?.paymentDate ||
        payment?.date;

      const monthKey = getMonthKey(dateValue);

      const month = months.find((item) => item.key === monthKey);

      if (month) {
        month.rent += getPaymentAmount(payment);
        month.earnings += getPlatformFee(payment);
      }
    });

    return months;
  }, [successfulRentPayments]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Earnings & Finance
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              Monitor RentEase rental transactions, platform earnings, and
              manager payouts.
            </p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Rent Collected"
            value={loading ? "..." : formatCurrency(totalRentCollected)}
            subtitle={`${successfulRentPayments.length} successful rent transactions`}
            icon={<FaMoneyBillWave />}
            iconClass="bg-blue-600"
          />

          <StatCard
            title="RentEase Earnings"
            value={loading ? "..." : formatCurrency(totalPlatformFees)}
            subtitle="5% platform share from successful rent payments"
            icon={<FaChartLine />}
            iconClass="bg-green-600"
          />

          <StatCard
            title="Manager Earnings"
            value={loading ? "..." : formatCurrency(totalManagerEarnings)}
            subtitle="Landlord and agent share"
            icon={<FaUsers />}
            iconClass="bg-purple-600"
          />

          <StatCard
            title="Rent Transactions"
            value={loading ? "..." : rentPayments.length}
            subtitle={`${pendingCount} pending • ${failedCount} failed`}
            icon={<FaReceipt />}
            iconClass="bg-orange-500"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:col-span-2"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                Earnings Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Monthly rent collection compared with RentEase's 5% platform
                earnings.
              </p>
            </div>

            {loading ? (
              <div className="flex h-[300px] items-center justify-center">
                <FaSpinner className="animate-spin text-2xl text-blue-600" />
              </div>
            ) : (
              <MonthlyChart data={monthlyData} />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Revenue Breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Distribution of successful rental payments.
            </p>

            <div className="mt-7 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    Rent Collected
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(totalRentCollected)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    RentEase 5%
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(totalPlatformFees)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width:
                        totalRentCollected > 0
                          ? `${Math.min(
                              100,
                              (totalPlatformFees / totalRentCollected) * 100,
                            )}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    Manager Share
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(totalManagerEarnings)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{
                      width:
                        totalRentCollected > 0
                          ? `${Math.min(
                              100,
                              (totalManagerEarnings / totalRentCollected) * 100,
                            )}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
              <div className="flex items-start gap-3">
                <FaChartLine className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />

                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Platform fee rate
                  </p>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    RentEase currently retains{" "}
                    {(PLATFORM_FEE_RATE * 100).toFixed(0)}% of successful rental
                    transactions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Search transactions
              </label>

              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Property, tenant, manager, reference..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:w-[620px]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="successful">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Transaction
                </label>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="rent">Rent Only</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Period
                </label>

                <select
                  value={periodFilter}
                  onChange={(event) => setPeriodFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <FaFilter />
            <span>
              Showing {filteredPayments.length} rental transaction
              {filteredPayments.length === 1 ? "" : "s"}.
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <FaReceipt />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Rental Transactions
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Detailed record of rental payments and platform earnings.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <FaReceipt className="text-xl" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
                No rental transactions found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Try changing your search or filters, or wait until rental
                payments are recorded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Transaction
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Property
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Tenant
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Manager
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Rent
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      RentEase 5%
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Manager Net
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayments.map((payment) => {
                    const status = getStatusStyle(payment?.status);
                    const amount = getPaymentAmount(payment);
                    const fee = getPlatformFee(payment);
                    const managerAmount = getManagerAmount(payment);

                    return (
                      <tr
                        key={
                          payment?.id ||
                          payment?.paymentId ||
                          payment?.reference
                        }
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-950/60"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              #
                              {payment?.rentPaymentNumber ||
                                payment?.paymentNumber ||
                                "—"}
                            </p>

                            <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
                              {payment?.paymentReference ||
                                payment?.reference ||
                                payment?.transactionReference ||
                                "No reference"}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[190px] truncate font-medium text-slate-800 dark:text-slate-200">
                            {payment?.propertyTitle ||
                              payment?.propertyName ||
                              "Property"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {payment?.rentFrequency ||
                              payment?.frequency ||
                              "Rent"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {payment?.tenantName || "Tenant"}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
                            {payment?.tenantEmail || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {payment?.managerName ||
                              payment?.landlordName ||
                              payment?.agentName ||
                              "Manager"}
                          </p>

                          <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                            {payment?.managerRole ||
                              payment?.ownerRole ||
                              "manager"}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(amount)}
                        </td>

                        <td className="px-5 py-4 font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(fee)}
                        </td>

                        <td className="px-5 py-4 font-semibold text-purple-600 dark:text-purple-400">
                          {formatCurrency(managerAmount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-400">
                          {formatDate(
                            payment?.createdAt ||
                              payment?.paidAt ||
                              payment?.paymentDate ||
                              payment?.date,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default Earnings;
