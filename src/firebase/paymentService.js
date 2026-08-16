import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "./firestore";

// ==========================================
// CREATE PAYMENT RECORD
// ==========================================

export async function createPayment(paymentData) {
  const paymentRef = await addDoc(collection(db, "payments"), {
    ...paymentData,

    status: "successful",

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  return paymentRef.id;
}

// ==========================================
// GET TENANT PAYMENTS
// ==========================================

export async function getMyPayments(tenantId) {
  const q = query(
    collection(db, "payments"),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const payments = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  // Newest first
  payments.sort((a, b) => {
    const dateA = getPaymentDate(a);
    const dateB = getPaymentDate(b);

    return dateB - dateA;
  });

  return payments;
}

// ==========================================
// GET PAYMENT DATE
// ==========================================

function getPaymentDate(payment) {
  if (!payment.createdAt) {
    return 0;
  }

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
}
