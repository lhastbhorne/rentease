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
  SETTLEMENT_STATUS,
  SETTLEMENT_RECIPIENT_ROLE,
  SETTLEMENT_CURRENCY,
} from "./rentalConstants";

// =====================================================
// COLLECTION
// =====================================================

const SETTLEMENTS_COLLECTION = "settlements";

// =====================================================
// CREATE SETTLEMENT
// =====================================================
//
// This creates a settlement record.
//
// IMPORTANT:
// This does NOT transfer money.
//
// Actual money transfer will be handled later
// through the payment provider / settlement system.
//

export async function createSettlement(settlementData) {
  if (!settlementData) {
    throw new Error("Settlement information is required.");
  }

  if (!settlementData.recipientId) {
    throw new Error("Settlement recipient is required.");
  }

  if (!settlementData.recipientRole) {
    throw new Error("Settlement recipient role is required.");
  }

  if (
    !Object.values(SETTLEMENT_RECIPIENT_ROLE).includes(
      settlementData.recipientRole,
    )
  ) {
    throw new Error("Invalid settlement recipient role.");
  }

  if (settlementData.amount === undefined || settlementData.amount === null) {
    throw new Error("Settlement amount is required.");
  }

  const amount = Number(settlementData.amount);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Settlement amount must be a valid positive number.");
  }

  const settlement = {
    // =================================================
    // SETTLEMENT
    // =================================================

    status: settlementData.status || SETTLEMENT_STATUS.PENDING,

    currency: settlementData.currency || SETTLEMENT_CURRENCY.NGN,

    // =================================================
    // AMOUNTS
    // =================================================

    grossAmount: Number(settlementData.grossAmount ?? amount),

    platformFee: Number(settlementData.platformFee || 0),

    settlementAmount: amount,

    // =================================================
    // RECIPIENT
    // =================================================

    recipientId: settlementData.recipientId,

    recipientRole: settlementData.recipientRole,

    recipientName: settlementData.recipientName || "",

    // =================================================
    // PAYMENT
    // =================================================

    paymentId: settlementData.paymentId || null,

    paymentReference: settlementData.paymentReference || "",

    transactionId: settlementData.transactionId || null,

    // =================================================
    // RENTAL RELATIONSHIP
    // =================================================

    tenantId: settlementData.tenantId || null,

    propertyId: settlementData.propertyId || null,

    propertyTitle: settlementData.propertyTitle || "",

    applicationId: settlementData.applicationId || null,

    tenancyId: settlementData.tenancyId || null,

    // =================================================
    // SETTLEMENT REFERENCE
    // =================================================

    settlementReference: settlementData.settlementReference || "",

    provider: settlementData.provider || null,

    providerReference: settlementData.providerReference || "",

    // =================================================
    // BANK / PAYOUT INFORMATION
    // =================================================
    //
    // These fields are intentionally optional.
    //
    // Later, when we integrate the payment provider,
    // these can hold the provider's recipient/subaccount
    // reference.
    //

    recipientAccountId: settlementData.recipientAccountId || null,

    recipientBankName: settlementData.recipientBankName || "",

    recipientAccountName: settlementData.recipientAccountName || "",

    // =================================================
    // DESCRIPTION
    // =================================================

    description: settlementData.description || "Rental payment settlement",

    // =================================================
    // TIMESTAMPS
    // =================================================

    processedAt: settlementData.processedAt || null,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  const settlementRef = await addDoc(
    collection(db, SETTLEMENTS_COLLECTION),
    settlement,
  );

  return {
    id: settlementRef.id,
    ...settlement,
  };
}

// =====================================================
// GET SETTLEMENT BY ID
// =====================================================

export async function getSettlementById(settlementId) {
  if (!settlementId) {
    throw new Error("Settlement ID is required.");
  }

  const settlementRef = doc(db, SETTLEMENTS_COLLECTION, settlementId);

  const snapshot = await getDoc(settlementRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// =====================================================
// GET LANDLORD SETTLEMENTS
// =====================================================

export async function getLandlordSettlements(landlordId) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, SETTLEMENTS_COLLECTION),
    where("recipientId", "==", landlordId),
    where("recipientRole", "==", SETTLEMENT_RECIPIENT_ROLE.LANDLORD),
  );

  const snapshot = await getDocs(q);

  const settlements = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  settlements.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return settlements;
}

// =====================================================
// GET AGENT SETTLEMENTS
// =====================================================

export async function getAgentSettlements(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, SETTLEMENTS_COLLECTION),
    where("recipientId", "==", agentId),
    where("recipientRole", "==", SETTLEMENT_RECIPIENT_ROLE.AGENT),
  );

  const snapshot = await getDocs(q);

  const settlements = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  settlements.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return settlements;
}

// =====================================================
// GET TENANT SETTLEMENTS
// =====================================================
//
// Mostly useful for admin/audit purposes.
//

export async function getTenantSettlements(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, SETTLEMENTS_COLLECTION),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const settlements = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  settlements.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return settlements;
}

// =====================================================
// GET PROPERTY SETTLEMENTS
// =====================================================

export async function getPropertySettlements(propertyId) {
  if (!propertyId) {
    return [];
  }

  const q = query(
    collection(db, SETTLEMENTS_COLLECTION),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  const settlements = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  settlements.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return settlements;
}

// =====================================================
// GET TENANCY SETTLEMENTS
// =====================================================

export async function getTenancySettlements(tenancyId) {
  if (!tenancyId) {
    return [];
  }

  const q = query(
    collection(db, SETTLEMENTS_COLLECTION),
    where("tenancyId", "==", tenancyId),
  );

  const snapshot = await getDocs(q);

  const settlements = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  settlements.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return settlements;
}

// =====================================================
// GET ALL SETTLEMENTS
// =====================================================

export async function getAllSettlements() {
  const snapshot = await getDocs(collection(db, SETTLEMENTS_COLLECTION));

  const settlements = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  settlements.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return settlements;
}

// =====================================================
// UPDATE SETTLEMENT STATUS
// =====================================================

export async function updateSettlementStatus(settlementId, status) {
  if (!settlementId) {
    throw new Error("Settlement ID is required.");
  }

  if (!Object.values(SETTLEMENT_STATUS).includes(status)) {
    throw new Error("Invalid settlement status.");
  }

  await updateDoc(doc(db, SETTLEMENTS_COLLECTION, settlementId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// MARK SETTLEMENT AS PROCESSING
// =====================================================

export async function markSettlementProcessing(settlementId) {
  await updateSettlementStatus(settlementId, SETTLEMENT_STATUS.PROCESSING);
}

// =====================================================
// MARK SETTLEMENT AS SUCCESSFUL
// =====================================================

export async function markSettlementSuccessful(
  settlementId,
  providerReference = "",
) {
  if (!settlementId) {
    throw new Error("Settlement ID is required.");
  }

  await updateDoc(doc(db, SETTLEMENTS_COLLECTION, settlementId), {
    status: SETTLEMENT_STATUS.SUCCESSFUL,

    providerReference,

    processedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// MARK SETTLEMENT AS FAILED
// =====================================================

export async function markSettlementFailed(settlementId) {
  await updateSettlementStatus(settlementId, SETTLEMENT_STATUS.FAILED);
}

// =====================================================
// CANCEL SETTLEMENT
// =====================================================

export async function cancelSettlement(settlementId) {
  await updateSettlementStatus(settlementId, SETTLEMENT_STATUS.CANCELLED);
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
