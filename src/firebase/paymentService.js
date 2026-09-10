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
  runTransaction,
} from "firebase/firestore";

import { db } from "./firestore";

import {
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  PLATFORM_FEE_RATE,
  TRANSACTION_CURRENCY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  RENT_FREQUENCY,
} from "./rentalConstants";

// =====================================================
// COLLECTIONS
// =====================================================

const PAYMENTS_COLLECTION = "payments";
const TRANSACTIONS_COLLECTION = "transactions";
const TENANCIES_COLLECTION = "tenancies";

// =====================================================
// CALCULATE PLATFORM FEE
// =====================================================

export function calculatePlatformFee(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw new Error("Invalid payment amount.");
  }

  return Math.round(numericAmount * PLATFORM_FEE_RATE);
}

// =====================================================
// CALCULATE RENT DISTRIBUTION
// =====================================================

export function calculateRentDistribution(amount) {
  const grossAmount = Number(amount);

  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    throw new Error("A valid payment amount is required.");
  }

  const platformFee = calculatePlatformFee(grossAmount);

  const managerAmount = grossAmount - platformFee;

  return {
    grossAmount,

    platformFee,

    platformFeeRate: PLATFORM_FEE_RATE,

    managerAmount,

    currency: TRANSACTION_CURRENCY.NGN,
  };
}

// =====================================================
// CREATE PAYMENT RECORD
// =====================================================

