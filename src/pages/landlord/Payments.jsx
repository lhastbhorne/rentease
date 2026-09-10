import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaSearch,
  FaTimesCircle,
  FaCalendarAlt,
  FaHome,
  FaUser,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getLandlordPayments } from "../../firebase/paymentService";
import { useAuth } from "../../contexts/AuthContext";

// =====================================================
// FORMAT MONEY
// =====================================================

const formatMoney = (amount) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

// =====================================================
// FORMAT DATE
// =====================================================

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

// =====================================================
// FORMAT RENT PERIOD
// =====================================================

const formatRentPeriod = (start, end) => {
  if (!start && !end) {
    return "Rent period not available";
  }

  if (start && end) {
    return `${formatDate(start)} → ${formatDate(end)}`;
  }

  if (start) {
    return `From ${formatDate(start)}`;
  }

  return `Until ${formatDate(end)}`;
};

// =====================================================
// FORMAT PAYMENT TYPE
// =====================================================

const formatPaymentType = (value) => {
  if (!value) return "Rent";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// =====================================================
// STATUS
// =====================================================

const getStatus = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "successful" || value === "paid") {
    return {
      label: "Successful",
      icon: <FaCheckCircle />,
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    };
  }

  if (value === "pending" || value === "processing") {
    return {
      label: value === "processing" ? "Processing" : "Pending",
      icon: <FaClock />,
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    };
  }

  return {
    label: value
      ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      : "Unknown",
    icon: <FaTimesCircle />,
    className: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };
};

// =====================================================
// PAGE
// =====================================================

function Payments() {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ===================================================
  // LOAD PAYMENTS
  // ===================================================

  useEffect(() => {
    const loadPayments = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError("");

        const data = await getLandlordPayments(user.uid);

        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load landlord payments:", err);
        setError(err?.message || "Unable to load payments.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [user?.uid]);

  // ===================================================
  // FILTER PAYMENTS
  // ===================================================

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        String(payment?.tenantName || "")
          .toLowerCase()
          .includes(query) ||
        String(payment?.propertyTitle || "")
          .toLowerCase()
          .includes(query) ||
        String(payment?.paymentReference || "")
          .toLowerCase()
          .includes(query) ||
        String(payment?.rentPaymentNumber || "")
          .toLowerCase()
          .includes(query);

      const status = String(payment?.status || "").toLowerCase();

      const matchesFilter =
        filter === "all" ||
        (filter === "successful" &&
          (status === "successful" || status === "paid")) ||
        (filter === "pending" &&
          (status === "pending" || status === "processing")) ||
        (filter === "failed" &&
          !["successful", "paid", "pending", "processing"].includes(status));

      return matchesSearch && matchesFilter;
    });
  }, [payments, search, filter]);

  // ===================================================
  // SUCCESSFUL PAYMENTS
  // ===================================================

  const successfulPayments = payments.filter((payment) => {
    const status = String(payment?.status || "").toLowerCase();

    return status === "successful" || status === "paid";
  });

  // ===================================================
  // TOTAL GROSS
  // ===================================================

  const totalGross = successfulPayments.reduce(
    (sum, payment) =>
      sum + Number(payment?.grossAmount ?? payment?.amount ?? 0),
    0,
  );

  // ===================================================
  // TOTAL PLATFORM FEES
  // ===================================================

  const totalPlatformFees = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment?.platformFee || 0),
    0,
  );

  // ===================================================
  // TOTAL LANDLORD NET
  // ===================================================

  const totalNet = successfulPayments.reduce(
    (sum, payment) =>
      sum +
      Number(
        payment?.managerAmount ??
          payment?.recipientAmount ??
          payment?.netAmount ??
          payment?.amount ??
          0,
      ),
    0,
  );

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-6 transition-colors dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ==========================================
              HEADER
          ========================================== */}

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Payments
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Track rental payments, recurring rent periods and your RentEase
              payment breakdown.
            </p>
          </motion.div>

          {/* ==========================================
              STATS
          ========================================== */}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FaMoneyBillWave />}
              title="Total Gross"
              value={formatMoney(totalGross)}
            />

            <StatCard
              icon={<FaCheckCircle />}
              title="Successful Payments"
              value={successfulPayments.length}
            />

            <StatCard
              icon={<FaMoneyBillWave />}
              title="RentEase Fee"
              value={formatMoney(totalPlatformFees)}
            />

            <StatCard
              icon={<FaMoneyBillWave />}
              title="Net Amount"
              value={formatMoney(totalNet)}
            />
          </div>

          {/* ==========================================
              SEARCH / FILTER
          ========================================== */}

          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenant, property or reference..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["successful", "Successful"],
                ["pending", "Pending"],
                ["failed", "Failed"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ==========================================
              PAYMENTS
          ========================================== */}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <FaMoneyBillWave className="mx-auto mb-4 text-4xl text-slate-300 dark:text-slate-600" />

              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                No payments found
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {search
                  ? "Try a different search term."
                  : "Rental payment transactions will appear here."}
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
              className="space-y-4"
            >
              {filteredPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ icon, title, value }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        {icon}
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </motion.div>
  );
}

