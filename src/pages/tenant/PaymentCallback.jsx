import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowLeft,
  FaReceipt,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  markApplicationPaymentCompleted,
  getMyApplications,
} from "../../firebase/applicationService";

import {
  createPayment,
  createRecurringRentPayment,
} from "../../firebase/paymentService";

function PaymentCallback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");

  const [message, setMessage] = useState(
    "Verifying your payment with Paystack...",
  );

  const [paymentData, setPaymentData] = useState(null);

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  useEffect(() => {
    async function verifyPayment() {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        setMessage(
          "No payment reference was found. We could not verify this payment.",
        );
        return;
      }

      if (!user?.uid) {
        return;
      }

      try {
        setStatus("verifying");
        setMessage("Verifying your payment with Paystack...");

        // =================================================
        // DETERMINE PAYMENT TYPE
        // =================================================

        const storedApplicationPayment = sessionStorage.getItem(
          "rentease_pending_application_payment",
        );

        const storedRentPayment = sessionStorage.getItem(
          "rentease_pending_rent_payment",
        );

        let pendingApplicationPayment = null;
        let pendingRentPayment = null;

        if (storedApplicationPayment) {
          try {
            pendingApplicationPayment = JSON.parse(storedApplicationPayment);
          } catch (error) {
            console.error(
              "Unable to parse pending application payment:",
              error,
            );
          }
        }

        if (storedRentPayment) {
          try {
            pendingRentPayment = JSON.parse(storedRentPayment);
          } catch (error) {
            console.error("Unable to parse pending rent payment:", error);
          }
        }

        // =================================================
        // IDENTIFY WHICH PAYMENT WAS STARTED
        // =================================================

        let pendingPayment = null;
        let paymentType = null;

        if (pendingApplicationPayment?.reference === reference) {
          pendingPayment = pendingApplicationPayment;
          paymentType = "application_initial_rent";
        } else if (pendingRentPayment?.reference === reference) {
          pendingPayment = pendingRentPayment;
          paymentType = "rent";
        } else if (pendingApplicationPayment) {
          pendingPayment = pendingApplicationPayment;
          paymentType = "application_initial_rent";
        } else if (pendingRentPayment) {
          pendingPayment = pendingRentPayment;
          paymentType = "rent";
        }

        // =================================================
        // PAYMENT INFORMATION MUST EXIST
        // =================================================

        if (!pendingPayment) {
          throw new Error(
            "The payment information could not be found. Please return to RentEase and try again.",
          );
        }

        // =================================================
        // REFERENCE SECURITY CHECK
        // =================================================

        if (
          pendingPayment.reference &&
          pendingPayment.reference !== reference
        ) {
          throw new Error(
            "The payment reference does not match the payment started from RentEase.",
          );
        }

        // =================================================
        // EXPECTED AMOUNT
        // =================================================

        const expectedAmount = Number(
          pendingPayment.amount || pendingPayment.paymentAmount || 0,
        );

        if (!expectedAmount || expectedAmount <= 0) {
          throw new Error("The expected payment amount could not be found.");
        }

        // =================================================
        // VERIFY WITH RENTEase BACKEND
        // =================================================

        const response = await fetch("/.netlify/functions/paystack-verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
            expectedAmount,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.status) {
          throw new Error(
            result.message || "Payment verification was unsuccessful.",
          );
        }

        const verifiedPayment = result.data;

        // =================================================
        // VERIFY CUSTOMER EMAIL
        // =================================================

        if (verifiedPayment?.customer?.email) {
          const verifiedEmail = verifiedPayment.customer.email.toLowerCase();

          const userEmail = user.email?.toLowerCase() || "";

          if (userEmail && verifiedEmail && verifiedEmail !== userEmail) {
            throw new Error(
              "The Paystack payment email does not match your RentEase account.",
            );
          }
        }

        // =================================================
        // APPLICATION INITIAL RENT PAYMENT
        // =================================================

        if (paymentType === "application_initial_rent") {
          if (!pendingPayment.applicationId) {
            throw new Error(
              "The application information for this payment could not be found.",
            );
          }

          if (pendingPayment.tenantId && pendingPayment.tenantId !== user.uid) {
            throw new Error(
              "You are not authorized to complete this application payment.",
            );
          }

          setMessage("Payment verified. Activating your tenancy...");

          // -----------------------------------------------
          // COMPLETE APPLICATION PAYMENT
          // -----------------------------------------------

          await markApplicationPaymentCompleted(
            pendingPayment.applicationId,
            verifiedPayment.reference,
          );

          // -----------------------------------------------
          // GET UPDATED APPLICATION
          // -----------------------------------------------

          const updatedApplications = await getMyApplications(user.uid);

          const updatedApplication = updatedApplications.find(
            (application) => application.id === pendingPayment.applicationId,
          );

          // -----------------------------------------------
          // CREATE RENT PAYMENT RECORD
          // -----------------------------------------------

          await createPayment({
            tenantId: user.uid,

            tenantName:
              pendingPayment.tenantName ||
              updatedApplication?.tenantName ||
              user.displayName ||
              "",

            tenancyId: updatedApplication?.tenancyId || null,

            applicationId: pendingPayment.applicationId,

            propertyId:
              pendingPayment.propertyId || updatedApplication?.propertyId || "",

            propertyTitle:
              pendingPayment.propertyTitle ||
              updatedApplication?.propertyTitle ||
              "Rental Property",

            amount: expectedAmount,

            transactionType: "rent",

            status: "successful",

            managerId:
              pendingPayment.landlordId ||
              updatedApplication?.managerId ||
              updatedApplication?.agentId ||
              updatedApplication?.landlordId ||
              null,

            managerRole:
              updatedApplication?.managerRole ||
              (updatedApplication?.agentId ? "agent" : "landlord"),

            managerName: updatedApplication?.managerName || "",

            paymentProvider: "paystack",

            paymentReference: verifiedPayment.reference,

            description: `Initial rent payment for ${
              pendingPayment.propertyTitle ||
              updatedApplication?.propertyTitle ||
              "rental property"
            }`,

            metadata: {
              paymentType: "application_initial_rent",

              applicationId: pendingPayment.applicationId,

              paystackReference: verifiedPayment.reference,

              paystackChannel: verifiedPayment.channel || "",

              paystackPaidAt: verifiedPayment.paidAt || null,
            },
          });

          // -----------------------------------------------
          // SAVE RECEIPT DATA
          // -----------------------------------------------

          setPaymentData({
            reference: verifiedPayment.reference,

            amount: verifiedPayment.amount / 100,

            currency: verifiedPayment.currency,

            channel: verifiedPayment.channel,

            paidAt: verifiedPayment.paidAt,

            paymentType: "application_initial_rent",

            propertyTitle:
              pendingPayment.propertyTitle ||
              updatedApplication?.propertyTitle ||
              "Rental Property",
          });

          // -----------------------------------------------
          // CLEAN APPLICATION PAYMENT SESSION
          // -----------------------------------------------

          sessionStorage.removeItem("rentease_pending_application_payment");

          setStatus("success");

          setMessage(
            "Your initial rent payment has been verified successfully. Your tenancy is now active.",
          );

          return;
        }

        // =================================================
        // RECURRING RENT PAYMENT
        // =================================================

        if (paymentType === "rent") {
          if (!pendingPayment.tenancyId) {
            throw new Error(
              "The rental information for this payment could not be found.",
            );
          }

          setMessage("Payment verified. Recording your rent payment...");

          await createRecurringRentPayment({
            tenancy: {
              id: pendingPayment.tenancyId,

              propertyId: pendingPayment.propertyId || "",

              propertyTitle: pendingPayment.propertyTitle || "Rental Property",

              rentFrequency: pendingPayment.rentFrequency || "",
            },

            tenantId: user.uid,

            paymentReference: verifiedPayment.reference,

            paymentMethod: verifiedPayment.channel || "paystack",
          });

          setPaymentData({
            reference: verifiedPayment.reference,

            amount: verifiedPayment.amount / 100,

            currency: verifiedPayment.currency,

            channel: verifiedPayment.channel,

            paidAt: verifiedPayment.paidAt,

            paymentType: "rent",

            propertyTitle: pendingPayment.propertyTitle || "Rental Property",
          });

          sessionStorage.removeItem("rentease_pending_rent_payment");

          setStatus("success");

          setMessage(
            "Your rent payment has been verified and recorded successfully.",
          );

          return;
        }

        throw new Error("The payment type could not be determined.");
      } catch (error) {
        console.error("Payment verification error:", error);

        setStatus("failed");

        setMessage(
          error?.message ||
            "We could not verify your payment. Please contact support if money was deducted.",
        );
      }
    }

    verifyPayment();
  }, [searchParams, user?.uid]);

  // =====================================================
  // VERIFYING
  // =====================================================

  if (status === "verifying") {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
          <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
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
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <FaSpinner size={32} className="animate-spin" />
              </div>

              <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                Verifying Payment
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {message}
              </p>

              <p className="mt-5 text-xs text-slate-400">
                Please don't close this page.
              </p>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // SUCCESS
  // =====================================================

  if (status === "success") {
    const isInitialPayment =
      paymentData?.paymentType === "application_initial_rent";

    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
          <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
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
              className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
              >
                <FaCheckCircle size={40} />
              </motion.div>

              <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                {isInitialPayment
                  ? "Rent Payment Successful"
                  : "Rent Payment Successful"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {message}
              </p>

              {isInitialPayment && (
                <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-left text-sm leading-6 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <strong>Your tenancy is now active.</strong>
                  <br />
                  The property has been assigned to you and marked as occupied.
                </div>
              )}

              {paymentData && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left dark:bg-slate-950">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <FaReceipt />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">
                        Payment Receipt
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Paystack verified
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {paymentData.propertyTitle && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">
                          Property
                        </span>

                        <span className="max-w-[220px] text-right font-medium text-slate-900 dark:text-white">
                          {paymentData.propertyTitle}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 dark:text-slate-400">
                        Amount
                      </span>

                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₦
                        {Number(paymentData.amount || 0).toLocaleString(
                          "en-NG",
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 dark:text-slate-400">
                        Reference
                      </span>

                      <span className="max-w-[220px] break-all text-right font-medium text-slate-900 dark:text-white">
                        {paymentData.reference}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 dark:text-slate-400">
                        Channel
                      </span>

                      <span className="font-medium capitalize text-slate-900 dark:text-white">
                        {paymentData.channel || "Paystack"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 dark:text-slate-400">
                        Date
                      </span>

                      <span className="font-medium text-slate-900 dark:text-white">
                        {paymentData.paidAt
                          ? new Date(paymentData.paidAt).toLocaleString("en-NG")
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    isInitialPayment
                      ? "/tenant/applications"
                      : "/tenant/payments",
                  )
                }
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
              >
                <FaArrowLeft />

                {isInitialPayment ? "Back to Applications" : "Back to Payments"}
              </button>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // FAILED
  // =====================================================

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <FaTimesCircle size={40} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              Payment Verification Failed
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {message}
            </p>

            <div className="mt-6 rounded-xl bg-amber-50 p-4 text-left text-sm leading-6 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              If your bank account was charged, don't make another payment
              immediately. Contact RentEase support so the transaction can be
              checked using your Paystack reference.
            </div>

            <button
              type="button"
              onClick={() => navigate("/tenant/applications")}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <FaArrowLeft />
              Back to Applications
            </button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PaymentCallback;
