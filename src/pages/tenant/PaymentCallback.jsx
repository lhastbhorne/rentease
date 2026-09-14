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
import { createRecurringRentPayment } from "../../firebase/paymentService";

// =====================================================
// PAGE
// =====================================================

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

        // -------------------------------------------------
        // Get pending payment information
        // -------------------------------------------------

        const storedPayment = sessionStorage.getItem(
          "rentease_pending_rent_payment",
        );

        let pendingPayment = null;

        if (storedPayment) {
          try {
            pendingPayment = JSON.parse(storedPayment);
          } catch (error) {
            console.error("Unable to parse pending payment:", error);
          }
        }

        // -------------------------------------------------
        // Make sure the returned reference matches
        // the payment we started.
        // -------------------------------------------------

        if (
          pendingPayment?.reference &&
          pendingPayment.reference !== reference
        ) {
          setStatus("failed");
          setMessage(
            "The payment reference does not match the payment started from RentEase.",
          );
          return;
        }

        const expectedAmount = Number(pendingPayment?.amount || 0);

        if (!expectedAmount) {
          setStatus("failed");
          setMessage("The expected payment amount could not be found.");
          return;
        }

        // -------------------------------------------------
        // Verify with RentEase backend
        // -------------------------------------------------

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

        // -------------------------------------------------
        // Security check
        // -------------------------------------------------

        if (verifiedPayment?.customer?.email) {
          const verifiedEmail = verifiedPayment.customer.email.toLowerCase();

          const userEmail = user.email?.toLowerCase() || "";

          if (userEmail && verifiedEmail && verifiedEmail !== userEmail) {
            throw new Error(
              "The Paystack payment email does not match your RentEase account.",
            );
          }
        }

        // -------------------------------------------------
        // Create Firestore payment record
        // ONLY AFTER successful Paystack verification.
        // -------------------------------------------------

        if (!pendingPayment?.tenancyId) {
          throw new Error(
            "The rental information for this payment could not be found.",
          );
        }

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

        // -------------------------------------------------
        // Save verified payment information
        // -------------------------------------------------

        setPaymentData({
          reference: verifiedPayment.reference,
          amount: verifiedPayment.amount / 100,
          currency: verifiedPayment.currency,
          channel: verifiedPayment.channel,
          paidAt: verifiedPayment.paidAt,
        });

        // -------------------------------------------------
        // Remove pending payment
        // -------------------------------------------------

        sessionStorage.removeItem("rentease_pending_rent_payment");

        setStatus("success");
        setMessage(
          "Your rent payment has been verified and recorded successfully.",
        );
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
                Rent Payment Successful
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {message}
              </p>

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
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 dark:text-slate-400">
                        Amount
                      </span>

                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₦{Number(paymentData.amount || 0).toLocaleString()}
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
                onClick={() => navigate("/tenant/payments")}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
              >
                <FaArrowLeft />
                Back to Payments
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
              onClick={() => navigate("/tenant/payments")}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <FaArrowLeft />
              Back to Payments
            </button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PaymentCallback;