export async function createPayment(paymentData) {
  if (!paymentData) {
    throw new Error("Payment information is required.");
  }

  if (!paymentData.tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!paymentData.amount) {
    throw new Error("Payment amount is required.");
  }

  const amount = Number(paymentData.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const paymentType =
    paymentData.transactionType || paymentData.type || TRANSACTION_TYPE.RENT;

  // ===================================================
  // FINANCIAL BREAKDOWN
  // ===================================================

  let financialBreakdown = {
    grossAmount: amount,

    platformFee: 0,

    platformFeeRate: 0,

    managerAmount: amount,

    currency: paymentData.currency || TRANSACTION_CURRENCY.NGN,
  };

  if (paymentType === TRANSACTION_TYPE.RENT) {
    financialBreakdown = calculateRentDistribution(amount);
  }

  // ===================================================
  // PAYMENT RECORD
  // ===================================================

  const payment = {
    // -------------------------------------------------
    // PAYMENT
    // -------------------------------------------------

    tenantId: paymentData.tenantId,

    tenantName: paymentData.tenantName || "",

    tenancyId: paymentData.tenancyId || null,

    applicationId: paymentData.applicationId || null,

    propertyId: paymentData.propertyId || null,

    propertyTitle: paymentData.propertyTitle || "",

    paymentType,

    status: paymentData.status || PAYMENT_STATUS.SUCCESSFUL,

    // -------------------------------------------------
    // AMOUNT
    // -------------------------------------------------

    amount,

    grossAmount: financialBreakdown.grossAmount,

    platformFee: financialBreakdown.platformFee,

    platformFeeRate: financialBreakdown.platformFeeRate,

    managerAmount: financialBreakdown.managerAmount,

    currency: financialBreakdown.currency,

    // -------------------------------------------------
    // MANAGER
    // -------------------------------------------------

    managerId:
      paymentData.managerId ||
      paymentData.landlordId ||
      paymentData.agentId ||
      null,

    managerRole: paymentData.managerRole || null,

    managerName: paymentData.managerName || "",

    // -------------------------------------------------
    // PAYMENT PROVIDER
    // -------------------------------------------------

    paymentProvider: paymentData.paymentProvider || PAYMENT_PROVIDER.PAYSTACK,

    paymentReference: paymentData.paymentReference || "",

    // -------------------------------------------------
    // RENT PERIOD
    // -------------------------------------------------

    rentPeriodStart: paymentData.rentPeriodStart || null,

    rentPeriodEnd: paymentData.rentPeriodEnd || null,

    rentPaymentNumber: paymentData.rentPaymentNumber || null,

    rentFrequency: paymentData.rentFrequency || null,

    // -------------------------------------------------
    // ADDITIONAL INFORMATION
    // -------------------------------------------------

    description: paymentData.description || "",

    metadata: paymentData.metadata || {},

    // -------------------------------------------------
    // TIMESTAMPS
    // -------------------------------------------------

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  const paymentRef = await addDoc(collection(db, PAYMENTS_COLLECTION), payment);

  // ===================================================
  // CREATE TRANSACTION LEDGER RECORD
  // ===================================================

  const transaction = {
    // -------------------------------------------------
    // TRANSACTION
    // -------------------------------------------------

    type: paymentType,

    status:
      payment.status === PAYMENT_STATUS.SUCCESSFUL
        ? TRANSACTION_STATUS.SUCCESSFUL
        : TRANSACTION_STATUS.PENDING,

    // -------------------------------------------------
    // PEOPLE
    // -------------------------------------------------

    payerId: paymentData.tenantId,

    payerRole: "tenant",

    recipientId:
      paymentData.managerId ||
      paymentData.landlordId ||
      paymentData.agentId ||
      null,

    recipientRole: paymentData.managerRole || null,

    // -------------------------------------------------
    // RENTAL REFERENCES
    // -------------------------------------------------

    paymentId: paymentRef.id,

    tenancyId: paymentData.tenancyId || null,

    applicationId: paymentData.applicationId || null,

    propertyId: paymentData.propertyId || null,

    // -------------------------------------------------
    // MONEY
    // -------------------------------------------------

    grossAmount: financialBreakdown.grossAmount,

    platformFee: financialBreakdown.platformFee,

    platformFeeRate: financialBreakdown.platformFeeRate,

    recipientAmount: financialBreakdown.managerAmount,

    currency: financialBreakdown.currency,

    // -------------------------------------------------
    // RENT PERIOD
    // -------------------------------------------------

    rentPeriodStart: paymentData.rentPeriodStart || null,

    rentPeriodEnd: paymentData.rentPeriodEnd || null,

    // -------------------------------------------------
    // PROVIDER
    // -------------------------------------------------

    paymentProvider: paymentData.paymentProvider || PAYMENT_PROVIDER.PAYSTACK,

    paymentReference: paymentData.paymentReference || "",

    // -------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------

    description: paymentData.description || "RentEase transaction",

    metadata: paymentData.metadata || {},

    // -------------------------------------------------
    // TIMESTAMPS
    // -------------------------------------------------

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  const transactionRef = await addDoc(
    collection(db, TRANSACTIONS_COLLECTION),
    transaction,
  );

  return {
    paymentId: paymentRef.id,

    transactionId: transactionRef.id,

    ...payment,

    createdAt: undefined,

    updatedAt: undefined,
  };
}

// =====================================================
// CREATE RECURRING RENT PAYMENT
// =====================================================
//
// This handles rent payments AFTER the initial tenancy.
//
// Flow:
//
// Tenant opens rent payment
//        ↓
// Current rent period checked
//        ↓
// Duplicate payment checked
//        ↓
// Payment created
//        ↓
// 5% RentEase fee calculated
//        ↓
// Transaction ledger created
//        ↓
// Tenancy moves to next rent period
//
// =====================================================

export async function createRecurringRentPayment({
  tenancy,
  tenantId,
  paymentReference,
  paymentMethod = "demo-card",
}) {
  if (!tenancy?.id) {
    throw new Error("Tenancy information is required.");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!paymentReference) {
    throw new Error("Payment reference is required.");
  }

  if (tenancy.tenantId && tenancy.tenantId !== tenantId) {
    throw new Error("You are not authorized to pay for this tenancy.");
  }

  if (tenancy.status !== "active") {
    throw new Error("This tenancy is not active.");
  }

  const rentAmount = Number(tenancy.rentAmount);

  if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
    throw new Error("This tenancy does not have a valid rent amount.");
  }

  // ===================================================
  // CURRENT RENT PERIOD
  // ===================================================

  const rentPeriodStart = tenancy.currentRentPeriodStart;

  const rentPeriodEnd = tenancy.currentRentPeriodEnd;

  if (!rentPeriodStart || !rentPeriodEnd) {
    throw new Error("This tenancy does not have a valid rent period.");
  }

  // ===================================================
  // PREVENT DUPLICATE PAYMENT
  // ===================================================

  const duplicateQuery = query(
    collection(db, PAYMENTS_COLLECTION),
    where("tenancyId", "==", tenancy.id),
    where("rentPeriodStart", "==", rentPeriodStart),
    where("rentPeriodEnd", "==", rentPeriodEnd),
  );

  const duplicateSnapshot = await getDocs(duplicateQuery);

  const successfulDuplicate = duplicateSnapshot.docs.some((paymentDoc) => {
    const data = paymentDoc.data();

    return data.status === PAYMENT_STATUS.SUCCESSFUL;
  });

  if (successfulDuplicate) {
    throw new Error("This rent period has already been paid.");
  }

  // ===================================================
  // CALCULATE FINANCIALS
  // ===================================================

  const financialBreakdown = calculateRentDistribution(rentAmount);

  // ===================================================
  // CALCULATE NEXT PERIOD
  // ===================================================

  const nextPeriodStart = new Date(tenancy.nextRentDueDate);

  if (Number.isNaN(nextPeriodStart.getTime())) {
    throw new Error("The next rent due date is invalid.");
  }

  const nextPeriodEnd = calculateRentPeriodEnd(
    nextPeriodStart,
    tenancy.rentFrequency,
  );

  const nextRentDueDate = calculateNextRentDueDate(
    nextPeriodStart,
    tenancy.rentFrequency,
  );

  const formattedNextPeriodStart = formatDate(nextPeriodStart);

  const formattedNextPeriodEnd = formatDate(nextPeriodEnd);

  const formattedNextRentDueDate = formatDate(nextRentDueDate);

  // ===================================================
  // PAYMENT + TENANCY UPDATE
  // ===================================================

  const paymentRef = doc(collection(db, PAYMENTS_COLLECTION));

  const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));

  const tenancyRef = doc(db, TENANCIES_COLLECTION, tenancy.id);

  let paymentNumber = Number(tenancy.rentPaymentCount) || 1;

  paymentNumber += 1;

  await runTransaction(db, async (transaction) => {
    // =============================================
    // RE-READ TENANCY
    // =============================================

    const tenancySnapshot = await transaction.get(tenancyRef);

    if (!tenancySnapshot.exists()) {
      throw new Error("Tenancy no longer exists.");
    }

    const currentTenancy = tenancySnapshot.data();

    if (currentTenancy.tenantId !== tenantId) {
      throw new Error("You are not authorized to pay for this tenancy.");
    }

    if (currentTenancy.status !== "active") {
      throw new Error("This tenancy is no longer active.");
    }

    // =============================================
    // ENSURE PERIOD HAS NOT CHANGED
    // =============================================

    if (
      currentTenancy.currentRentPeriodStart !== rentPeriodStart ||
      currentTenancy.currentRentPeriodEnd !== rentPeriodEnd
    ) {
      throw new Error(
        "The rent period has changed. Please refresh and try again.",
      );
    }

    // =============================================
    // PAYMENT RECORD
    // =============================================

    transaction.set(paymentRef, {
      tenantId,

      tenantName: tenancy.tenantName || "",

      tenancyId: tenancy.id,

      applicationId: tenancy.applicationId || null,

      propertyId: tenancy.propertyId || null,

      propertyTitle: tenancy.propertyTitle || "",

      paymentType: TRANSACTION_TYPE.RENT,

      status: PAYMENT_STATUS.SUCCESSFUL,

      amount: rentAmount,

      grossAmount: financialBreakdown.grossAmount,

      platformFee: financialBreakdown.platformFee,

      platformFeeRate: financialBreakdown.platformFeeRate,

      managerAmount: financialBreakdown.managerAmount,

      currency: TRANSACTION_CURRENCY.NGN,

      managerId:
        tenancy.managerId || tenancy.landlordId || tenancy.agentId || null,

      managerRole: tenancy.managerRole || null,

      managerName: tenancy.managerName || "",

      paymentProvider: PAYMENT_PROVIDER.PAYSTACK,

      paymentReference,

      paymentMethod,

      rentPeriodStart,

      rentPeriodEnd,

      rentPaymentNumber: paymentNumber,

      rentFrequency: tenancy.rentFrequency || null,

      description: `Rent payment for ${
        tenancy.propertyTitle || "rental property"
      }`,

      metadata: {
        recurring: true,
        tenancyId: tenancy.id,
      },

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });

    // =============================================
    // TRANSACTION LEDGER
    // =============================================

    transaction.set(transactionRef, {
      type: TRANSACTION_TYPE.RENT,

      status: TRANSACTION_STATUS.SUCCESSFUL,

      payerId: tenantId,

      payerRole: "tenant",

      recipientId:
        tenancy.managerId || tenancy.landlordId || tenancy.agentId || null,

      recipientRole: tenancy.managerRole || null,

      paymentId: paymentRef.id,

      tenancyId: tenancy.id,

      applicationId: tenancy.applicationId || null,

      propertyId: tenancy.propertyId || null,

      grossAmount: financialBreakdown.grossAmount,

      platformFee: financialBreakdown.platformFee,

      platformFeeRate: financialBreakdown.platformFeeRate,

      recipientAmount: financialBreakdown.managerAmount,

      currency: TRANSACTION_CURRENCY.NGN,

      paymentProvider: PAYMENT_PROVIDER.PAYSTACK,

      paymentReference,

      rentPeriodStart,

      rentPeriodEnd,

      description: `Recurring rent payment for ${
        tenancy.propertyTitle || "rental property"
      }`,

      metadata: {
        recurring: true,
        tenancyId: tenancy.id,
      },

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });

    // =============================================
    // ADVANCE TENANCY TO NEXT RENT PERIOD
    // =============================================

    transaction.update(tenancyRef, {
      currentRentPeriodStart: formattedNextPeriodStart,

      currentRentPeriodEnd: formattedNextPeriodEnd,

      nextRentDueDate: formattedNextRentDueDate,

      rentPaymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      lastRentPaymentReference: paymentReference,

      lastRentPaymentDate: serverTimestamp(),

      rentPaymentCount: paymentNumber,

      updatedAt: serverTimestamp(),
    });
  });

  return {
    paymentId: paymentRef.id,

    transactionId: transactionRef.id,

    tenancyId: tenancy.id,

    paymentReference,

    amount: rentAmount,

    grossAmount: financialBreakdown.grossAmount,

    platformFee: financialBreakdown.platformFee,

    managerAmount: financialBreakdown.managerAmount,

    rentPeriodStart,

    rentPeriodEnd,

    nextRentDueDate: formattedNextRentDueDate,

    status: PAYMENT_STATUS.SUCCESSFUL,
  };
}

