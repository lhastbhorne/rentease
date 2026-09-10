import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaHome,
  FaFileAlt,
  FaCreditCard,
  FaLock,
  FaTimes,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  getMyApplications,
  expireApplicationPayment,
  markApplicationPaymentCompleted,
} from "../../firebase/applicationService";

import { createPayment } from "../../firebase/paymentService";

import { useAuth } from "../../contexts/AuthContext";

function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [checkoutApplication, setCheckoutApplication] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await getMyApplications(user.uid);

        // Check approved applications for
        // expired payment deadlines.
        const checkedApplications = await Promise.all(
          data.map(async (application) => {
            try {
              if (
                application.status === "approved" &&
                application.paymentStatus === "pending" &&
                application.paymentDeadline
              ) {
                const updated = await expireApplicationPayment(application.id);

                return updated;
              }

              return application;
            } catch (error) {
              console.error("Error checking application deadline:", error);

              return application;
            }
          }),
        );

        setApplications(checkedApplications);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) {
      loadApplications();
    }
  }, [user]);

  // ==========================================
  // OPEN DEMO CHECKOUT
  // ==========================================

  function openCheckout(application) {
    if (
      application.status !== "approved" ||
      application.paymentStatus !== "pending"
    ) {
      return;
    }

    const deadline = application.paymentDeadline
      ? typeof application.paymentDeadline?.toMillis === "function"
        ? application.paymentDeadline.toMillis()
        : new Date(application.paymentDeadline).getTime()
      : null;

    if (deadline && Date.now() > deadline) {
      alert("The payment deadline for this application has expired.");
      return;
    }

    setCheckoutApplication(application);
  }

  function handleCardChange(event) {
    const { name, value } = event.target;

    setCardData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function processDemoPayment(event) {
    event.preventDefault();

    if (!checkoutApplication) return;

    if (
      !cardData.cardNumber ||
      !cardData.expiry ||
      !cardData.cvv ||
      !cardData.cardName
    ) {
      alert("Please complete all demo card details.");
      return;
    }

    if (cardData.cardNumber.replace(/\s/g, "").length < 12) {
      alert("Please enter a valid demo card number.");
      return;
    }

    try {
      setPaying(true);

      // Simulate a real gateway processing delay.
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const reference = `RENT-DEMO-${Date.now()}`;

      // This performs the important final transition:
      // payment → active tenancy → occupied property.
      const result = await markApplicationPaymentCompleted(
        checkoutApplication.id,
        reference,
      );

      // Create the demo payment record after the tenancy exists.
      await createPayment({
        tenantId: user.uid,
        tenantName: checkoutApplication.tenantName || user.fullName || "",
        landlordId: checkoutApplication.landlordId || "",
        propertyId: checkoutApplication.propertyId || "",
        propertyTitle: checkoutApplication.propertyTitle || "",
        tenancyId: result.tenancyId,
        amount:
          Number(checkoutApplication.paymentAmount) ||
          Number(checkoutApplication.propertyPrice) ||
          0,
        currency: "NGN",
        paymentType: "rent",
        reference,
        paymentMethod: "demo-card",
        status: "successful",
      });

      setApplications((previous) =>
        previous.map((item) =>
          item.id === checkoutApplication.id
            ? {
                ...item,
                status: "approved",
                paymentStatus: "paid",
                paymentReference: reference,
                paymentDeadline: null,
                reservationStatus: "completed",
                tenancyStatus: "active",
                tenancyId: result.tenancyId,
              }
            : item,
        ),
      );

      setPaymentSuccess(true);

      setTimeout(() => {
        setCheckoutApplication(null);
        setPaymentSuccess(false);
        setCardData({
          cardNumber: "",
          expiry: "",
          cvv: "",
          cardName: "",
        });
      }, 2200);
    } catch (error) {
      console.error("Demo payment error:", error);
      alert(error.message || "Demo payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  // ==========================================
  // STATUS
  // ==========================================

  function getApplicationStatusStyle(status) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

      case "expired":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  }

  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  function getPaymentStatusStyle(status) {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "expired":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

      case "pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  }

  // ==========================================
  // TENANCY STATUS
  // ==========================================

  function getTenancyStatusStyle(status) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "awaiting_payment":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

      case "awaiting_activation":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

      case "expired":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(value) {
    if (!value) {
      return "Not specified";
    }

    let date;

    if (typeof value?.toDate === "function") {
      date = value.toDate();
    } else if (value instanceof Date) {
      date = value;
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ==========================================
  // FORMAT PAYMENT DEADLINE
  // ==========================================

  function getDeadlineText(deadline) {
    if (!deadline) {
      return "No deadline";
    }

    const deadlineTime =
      typeof deadline?.toMillis === "function"
        ? deadline.toMillis()
        : new Date(deadline).getTime();

    if (Number.isNaN(deadlineTime)) {
      return "Invalid deadline";
    }

    const difference = deadlineTime - Date.now();

    if (difference <= 0) {
      return "Payment deadline expired";
    }

    const totalHours = Math.floor(difference / (1000 * 60 * 60));

    const days = Math.floor(totalHours / 24);

    const hours = totalHours % 24;

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} ${hours} hour${
        hours !== 1 ? "s" : ""
      } remaining`;
    }

    return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
  }

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  function formatMoney(amount) {
    const numericAmount =
      typeof amount === "string"
        ? Number(amount.replace(/,/g, ""))
        : Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "Not specified";
    }

    return `₦${numericAmount.toLocaleString("en-NG")}`;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* ======================================
            HEADER
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            My Applications
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Track your property applications, payment deadlines, and tenancy
            status.
          </p>
        </motion.div>

        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-slate-500 dark:text-slate-400">
              Loading applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          /* ====================================
             EMPTY STATE
          ==================================== */

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <FaFileAlt className="text-2xl text-slate-400" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-800 dark:text-white">
              No Applications Yet
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              You haven't applied for any properties yet.
            </p>
          </motion.div>
        ) : (
          /* ====================================
             APPLICATIONS
          ==================================== */

          <div className="space-y-6">
            {applications.map((application, index) => {
              const isApproved = application.status === "approved";

              const isPaid = application.paymentStatus === "paid";

              const paymentPending =
                isApproved && application.paymentStatus === "pending";

              const tenancyActive = application.tenancyStatus === "active";

              const paymentExpired = application.paymentStatus === "expired";

              return (
                <motion.div
                  key={application.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900"
                >
                  {/* =================================
                        PROPERTY HEADER
                    ================================= */}

                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div className="flex gap-4">
                        {/* Property Image */}

                        {application.propertyImage ? (
                          <img
                            src={application.propertyImage}
                            alt={application.propertyTitle || "Property"}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                            <FaHome className="text-2xl text-slate-400" />
                          </div>
                        )}

                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {application.propertyTitle ||
                              "Property Application"}
                          </h2>

                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Application ID: {application.id}
                          </p>
                        </div>
                      </div>

                      {/* Application Status */}

                      <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getApplicationStatusStyle(
                          application.status,
                        )}`}
                      >
                        {application.status || "pending"}
                      </span>
                    </div>

                    {/* =================================
                          LOCATION
                      ================================= */}

                    {(application.propertyAreaName ||
                      application.propertyCity ||
                      application.propertyState) && (
                      <div className="mt-5 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <FaMapMarkerAlt className="text-blue-600" />

                        <span>
                          {[
                            application.propertyAreaName,
                            application.propertyCity,
                            application.propertyState,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {/* =================================
                          APPLICATION INFORMATION
                      ================================= */}

                    <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Move-in Date
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-medium text-slate-800 dark:text-white">
                          <FaCalendarAlt className="text-blue-600" />

                          {application.moveInDate || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Employment Status
                        </p>

                        <p className="mt-1 font-medium text-slate-800 dark:text-white">
                          {application.employmentStatus || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Monthly Income
                        </p>

                        <p className="mt-1 font-medium text-slate-800 dark:text-white">
                          {formatMoney(application.monthlyIncome)}
                        </p>
                      </div>
                    </div>

                    {/* =================================
                          MESSAGE
                      ================================= */}

                    {application.message && (
                      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Your message
                        </p>

                        <p className="mt-2 text-slate-700 dark:text-slate-200">
                          {application.message}
                        </p>
                      </div>
                    )}

                    {/* =================================
                          APPROVED PAYMENT SECTION
                      ================================= */}

                    {isApproved && (
                      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-900/10">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                              <FaCheckCircle className="text-xl text-green-600 dark:text-green-400" />
                            </div>

                            <div>
                              <h3 className="font-bold text-green-800 dark:text-green-300">
                                Application Approved
                              </h3>

                              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                                Your application has been approved. Complete
                                your rent payment to activate your tenancy.
                              </p>
                            </div>
                          </div>

                          {/* Payment Status */}

                          <span
                            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStatusStyle(
                              application.paymentStatus,
                            )}`}
                          >
                            {application.paymentStatus?.replace("_", " ") ||
                              "Not started"}
                          </span>
                        </div>

                        {/* Payment Information */}

                        <div className="mt-5 grid gap-4 border-t border-green-200 pt-5 dark:border-green-900/50 md:grid-cols-3">
                          <div>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              Rent Amount
                            </p>

                            <p className="mt-1 flex items-center gap-2 font-bold text-green-900 dark:text-green-200">
                              <FaMoneyBillWave />

                              {formatMoney(
                                application.paymentAmount ||
                                  application.propertyPrice,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              Payment Deadline
                            </p>

                            <p className="mt-1 flex items-center gap-2 font-medium text-green-900 dark:text-green-200">
                              <FaCalendarAlt />

                              {formatDate(application.paymentDeadline)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              Time Remaining
                            </p>

                            <p className="mt-1 flex items-center gap-2 font-bold text-green-900 dark:text-green-200">
                              <FaClock />

                              {getDeadlineText(application.paymentDeadline)}
                            </p>
                          </div>
                        </div>

                        {/* Payment Action */}

                        {paymentPending && (
                          <div className="mt-5 rounded-xl bg-white p-4 dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                              <FaHourglassHalf className="mt-1 text-orange-500" />

                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                  Payment Required
                                </p>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  You must complete your rent payment before the
                                  deadline. Your tenancy will not become active
                                  until payment has been verified.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => openCheckout(application)}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                              <FaCreditCard />
                              Pay Rent Now
                            </button>
                          </div>
                        )}

                        {/* Paid */}

                        {isPaid && (
                          <div className="mt-5 rounded-xl bg-white p-4 dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                              <FaCheckCircle className="mt-1 text-green-600" />

                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                  Payment Completed
                                </p>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  Your payment has been received.
                                </p>

                                {application.paymentReference && (
                                  <p className="mt-2 text-xs text-slate-400">
                                    Reference: {application.paymentReference}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expired */}

                        {paymentExpired && (
                          <div className="mt-5 rounded-xl bg-white p-4 dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                              <FaTimesCircle className="mt-1 text-red-600" />

                              <div>
                                <p className="font-semibold text-red-700 dark:text-red-400">
                                  Payment Deadline Expired
                                </p>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  The 7-day payment period ended before payment
                                  was completed. You may reapply for the
                                  property if it is still available.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* =================================
                          TENANCY STATUS
                      ================================= */}

                    {application.tenancyStatus &&
                      application.tenancyStatus !== "not_started" && (
                        <div className="mt-5 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <FaHome className="text-blue-600" />

                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Tenancy Status
                                </p>

                                <p className="font-semibold capitalize text-slate-800 dark:text-white">
                                  {application.tenancyStatus.replace("_", " ")}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getTenancyStatusStyle(
                                application.tenancyStatus,
                              )}`}
                            >
                              {application.tenancyStatus.replace("_", " ")}
                            </span>
                          </div>

                          {tenancyActive && (
                            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              Your tenancy is active. Your rental documents and
                              payment receipt will be available from your
                              tenancy section.
                            </p>
                          )}

                          {application.tenancyStatus ===
                            "awaiting_activation" && (
                            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              Payment received. Your tenancy is being activated.
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==========================================
          DEMO PAYMENT CHECKOUT
      ========================================== */}

      <AnimatePresence>
        {checkoutApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    RentEase Checkout
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Demo payment gateway
                  </p>
                </div>

                {!paying && !paymentSuccess && (
                  <button
                    type="button"
                    onClick={() => setCheckoutApplication(null)}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {paymentSuccess ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <FaCheckCircle className="mx-auto text-6xl text-green-500" />
                  </motion.div>

                  <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
                    Payment Successful!
                  </h2>

                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Your payment has been recorded and your tenancy is now
                    active.
                  </p>
                </div>
              ) : (
                <form onSubmit={processDemoPayment} className="p-6">
                  <div className="mb-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {checkoutApplication.propertyTitle}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Rent
                      </span>
                      <span className="text-xl font-bold text-slate-800 dark:text-white">
                        {formatMoney(
                          checkoutApplication.paymentAmount ||
                            checkoutApplication.propertyPrice,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Card Number
                    </label>
                    <div className="relative">
                      <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                        placeholder="4111 1111 1111 1111"
                        maxLength={19}
                        inputMode="numeric"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Cardholder Name
                    </label>
                    <input
                      name="cardName"
                      value={cardData.cardName}
                      onChange={handleCardChange}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Expiry
                      </label>
                      <input
                        name="expiry"
                        value={cardData.expiry}
                        onChange={handleCardChange}
                        placeholder="12/30"
                        maxLength={5}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                        inputMode="numeric"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paying}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaLock />
                    {paying
                      ? "Processing Demo Payment..."
                      : `Pay ${formatMoney(
                          checkoutApplication.paymentAmount ||
                            checkoutApplication.propertyPrice,
                        )}`}
                  </button>

                  <p className="mt-4 text-center text-xs text-slate-400">
                    Demo only — no real money will be charged.
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default Applications;
