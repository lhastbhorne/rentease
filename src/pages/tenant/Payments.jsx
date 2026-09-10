import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaMoneyBillWave,
  FaHome,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaCreditCard,
  FaTimes,
  FaExclamationCircle,
  FaArrowRight,
  FaReceipt,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import { useAuth } from "../../contexts/AuthContext";

import { getMyTenancies } from "../../firebase/tenancyService";

import {
  createRecurringRentPayment,
  getMyPayments,
} from "../../firebase/paymentService";

import {
  PLATFORM_FEE_RATE,
  PAYMENT_STATUS,
} from "../../firebase/rentalConstants";

// =====================================================
// HELPERS
// =====================================================

function formatCurrency(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  let date;

  if (typeof dateValue?.toDate === "function") {
    date = dateValue.toDate();
  } else if (typeof dateValue?.toMillis === "function") {
    date = new Date(dateValue.toMillis());
  } else {
    date = new Date(dateValue);
  }

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDateOnly(dateValue) {
  if (!dateValue) return null;

  let date;

  if (typeof dateValue?.toDate === "function") {
    date = dateValue.toDate();
  } else if (typeof dateValue?.toMillis === "function") {
    date = new Date(dateValue.toMillis());
  } else {
    date = new Date(dateValue);
  }

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysUntilDue(dateValue) {
  const dueDate = getDateOnly(dateValue);

  if (!dueDate) return null;

  const today = new Date();

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const difference = dueDate.getTime() - todayOnly.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function getPaymentDate(payment) {
  if (!payment?.createdAt) return 0;

  if (typeof payment.createdAt?.toMillis === "function") {
    return payment.createdAt.toMillis();
  }

  if (payment.createdAt instanceof Date) {
    return payment.createdAt.getTime();
  }

  const parsed = new Date(payment.createdAt).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

// =====================================================
// PAGE
// =====================================================

function Payments() {
  const { user } = useAuth();

  const [tenancies, setTenancies] = useState([]);
  const [payments, setPayments] = useState([]);

  const [selectedTenancyId, setSelectedTenancyId] = useState("");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [error, setError] = useState("");

  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  // =====================================================
  // LOAD TENANCIES + PAYMENTS
  // =====================================================

  async function loadData() {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError("");

      const [tenancyData, paymentData] = await Promise.all([
        getMyTenancies(user.uid),
        getMyPayments(user.uid),
      ]);

      setTenancies(tenancyData || []);
      setPayments(paymentData || []);

      if (tenancyData?.length > 0 && !selectedTenancyId) {
        setSelectedTenancyId(tenancyData[0].id);
      }

      if (
        tenancyData?.length > 0 &&
        selectedTenancyId &&
        !tenancyData.some((item) => item.id === selectedTenancyId)
      ) {
        setSelectedTenancyId(tenancyData[0].id);
      }
    } catch (err) {
      console.error("Error loading payment data:", err);

      setError(err.message || "Unable to load your payment information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  // =====================================================
  // SELECTED TENANCY
  // =====================================================

  const selectedTenancy = useMemo(() => {
    return (
      tenancies.find((tenancy) => tenancy.id === selectedTenancyId) || null
    );
  }, [tenancies, selectedTenancyId]);

  // =====================================================
  // RENT INFORMATION
  // =====================================================

  const rentAmount = Number(selectedTenancy?.rentAmount || 0);

  const platformFee = Math.round(rentAmount * PLATFORM_FEE_RATE);

  const totalAmount = rentAmount;

  const daysUntilDue = getDaysUntilDue(selectedTenancy?.nextRentDueDate);

  const canPay =
    selectedTenancy &&
    selectedTenancy.status === "active" &&
    rentAmount > 0 &&
    daysUntilDue !== null &&
    daysUntilDue <= 0;

  // =====================================================
  // OPEN CHECKOUT
  // =====================================================

  function openCheckout() {
    if (!selectedTenancy) {
      alert("Please select an active tenancy.");
      return;
    }

    if (!canPay) {
      alert("Your rent is not due yet.");
      return;
    }

    setError("");
    setPaymentSuccess(false);

    setCardData({
      cardNumber: "",
      expiry: "",
      cvv: "",
      cardName: "",
    });

    setShowCheckout(true);
  }

  // =====================================================
  // CARD INPUT
  // =====================================================

  function handleCardChange(event) {
    const { name, value } = event.target;

    setCardData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =====================================================
  // DEMO PAYMENT
  // =====================================================

  async function processPayment(event) {
    event.preventDefault();

    if (!selectedTenancy) {
      return;
    }

    if (
      !cardData.cardNumber ||
      !cardData.expiry ||
      !cardData.cvv ||
      !cardData.cardName
    ) {
      setError("Please complete all card details.");
      return;
    }

    if (cardData.cardNumber.replace(/\s/g, "").length < 12) {
      setError("Please enter a valid demo card number.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      // Simulate payment gateway delay.
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const paymentReference = `RENT-DEMO-${Date.now()}`;

      await createRecurringRentPayment({
        tenancy: selectedTenancy,
        tenantId: user.uid,
        paymentReference,
        paymentMethod: "demo-card",
      });

      setPaymentSuccess(true);

      await loadData();
    } catch (err) {
      console.error("Rent payment error:", err);

      setError(err.message || "Unable to process rent payment.");
    } finally {
      setPaying(false);
    }
  }

  // =====================================================
  // PAYMENT HISTORY
  // =====================================================

  const rentPayments = useMemo(() => {
    return [...payments]
      .filter(
        (payment) =>
          payment.paymentType === "rent" || payment.transactionType === "rent",
      )
      .sort((a, b) => getPaymentDate(b) - getPaymentDate(a));
  }, [payments]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // NO TENANCIES
  // =====================================================

  if (!tenancies.length) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <FaHome size={26} />
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                No Active Tenancy
              </h1>

              <p className="mt-3 text-slate-600 dark:text-slate-400">
                You don't currently have an active rental property with
                RentEase.
              </p>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* ==========================================
              HEADER
          ========================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Rent Payments
            </h1>

            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage your rent payments and view your payment history.
            </p>
          </motion.div>

          {/* ==========================================
              ERROR
          ========================================== */}

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
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                <FaExclamationCircle className="mt-0.5 shrink-0" />

                <p className="text-sm">{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-auto"
                >
                  <FaTimes />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ==========================================
              TENANCY SELECTOR
          ========================================== */}

          {tenancies.length > 1 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select Rental Property
              </label>

              <select
                value={selectedTenancyId}
                onChange={(event) => setSelectedTenancyId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {tenancies.map((tenancy) => (
                  <option key={tenancy.id} value={tenancy.id}>
                    {tenancy.propertyTitle || "Rental Property"} —{" "}
                    {formatCurrency(tenancy.rentAmount)}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* ==========================================
              TOP CARDS
          ========================================== */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* RENT SUMMARY */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg dark:bg-slate-900"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current Rent</p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {formatCurrency(rentAmount)}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <FaMoneyBillWave size={21} />
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <div className="flex items-center gap-3">
                  <FaHome className="text-slate-400" />

                  <div>
                    <p className="text-sm font-medium">
                      {selectedTenancy?.propertyTitle || "Rental Property"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedTenancy?.rentFrequency || "Rent"} payment
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* DUE DATE */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.05,
              }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Next Rent Due
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatDate(selectedTenancy?.nextRentDueDate)}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FaCalendarAlt />
                </div>
              </div>

              <div className="mt-5">
                {daysUntilDue === null ? (
                  <p className="text-sm text-slate-500">Due date unavailable</p>
                ) : daysUntilDue > 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Due in{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {daysUntilDue} {daysUntilDue === 1 ? "day" : "days"}
                    </span>
                  </p>
                ) : daysUntilDue === 0 ? (
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    Rent is due today
                  </p>
                ) : (
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    Rent is overdue by {Math.abs(daysUntilDue)}{" "}
                    {Math.abs(daysUntilDue) === 1 ? "day" : "days"}
                  </p>
                )}
              </div>
            </motion.div>

            {/* PAYMENT STATUS */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Rent Status
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedTenancy?.rentPaymentStatus ===
                    PAYMENT_STATUS.SUCCESSFUL
                      ? "Up to Date"
                      : daysUntilDue !== null && daysUntilDue <= 0
                        ? "Payment Due"
                        : "Upcoming"}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FaCheckCircle />
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Payment #{selectedTenancy?.rentPaymentCount || 1}
              </p>
            </motion.div>
          </div>

          {/* ==========================================
              CURRENT RENT PERIOD
          ========================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Current Rent Period
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-slate-900 dark:text-white">
                  <span className="font-semibold">
                    {formatDate(selectedTenancy?.currentRentPeriodStart)}
                  </span>

                  <FaArrowRight className="text-slate-400" />

                  <span className="font-semibold">
                    {formatDate(selectedTenancy?.currentRentPeriodEnd)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <FaClock />

                <span>
                  Next due:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {formatDate(selectedTenancy?.nextRentDueDate)}
                  </strong>
                </span>
              </div>
            </div>
          </motion.div>

          {/* ==========================================
              PAYMENT SECTION
          ========================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {/* BREAKDOWN */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FaReceipt />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Payment Breakdown
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Transparent RentEase pricing
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Rent
                  </span>

                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(rentAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    RentEase platform fee ({PLATFORM_FEE_RATE * 100}%)
                  </span>

                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(platformFee)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Total
                    </span>

                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                The RentEase platform fee is calculated transparently as part of
                the rental transaction.
              </div>
            </div>

            {/* PAY BUTTON */}

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FaMoneyBillWave size={21} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                  Pay Your Rent
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  You can make your next rent payment once the current rent
                  period reaches its due date.
                </p>
              </div>

              <div className="mt-8">
                {canPay ? (
                  <button
                    type="button"
                    onClick={openCheckout}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                  >
                    <FaCreditCard />
                    Pay Rent {formatCurrency(rentAmount)}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl bg-slate-200 px-5 py-3.5 font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                  >
                    <FaClock />

                    {daysUntilDue !== null && daysUntilDue > 0
                      ? `Available in ${daysUntilDue} ${
                          daysUntilDue === 1 ? "day" : "days"
                        }`
                      : "Payment Unavailable"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ==========================================
              PAYMENT HISTORY
          ========================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Rent Payment History
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your previous rental payments.
              </p>
            </div>

            {rentPayments.length === 0 ? (
              <div className="p-10 text-center">
                <FaReceipt
                  className="mx-auto text-slate-300 dark:text-slate-700"
                  size={35}
                />

                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No rent payments found yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {rentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <FaCheckCircle />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {payment.propertyTitle ||
                            selectedTenancy?.propertyTitle ||
                            "Rent Payment"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Payment #{payment.rentPaymentNumber || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </p>

                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                        Successful
                      </p>

                      {(payment.rentPeriodStart || payment.rentPeriodEnd) && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(payment.rentPeriodStart)} →{" "}
                          {formatDate(payment.rentPeriodEnd)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ==========================================
            CHECKOUT MODAL
        ========================================== */}

        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => !paying && setShowCheckout(false)}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
              >
                {!paymentSuccess ? (
                  <>
                    {/* MODAL HEADER */}

                    <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          Pay Rent
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Demo checkout
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={paying}
                        onClick={() => setShowCheckout(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {/* AMOUNT */}

                    <div className="p-6">
                      <div className="mb-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Amount to pay
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(totalAmount)}
                        </p>

                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Includes the {PLATFORM_FEE_RATE * 100}% RentEase
                          platform fee.
                        </p>
                      </div>

                      {/* FORM */}

                      <form onSubmit={processPayment} className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Cardholder Name
                          </label>

                          <input
                            type="text"
                            name="cardName"
                            value={cardData.cardName}
                            onChange={handleCardChange}
                            placeholder="John Doe"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Card Number
                          </label>

                          <input
                            type="text"
                            name="cardNumber"
                            value={cardData.cardNumber}
                            onChange={handleCardChange}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Expiry
                            </label>

                            <input
                              type="text"
                              name="expiry"
                              value={cardData.expiry}
                              onChange={handleCardChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                              CVV
                            </label>

                            <input
                              type="password"
                              name="cvv"
                              value={cardData.cvv}
                              onChange={handleCardChange}
                              placeholder="123"
                              maxLength={4}
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* ERROR */}

                        {error && (
                          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={paying}
                          className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {paying ? (
                            <>
                              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <FaCreditCard />
                              Pay {formatCurrency(totalAmount)}
                            </>
                          )}
                        </button>
                      </form>

                      <p className="mt-4 text-center text-xs text-slate-400">
                        This is currently a demo payment flow. Paystack will be
                        integrated for production payments.
                      </p>
                    </div>
                  </>
                ) : (
                  /* ====================================
                     SUCCESS
                  ==================================== */

                  <div className="p-8 text-center">
                    <motion.div
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    >
                      <FaCheckCircle size={40} />
                    </motion.div>

                    <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                      Rent Payment Successful
                    </h2>

                    <p className="mt-3 text-slate-500 dark:text-slate-400">
                      Your rent payment has been recorded successfully.
                    </p>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left dark:bg-slate-950">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                          Amount
                        </span>

                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                          Next due date
                        </span>

                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatDate(selectedTenancy?.nextRentDueDate)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default Payments;