// =====================================================
// CALCULATE NEXT RENT DUE DATE
// =====================================================

function calculateNextRentDueDate(startDate, rentFrequency) {
  const nextDate = new Date(startDate);

  switch (rentFrequency) {
    case RENT_FREQUENCY.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case RENT_FREQUENCY.QUARTERLY:
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;

    case RENT_FREQUENCY.HALF_YEARLY:
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;

    case RENT_FREQUENCY.ANNUAL:
    default:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return nextDate;
}

// =====================================================
// CALCULATE RENT PERIOD END
// =====================================================

function calculateRentPeriodEnd(startDate, rentFrequency) {
  const endDate = new Date(calculateNextRentDueDate(startDate, rentFrequency));

  // Rent period ends one day before
  // the next rent payment is due.
  endDate.setDate(endDate.getDate() - 1);

  return endDate;
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =====================================================
// GET TENANT PAYMENTS
// =====================================================

export async function getMyPayments(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const payments = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  payments.sort((a, b) => {
    const dateA = getPaymentDate(a);

    const dateB = getPaymentDate(b);

    return dateB - dateA;
  });

  return payments;
}

// =====================================================
// GET LANDLORD PAYMENTS
// =====================================================

export async function getLandlordPayments(landlordId) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("managerId", "==", landlordId),
    where("managerRole", "==", "landlord"),
  );

  const snapshot = await getDocs(q);

  const payments = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  payments.sort((a, b) => getPaymentDate(b) - getPaymentDate(a));

  return payments;
}

