import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  getMyApplications,
  expireApplicationPayment,
} from "../../firebase/applicationService";

import { useAuth } from "../../contexts/AuthContext";

function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [payingApplicationId, setPayingApplicationId] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyApplications(user.uid);

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

        setError(error.message || "Unable to load your applications.");
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) {
      loadApplications();
    }
  }, [user]);

  function getApplicationPaymentAmount(application) {
    return Number(application.paymentAmount || application.propertyPrice || 0);
  }

  function openPaystackCheckout(application) {
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
      setError("The payment deadline for this application has expired.");
      return;
    }

    const amount = getApplicationPaymentAmount(application);

    if (!amount || amount <= 0) {
      setError("The rent amount for this application is invalid.");
      return;
    }

    if (!user?.email) {
      setError("Your account email could not be found.");
      return;
    }

    startPaystackPayment(application, amount);
  }

  async function startPaystackPayment(application, amount) {
    try {
      setPayingApplicationId(application.id);
      setError("");

      const reference = `RENTEASE-APPLICATION-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const response = await fetch("/.netlify/functions/paystack-initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount,
          reference,
          metadata: {
            paymentType: "application_initial_rent",

            applicationId: application.id,

            tenantId: user.uid,

            tenantName:
              application.tenantName || user.displayName || user.fullName || "",

            propertyId: application.propertyId || "",

            propertyTitle: application.propertyTitle || "",

            landlordId: application.landlordId || "",

            propertyPrice: application.propertyPrice || "",

            paymentAmount: application.paymentAmount || amount,

            callbackUrl: `${window.location.origin}/payment/callback`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || "Unable to initialize Paystack payment.",
        );
      }

      const authorizationUrl = data?.data?.authorization_url;

      const returnedReference = data?.data?.reference;

      if (!authorizationUrl || !returnedReference) {
        throw new Error("Paystack did not return a valid checkout URL.");
      }

      sessionStorage.setItem(
        "rentease_pending_application_payment",
        JSON.stringify({
          paymentType: "application_initial_rent",

          reference: returnedReference,

          applicationId: application.id,

          tenantId: user.uid,

          amount,

          propertyId: application.propertyId || "",

          propertyTitle: application.propertyTitle || "",

          landlordId: application.landlordId || "",

          tenantName:
            application.tenantName || user.displayName || user.fullName || "",
        }),
      );

      window.location.href = authorizationUrl;
    } catch (error) {
      console.error("Paystack initialization error:", error);

      setError(error.message || "Unable to start payment.");

      setPayingApplicationId(null);
    }
  }

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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
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

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            <FaTimesCircle className="mt-1 shrink-0" />

            <p className="text-sm">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-slate-500 dark:text-slate-400">
              Loading applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
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
          <div className="space-y-6">
            {applications.map((application, index) => {
              const isApproved = application.status === "approved";

              const isPaid = application.paymentStatus === "paid";

              const paymentPending =
                isApproved && application.paymentStatus === "pending";

              const tenancyActive = application.tenancyStatus === "active";

              const paymentExpired = application.paymentStatus === "expired";

              const isPaying = payingApplicationId === application.id;

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
                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div className="flex gap-4">
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

                      <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getApplicationStatusStyle(
                          application.status,
                        )}`}
                      >
                        {application.status || "pending"}
                      </span>
                    </div>

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

                          <span
                            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStatusStyle(
                              application.paymentStatus,
                            )}`}
                          >
                            {application.paymentStatus?.replace("_", " ") ||
                              "Not started"}
                          </span>
                        </div>

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

                        {paymentPending && (
                          <div className="mt-5 rounded-xl bg-white p-4 dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                              <FaHourglassHalf className="mt-1 text-orange-500" />

                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                  Payment Required
                                </p>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  Complete your rent payment before the
                                  deadline. Your tenancy will become active
                                  after the payment has been successfully
                                  verified.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => openPaystackCheckout(application)}
                              disabled={isPaying}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isPaying ? (
                                <>
                                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                  Connecting to Paystack...
                                </>
                              ) : (
                                <>
                                  <FaCreditCard />
                                  Pay Rent Now
                                </>
                              )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                              <FaLock className="text-green-500" />

                              <span>Secure payment powered by Paystack</span>
                            </div>
                          </div>
                        )}

                        {isPaid && (
                          <div className="mt-5 rounded-xl bg-white p-4 dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                              <FaCheckCircle className="mt-1 text-green-600" />

                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                  Payment Completed
                                </p>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  Your payment has been received and your
                                  tenancy activation has been completed.
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
    </DashboardLayout>
  );
}

export default Applications;
