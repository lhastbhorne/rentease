import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTenancy } from "../../firebase/tenancyService";
import { createPayment, getMyPayments } from "../../firebase/paymentService";

function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tenancy, setTenancy] = useState(null);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function loadPaymentData() {
      if (!user?.uid) return;

      try {
        setLoading(true);

        const [tenancyData, paymentData] = await Promise.all([
          getMyTenancy(user.uid),
          getMyPayments(user.uid),
        ]);

        setTenancy(tenancyData);
        setPayments(paymentData);
      } catch (error) {
        console.error("Error loading payment data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPaymentData();
  }, [user]);

  // ==========================================
  // DEMO PAYMENT
  // ==========================================

  async function handlePayment() {
    if (!tenancy) {
      alert("You don't have an active rental.");

      return;
    }

    try {
      setPaying(true);

      /*
       * TEMPORARY DEMO PAYMENT
       *
       * This creates a successful payment
       * record in Firestore.
       *
       * We will replace this with Paystack
       * when the real gateway is connected.
       */

      const paymentId = await createPayment({
        tenantId: user.uid,

        tenantName: tenancy.tenantName || "",

        landlordId: tenancy.landlordId || "",

        propertyId: tenancy.propertyId || "",

        propertyTitle: tenancy.propertyTitle || "",

        tenancyId: tenancy.id,

        amount: Number(tenancy.rentAmount) || 0,

        currency: "NGN",

        paymentType: "rent",

        reference: `RENT-${Date.now()}`,

        paymentMethod: "demo",
      });

      alert("Payment recorded successfully!");

      const updatedPayments = await getMyPayments(user.uid);

      setPayments(updatedPayments);

      console.log("Payment ID:", paymentId);
    } catch (error) {
      console.error("Payment error:", error);

      alert("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-slate-500">Loading payment information...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!tenancy) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <FaMoneyBillWave size={45} className="mx-auto text-blue-600" />

          <h1 className="mt-5 text-2xl font-bold text-slate-800">
            No Active Rental
          </h1>

          <p className="mt-3 text-slate-500">
            You need an active rental before you can make a rent payment.
          </p>

          <button
            onClick={() => navigate("/tenant/my-rental")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to My Rental
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/tenant/my-rental")}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <FaArrowLeft />
            Back to My Rental
          </button>

          <h1 className="text-3xl font-bold text-slate-800">Rent Payments</h1>

          <p className="mt-2 text-slate-500">
            Manage your rental payments through RentEase.
          </p>
        </div>

        {/* Current Rent */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-500">Current Rental</p>

              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {tenancy.propertyTitle}
              </h2>

              <p className="mt-2 text-slate-500">Rent Amount</p>

              <p className="mt-1 text-3xl font-bold text-blue-600">
                ₦{Number(tenancy.rentAmount || 0).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={paying}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaMoneyBillWave />

              {paying ? "Processing..." : "Pay Rent"}
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Payment History
          </h2>

          {payments.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-slate-500">No rent payments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {payment.propertyTitle || "Rental Payment"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Reference: {payment.reference || payment.id}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Method: {payment.paymentMethod || "N/A"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xl font-bold text-slate-800">
                      ₦{Number(payment.amount || 0).toLocaleString()}
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      <FaCheckCircle />
                      {payment.status || "successful"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Payments;