// =====================================================
// GET AGENT PAYMENTS
// =====================================================

export async function getAgentPayments(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("managerId", "==", agentId),
    where("managerRole", "==", "agent"),
  );

  const snapshot = await getDocs(q);

  const payments = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  payments.sort((a, b) => getPaymentDate(b) - getPaymentDate(a));

  return payments;
}

// =====================================================
// GET ALL PAYMENTS
// =====================================================
//
// This is used by Admin Earnings/Dashboard.
//
// Older payment records may only have:
// - tenantId
// - propertyId
// - tenancyId
//
// We use the related tenancy as a fallback so those
// existing records can still display the tenant and
// property names.
//
// =====================================================

export async function getAllPayments() {
  const q = query(collection(db, PAYMENTS_COLLECTION));

  const snapshot = await getDocs(q);

  const payments = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  // ===================================================
  // ENRICH PAYMENT DISPLAY DATA
  // ===================================================

  const tenancyCache = new Map();

  const enrichedPayments = await Promise.all(
    payments.map(async (payment) => {
      if (!payment.tenancyId) {
        return payment;
      }

      let tenancyPromise = tenancyCache.get(payment.tenancyId);

      if (!tenancyPromise) {
        const tenancyRef = doc(db, TENANCIES_COLLECTION, payment.tenancyId);

        tenancyPromise = getDoc(tenancyRef);

        tenancyCache.set(payment.tenancyId, tenancyPromise);
      }

      try {
        const tenancySnapshot = await tenancyPromise;

        if (!tenancySnapshot.exists()) {
          return payment;
        }

        const tenancy = tenancySnapshot.data();

        return {
          ...payment,

          tenantName: payment.tenantName || tenancy.tenantName || "",

          tenantEmail: payment.tenantEmail || tenancy.tenantEmail || "",

          propertyTitle: payment.propertyTitle || tenancy.propertyTitle || "",

          propertyId: payment.propertyId || tenancy.propertyId || null,

          managerName: payment.managerName || tenancy.managerName || "",

          managerId: payment.managerId || tenancy.managerId || null,

          managerRole: payment.managerRole || tenancy.managerRole || null,

          rentFrequency: payment.rentFrequency || tenancy.rentFrequency || null,
        };
      } catch (error) {
        console.error("Failed to enrich payment:", payment.id, error);

        return payment;
      }
    }),
  );

  enrichedPayments.sort((a, b) => getPaymentDate(b) - getPaymentDate(a));

  return enrichedPayments;
}

// =====================================================
// GET PAYMENT DATE
// =====================================================

function getPaymentDate(payment) {
  if (!payment?.createdAt) {
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
