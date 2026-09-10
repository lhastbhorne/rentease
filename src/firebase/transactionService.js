import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firestore";

import {
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_CURRENCY,
} from "./rentalConstants";

// =====================================================
// COLLECTION
// =====================================================

const TRANSACTIONS_COLLECTION = "transactions";

// =====================================================
// CREATE TRANSACTION
// =====================================================
//
// Creates a financial ledger record.
//
// This function does NOT process the actual payment.
// Payment processing will continue to be handled by
// the payment system.
//
// This records what happened financially.
//

export async function createTransaction(transactionData) {
  if (!transactionData) {
    throw new Error("Transaction information is required.");
  }

  if (!transactionData.type) {
    throw new Error("Transaction type is required.");
  }

  if (!Object.values(TRANSACTION_TYPE).includes(transactionData.type)) {
    throw new Error("Invalid transaction type.");
  }

  if (transactionData.amount === undefined || transactionData.amount === null) {
    throw new Error("Transaction amount is required.");
  }

  const amount = Number(transactionData.amount);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Transaction amount must be a valid positive number.");
  }

  const transaction = {
    // =================================================
    // TRANSACTION
    // =================================================

    type: transactionData.type,

    status: transactionData.status || TRANSACTION_STATUS.PENDING,

    currency: transactionData.currency || TRANSACTION_CURRENCY.NGN,

    // =================================================
    // MONEY
    // =================================================

    amount,

    platformFee: Number(transactionData.platformFee || 0),

    netAmount:
      transactionData.netAmount !== undefined
        ? Number(transactionData.netAmount)
        : amount,

    // =================================================
    // PAYER
    // =================================================

    payerId: transactionData.payerId || null,

    payerRole: transactionData.payerRole || null,

    payerName: transactionData.payerName || "",

    // =================================================
    // RECIPIENT / MANAGER
    // =================================================

    recipientId: transactionData.recipientId || null,

    recipientRole: transactionData.recipientRole || null,

    recipientName: transactionData.recipientName || "",

    // =================================================
    // PROPERTY
    // =================================================

    propertyId: transactionData.propertyId || null,

    propertyTitle: transactionData.propertyTitle || "",

    // =================================================
    // TENANCY
    // =================================================

    tenancyId: transactionData.tenancyId || null,

    // =================================================
    // APPLICATION
    // =================================================

    applicationId: transactionData.applicationId || null,

    // =================================================
    // PAYMENT
    // =================================================

    paymentId: transactionData.paymentId || null,

    paymentReference: transactionData.paymentReference || "",

    paymentMethod: transactionData.paymentMethod || null,

    paymentProvider: transactionData.paymentProvider || null,

    // =================================================
    // DESCRIPTION
    // =================================================

    description: transactionData.description || "",

    // =================================================
    // ADDITIONAL REFERENCE
    // =================================================

    relatedId: transactionData.relatedId || null,

    relatedType: transactionData.relatedType || null,

    // =================================================
    // SETTLEMENT
    // =================================================

    settlementStatus: transactionData.settlementStatus || "not_started",

    settlementId: transactionData.settlementId || null,

    settledAt: transactionData.settledAt || null,

    // =================================================
    // REFUND
    // =================================================

    refundStatus: transactionData.refundStatus || "not_requested",

    refundAmount: Number(transactionData.refundAmount || 0),

    refundReference: transactionData.refundReference || "",

    // =================================================
    // TIMESTAMPS
    // =================================================

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  const transactionRef = await addDoc(
    collection(db, TRANSACTIONS_COLLECTION),
    transaction,
  );

  return {
    id: transactionRef.id,
    ...transaction,
  };
}

// =====================================================
// GET TRANSACTION BY ID
// =====================================================

export async function getTransactionById(transactionId) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

  const snapshot = await getDoc(transactionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// =====================================================
// GET TENANT TRANSACTIONS
// =====================================================

export async function getTenantTransactions(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where("payerId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  transactions.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return transactions;
}

// =====================================================
// GET LANDLORD TRANSACTIONS
// =====================================================

export async function getLandlordTransactions(landlordId) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where("recipientId", "==", landlordId),
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  transactions.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return transactions;
}

// =====================================================
// GET AGENT TRANSACTIONS
// =====================================================

export async function getAgentTransactions(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where("recipientId", "==", agentId),
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  transactions.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return transactions;
}

// =====================================================
// GET PROPERTY TRANSACTIONS
// =====================================================

export async function getPropertyTransactions(propertyId) {
  if (!propertyId) {
    return [];
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  transactions.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return transactions;
}

// =====================================================
// GET TENANCY TRANSACTIONS
// =====================================================

export async function getTenancyTransactions(tenancyId) {
  if (!tenancyId) {
    return [];
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where("tenancyId", "==", tenancyId),
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  transactions.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return transactions;
}

// =====================================================
// GET APPLICATION TRANSACTIONS
// =====================================================

export async function getApplicationTransactions(applicationId) {
  if (!applicationId) {
    return [];
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where("applicationId", "==", applicationId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET TRANSACTIONS BY TYPE
// =====================================================

export async function getTransactionsByType(type) {
  if (!type) {
    return [];
  }

  if (!Object.values(TRANSACTION_TYPE).includes(type)) {
    throw new Error("Invalid transaction type.");
  }

  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where("type", "==", type),
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  transactions.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return transactions;
}

// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

export async function getAllTransactions() {
  const snapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));

  const transactions = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  transactions.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return transactions;
}

// =====================================================
// UPDATE TRANSACTION STATUS
// =====================================================

export async function updateTransactionStatus(transactionId, status) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  if (!Object.values(TRANSACTION_STATUS).includes(status)) {
    throw new Error("Invalid transaction status.");
  }

  await updateDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// UPDATE SETTLEMENT
// =====================================================

export async function updateTransactionSettlement(
  transactionId,
  { settlementStatus, settlementId = null, settledAt = null } = {},
) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  await updateDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId), {
    settlementStatus: settlementStatus || "not_started",

    settlementId,

    settledAt,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// UPDATE REFUND
// =====================================================

export async function updateTransactionRefund(
  transactionId,
  { refundStatus, refundAmount = 0, refundReference = "" } = {},
) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  await updateDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId), {
    refundStatus: refundStatus || "not_requested",

    refundAmount: Number(refundAmount || 0),

    refundReference,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// TIMESTAMP HELPER
// =====================================================

function getTimestamp(value) {
  if (!value) {
    return 0;
  }

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  return 0;
}
