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

import { REFUND_STATUS, REFUND_REASON } from "./rentalConstants";

// =====================================================
// COLLECTION
// =====================================================

const REFUNDS_COLLECTION = "refunds";

// =====================================================
// CREATE REFUND REQUEST
// =====================================================

export async function createRefundRequest(refundData) {
  if (!refundData) {
    throw new Error("Refund information is required.");
  }

  if (!refundData.tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!refundData.amount) {
    throw new Error("Refund amount is required.");
  }

  const amount = Number(refundData.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Refund amount must be greater than zero.");
  }

  if (!refundData.reason) {
    throw new Error("Refund reason is required.");
  }

  if (!Object.values(REFUND_REASON).includes(refundData.reason)) {
    throw new Error("Invalid refund reason.");
  }

  const refund = {
    // =================================================
    // REFUND
    // =================================================

    status: REFUND_STATUS.REQUESTED,

    reason: refundData.reason,

    reasonDescription: refundData.reasonDescription || "",

    amount,

    currency: refundData.currency || "NGN",

    // =================================================
    // TENANT
    // =================================================

    tenantId: refundData.tenantId,

    tenantName: refundData.tenantName || "",

    tenantEmail: refundData.tenantEmail || "",

    // =================================================
    // PROPERTY
    // =================================================

    propertyId: refundData.propertyId || null,

    propertyTitle: refundData.propertyTitle || "",

    // =================================================
    // TENANCY
    // =================================================

    tenancyId: refundData.tenancyId || null,

    // =================================================
    // APPLICATION
    // =================================================

    applicationId: refundData.applicationId || null,

    // =================================================
    // ORIGINAL PAYMENT
    // =================================================

    paymentId: refundData.paymentId || null,

    paymentReference: refundData.paymentReference || "",

    transactionId: refundData.transactionId || null,

    // =================================================
    // REQUESTED BY
    // =================================================

    requestedBy: refundData.requestedBy || refundData.tenantId,

    requestedByRole: refundData.requestedByRole || "tenant",

    // =================================================
    // APPROVAL
    // =================================================

    approvedBy: refundData.approvedBy || null,

    approvedByRole: refundData.approvedByRole || null,

    approvedAt: refundData.approvedAt || null,

    rejectionReason: refundData.rejectionReason || null,

    // =================================================
    // REFUND PROCESSING
    // =================================================

    refundReference: refundData.refundReference || "",

    provider: refundData.provider || null,

    providerReference: refundData.providerReference || "",

    processedAt: refundData.processedAt || null,

    // =================================================
    // TIMESTAMPS
    // =================================================

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  const refundRef = await addDoc(collection(db, REFUNDS_COLLECTION), refund);

  return {
    id: refundRef.id,
    ...refund,
  };
}

// =====================================================
// GET REFUND BY ID
// =====================================================

export async function getRefundById(refundId) {
  if (!refundId) {
    throw new Error("Refund ID is required.");
  }

  const refundRef = doc(db, REFUNDS_COLLECTION, refundId);

  const snapshot = await getDoc(refundRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// =====================================================
// GET TENANT REFUNDS
// =====================================================

export async function getTenantRefunds(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, REFUNDS_COLLECTION),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET TENANCY REFUNDS
// =====================================================

export async function getTenancyRefunds(tenancyId) {
  if (!tenancyId) {
    return [];
  }

  const q = query(
    collection(db, REFUNDS_COLLECTION),
    where("tenancyId", "==", tenancyId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET PROPERTY REFUNDS
// =====================================================

export async function getPropertyRefunds(propertyId) {
  if (!propertyId) {
    return [];
  }

  const q = query(
    collection(db, REFUNDS_COLLECTION),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET ALL REFUNDS
// =====================================================

export async function getAllRefunds() {
  const snapshot = await getDocs(collection(db, REFUNDS_COLLECTION));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// UPDATE REFUND STATUS
// =====================================================

export async function updateRefundStatus(refundId, status) {
  if (!refundId) {
    throw new Error("Refund ID is required.");
  }

  if (!Object.values(REFUND_STATUS).includes(status)) {
    throw new Error("Invalid refund status.");
  }

  await updateDoc(doc(db, REFUNDS_COLLECTION, refundId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// APPROVE REFUND
// =====================================================

export async function approveRefund(
  refundId,
  approvedBy,
  approvedByRole = "admin",
) {
  if (!refundId) {
    throw new Error("Refund ID is required.");
  }

  if (!approvedBy) {
    throw new Error("Approver ID is required.");
  }

  await updateDoc(doc(db, REFUNDS_COLLECTION, refundId), {
    status: REFUND_STATUS.PENDING,

    approvedBy,

    approvedByRole,

    approvedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// REJECT REFUND
// =====================================================

export async function rejectRefund(refundId, approvedBy, rejectionReason = "") {
  if (!refundId) {
    throw new Error("Refund ID is required.");
  }

  if (!approvedBy) {
    throw new Error("Approver ID is required.");
  }

  await updateDoc(doc(db, REFUNDS_COLLECTION, refundId), {
    status: REFUND_STATUS.REJECTED,

    approvedBy,

    approvedByRole: "admin",

    approvedAt: serverTimestamp(),

    rejectionReason,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// MARK REFUND AS PROCESSING
// =====================================================

export async function markRefundProcessing(refundId) {
  await updateRefundStatus(refundId, REFUND_STATUS.PROCESSING);
}

// =====================================================
// MARK REFUND AS SUCCESSFUL
// =====================================================

export async function markRefundSuccessful(refundId, providerReference = "") {
  if (!refundId) {
    throw new Error("Refund ID is required.");
  }

  await updateDoc(doc(db, REFUNDS_COLLECTION, refundId), {
    status: REFUND_STATUS.SUCCESSFUL,

    providerReference,

    refundReference: providerReference,

    processedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// MARK REFUND AS FAILED
// =====================================================

export async function markRefundFailed(refundId) {
  await updateRefundStatus(refundId, REFUND_STATUS.FAILED);
}

// =====================================================
// CANCEL REFUND
// =====================================================

export async function cancelRefund(refundId) {
  await updateRefundStatus(refundId, REFUND_STATUS.CANCELLED);
}