// =====================================================
// PAYMENT CARD
// =====================================================

function PaymentCard({ payment }) {
  const status = getStatus(payment?.status);

  const grossAmount = Number(payment?.grossAmount ?? payment?.amount ?? 0);

  const platformFee = Number(payment?.platformFee || 0);

  const netAmount = Number(
    payment?.managerAmount ??
      payment?.recipientAmount ??
      payment?.netAmount ??
      grossAmount - platformFee,
  );

  const paymentNumber = payment?.rentPaymentNumber;

  const isRentPayment =
    payment?.paymentType === "rent" ||
    payment?.transactionType === "rent" ||
    paymentNumber;

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 15,
        },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-6">
        {/* ==========================================
            TOP SECTION
        ========================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {payment?.propertyTitle || "Rental Payment"}
              </h2>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.icon}
                {status.label}
              </span>

              {isRentPayment && paymentNumber && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                  Rent Payment #{paymentNumber}
                </span>
              )}
            </div>

            {/* Tenant */}
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <FaUser className="text-indigo-500" />

              <span>
                Tenant:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {payment?.tenantName || "—"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ==========================================
            RENT PERIOD
        ========================================== */}

        {isRentPayment && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/10 dark:bg-indigo-500/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <FaCalendarAlt />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Rent Period
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {formatRentPeriod(
                      payment?.rentPeriodStart,
                      payment?.rentPeriodEnd,
                    )}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payment Frequency
                </p>

                <p className="mt-1 text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">
                  {String(payment?.rentFrequency || "—").replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PAYMENT INFORMATION
        ========================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info
            label="Property"
            value={payment?.propertyTitle}
            icon={<FaHome />}
          />

          <Info
            label="Payment Type"
            value={formatPaymentType(payment?.paymentType)}
          />

          <Info label="Reference" value={payment?.paymentReference} />

          <Info
            label="Date"
            value={formatDate(payment?.createdAt || payment?.paidAt)}
          />
        </div>

        {/* ==========================================
            FINANCIAL BREAKDOWN
        ========================================== */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Payment Breakdown
            </p>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              RentEase fee: 5%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AmountBox label="Gross Rent" value={formatMoney(grossAmount)} />

            <AmountBox label="RentEase 5%" value={formatMoney(platformFee)} />

            <AmountBox
              label="Your Net Amount"
              value={formatMoney(netAmount)}
              highlight
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// INFO
// =====================================================

function Info({ label, value, icon }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {icon && <span className="text-xs text-indigo-500">{icon}</span>}

        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>

      <p className="mt-1 truncate font-medium text-slate-800 dark:text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}

// =====================================================
// AMOUNT BOX
// =====================================================

function AmountBox({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl p-4 ${
        highlight
          ? "bg-indigo-50 dark:bg-indigo-500/10"
          : "bg-slate-50 dark:bg-slate-800/60"
      }`}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p
        className={`mt-1 text-base font-bold ${
          highlight
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default Payments;
