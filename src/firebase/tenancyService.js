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
  PROPERTY_STATUS,
  PAYMENT_STATUS,
  TENANCY_STATUS,
  RENT_FREQUENCY,
  PROPERTY_MANAGER_ROLE,
} from "./rentalConstants";

// =====================================================
// CREATE TENANCY
// =====================================================
//
// IMPORTANT:
//
// A tenancy MUST NOT be created when an application is
// merely approved.
//
// The application must already have:
// paymentStatus: "successful"
// OR legacy paymentStatus: "paid"
//
// Only then can the tenancy become:
// status: "active"
//
// This function is intended to be called AFTER verified
// payment.
//
// =====================================================

export async function createTenancy({
  application,
  tenantId,
  managerId,
  managerRole,
  managerName = "",
  managerEmail = "",
}) {
  if (!application?.id) {
    throw new Error("Application information is missing.");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!managerId) {
    throw new Error("Property manager is required.");
  }

  // ===================================================
  // PAYMENT VERIFICATION
  // ===================================================

  if (
    application.paymentStatus !== PAYMENT_STATUS.SUCCESSFUL &&
    application.paymentStatus !== "paid"
  ) {
    throw new Error(
      "Tenancy cannot be created until rent payment has been successfully completed.",
    );
  }

  if (!application.paymentReference) {
    throw new Error(
      "A verified payment reference is required before creating the tenancy.",
    );
  }

  // ===================================================
  // PROPERTY
  // ===================================================

  if (!application.propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(db, "properties", application.propertyId);

  const propertySnapshot = await getDoc(propertyRef);

  if (!propertySnapshot.exists()) {
    throw new Error("The property no longer exists.");
  }

  const property = {
    id: propertySnapshot.id,
    ...propertySnapshot.data(),
  };

  // ===================================================
  // PREVENT DUPLICATE TENANCY FOR SAME APPLICATION
  // ===================================================

  const existingQuery = query(
    collection(db, "tenancies"),
    where("applicationId", "==", application.id),
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    const existingTenancy = existingSnapshot.docs[0];
    const existingData = existingTenancy.data();

    if (existingData.status === TENANCY_STATUS.ACTIVE) {
      return existingTenancy.id;
    }
  }

  // ===================================================
  // CONTRACT START DATE
  // ===================================================

  let startDate;

  if (application.moveInDate) {
    startDate = new Date(application.moveInDate);

    if (Number.isNaN(startDate.getTime())) {
      startDate = new Date();
    }
  } else {
    startDate = new Date();
  }

  // ===================================================
  // LEASE DURATION
  // ===================================================

  const leaseDuration =
    application.leaseDuration || property?.leaseDuration || "12 Months";

  // ===================================================
  // RENT FREQUENCY
  // ===================================================

  const rentFrequency =
    application.rentFrequency ||
    property?.rentFrequency ||
    RENT_FREQUENCY.ANNUAL;

  // ===================================================
  // CONTRACT END DATE
  // ===================================================

  const endDate = new Date(startDate);

  const durationNumber = parseInt(leaseDuration.match(/\d+/)?.[0], 10) || 12;

  if (leaseDuration.toLowerCase().includes("year")) {
    endDate.setFullYear(endDate.getFullYear() + durationNumber);
  } else {
    endDate.setMonth(endDate.getMonth() + durationNumber);
  }

  // ===================================================
  // RENT PERIOD
  // ===================================================

  const nextRentDueDate = calculateNextRentDueDate(startDate, rentFrequency);

  const currentRentPeriodStart = new Date(startDate);

  const currentRentPeriodEnd = calculateRentPeriodEnd(startDate, rentFrequency);

  // ===================================================
  // FORMATTED DATES
  // ===================================================

  const formattedStartDate = formatDate(startDate);

  const formattedEndDate = formatDate(endDate);

  const formattedNextRentDueDate = formatDate(nextRentDueDate);

  // ===================================================
  // TENANCY REFERENCE
  // ===================================================

  const tenancyRef = doc(collection(db, "tenancies"));

  // ===================================================
  // TRANSACTION
  // ===================================================

  await runTransaction(db, async (transaction) => {
    // ===============================================
    // APPLICATION
    // ===============================================

    const applicationRef = doc(db, "applications", application.id);

    const applicationSnapshot = await transaction.get(applicationRef);

    if (!applicationSnapshot.exists()) {
      throw new Error("Application not found.");
    }

    const currentApplication = applicationSnapshot.data();

    // ===============================================
    // PAYMENT
    // ===============================================

    const paymentIsSuccessful =
      currentApplication.paymentStatus === PAYMENT_STATUS.SUCCESSFUL ||
      currentApplication.paymentStatus === "paid";

    if (!paymentIsSuccessful) {
      throw new Error(
        "Tenancy cannot be activated because payment has not been verified.",
      );
    }

    if (!currentApplication.paymentReference) {
      throw new Error("Verified payment reference is missing.");
    }

    // ===============================================
    // PROPERTY
    // ===============================================

    const currentPropertySnapshot = await transaction.get(propertyRef);

    if (!currentPropertySnapshot.exists()) {
      throw new Error("Property no longer exists.");
    }

    const currentProperty = currentPropertySnapshot.data();

    // ===============================================
    // VERIFY RESERVATION
    // ===============================================

    const isReservedForApplication =
      currentProperty.reservedForApplicationId === application.id;

    const isAlreadyOccupiedByTenant =
      currentProperty.status === PROPERTY_STATUS.OCCUPIED &&
      currentProperty.tenantId === tenantId;

    if (!isReservedForApplication && !isAlreadyOccupiedByTenant) {
      throw new Error("This property is not reserved for this tenant.");
    }

    // ===============================================
    // MANAGER
    // ===============================================

    const resolvedManagerRole =
      managerRole ||
      (currentProperty.managementType === "agent"
        ? PROPERTY_MANAGER_ROLE.AGENT
        : PROPERTY_MANAGER_ROLE.LANDLORD);

    // ===============================================
    // FINANCIAL
    // ===============================================

    const rentAmount =
      Number(currentApplication.paymentAmount) ||
      Number(currentProperty.price) ||
      Number(currentApplication.propertyPrice) ||
      0;

    // ===============================================
    // TENANCY DATA
    // ===============================================

    const tenancyData = {
      // ===========================================
      // RELATIONSHIPS
      // ===========================================

      applicationId: application.id,

      propertyId: application.propertyId,

      tenantId: currentApplication.tenantId || tenantId,

      // ===========================================
      // PROPERTY
      // ===========================================

      propertyTitle: currentProperty.title || application.propertyTitle || "",

      propertyImage:
        currentProperty.images?.[0] || application.propertyImage || "",

      // Private/internal address.
      propertyAddress:
        currentProperty.address || application.propertyAddress || "",

      propertyAreaName:
        currentProperty.areaName || application.propertyAreaName || "",

      propertyCity: currentProperty.city || application.propertyCity || "",

      propertyState: currentProperty.state || application.propertyState || "",

      // ===========================================
      // OWNERSHIP
      // ===========================================

      ownerId: currentProperty.ownerId || application.landlordId || null,

      ownerRole: currentProperty.ownerRole || null,

      landlordId: currentProperty.ownerId || application.landlordId || null,

      agentId: currentProperty.agentId || application.agentId || null,

      // ===========================================
      // MANAGER
      // ===========================================

      managerId,

      managerRole: resolvedManagerRole,

      managerName,

      managerEmail,

      // ===========================================
      // TENANT
      // ===========================================

      tenantName: currentApplication.tenantName || application.tenantName || "",

      tenantEmail:
        currentApplication.tenantEmail || application.tenantEmail || "",

      tenantPhone:
        currentApplication.phone ||
        application.phone ||
        currentApplication.tenantPhone ||
        "",

      // ===========================================
      // RENT / FINANCIAL
      // ===========================================

      rentAmount,

      currency: "NGN",

      rentFrequency,

      paymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      paymentReference: currentApplication.paymentReference,

      paymentCompletedAt:
        currentApplication.paymentCompletedAt || serverTimestamp(),

      // ===========================================
      // RENT SCHEDULE
      // ===========================================

      // The first rent payment has already been made.
      // Therefore the current rent period starts on
      // the contract start date and ends one day before
      // the next rent due date.

      currentRentPeriodStart: formattedStartDate,

      currentRentPeriodEnd: formatDate(
        new Date(nextRentDueDate.getTime() - 24 * 60 * 60 * 1000),
      ),

      nextRentDueDate: formattedNextRentDueDate,

      // Number of completed rent payments.
      // Initial tenancy payment counts as payment #1.
      rentPaymentCount: 1,

      rentPaymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      lastRentPaymentReference: paymentReference,

      lastRentPaymentDate: serverTimestamp(),

      // ===========================================
      // CONTRACT
      // ===========================================

      leaseDuration,

      moveInDate: formattedStartDate,

      contractStartDate: formattedStartDate,

      contractEndDate: formattedEndDate,

      // ===========================================
      // TENANCY STATUS
      // ===========================================

      status: TENANCY_STATUS.ACTIVE,

      tenancyStatus: TENANCY_STATUS.ACTIVE,

      // ===========================================
      // TERMINATION FOUNDATION
      // ===========================================

      terminationStatus: "not_requested",

      terminationReason: null,

      terminationRequestedBy: null,

      terminationRequestedAt: null,

      terminationEffectiveDate: null,

      terminationCompletedAt: null,

      // ===========================================
      // MOVE-OUT FOUNDATION
      // ===========================================

      moveOutDate: null,

      handoverStatus: "not_started",

      // ===========================================
      // REFUND FOUNDATION
      // ===========================================

      refundStatus: "not_requested",

      refundAmount: 0,

      // ===========================================
      // TIMESTAMPS
      // ===========================================

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    };

    // ===============================================
    // CREATE TENANCY
    // ===============================================

    transaction.set(tenancyRef, tenancyData);

    // ===============================================
    // UPDATE APPLICATION
    // ===============================================

    transaction.update(applicationRef, {
      tenancyStatus: TENANCY_STATUS.ACTIVE,

      tenancyId: tenancyRef.id,

      paymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      paymentReference: currentApplication.paymentReference,

      paymentCompletedAt:
        currentApplication.paymentCompletedAt || serverTimestamp(),

      reservationStatus: "completed",

      reservationExpiresAt: null,

      updatedAt: serverTimestamp(),
    });

    // ===============================================
    // UPDATE PROPERTY
    // ===============================================

    transaction.update(propertyRef, {
      status: PROPERTY_STATUS.OCCUPIED,

      tenantId: currentApplication.tenantId || tenantId,

      rentedAt: serverTimestamp(),

      assignedAt: serverTimestamp(),

      reservedForApplicationId: null,

      reservedForTenantId: null,

      reservedAt: null,

      reservationExpiresAt: null,

      updatedAt: serverTimestamp(),
    });
  });

  return tenancyRef.id;
}

// =====================================================
// COMPLETE PAYMENT + CREATE TENANCY
// =====================================================
//
// Main payment → tenancy activation flow.
//
// Tenant must:
// 1. Have an approved application
// 2. Have an active payment window
// 3. Complete payment
//
// Only after payment:
// 1. Payment becomes successful
// 2. Tenancy is created
// 3. Tenancy becomes active
// 4. Property becomes occupied
// 5. Tenant is assigned
//
// =====================================================

export async function completePaymentAndCreateTenancy(
  applicationId,
  paymentReference,
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!paymentReference) {
    throw new Error("Payment reference is required.");
  }

  const tenancyRef = doc(collection(db, "tenancies"));

  let result = null;

  await runTransaction(db, async (transaction) => {
    // ===============================================
    // APPLICATION
    // ===============================================

    const applicationRef = doc(db, "applications", applicationId);

    const applicationSnapshot = await transaction.get(applicationRef);

    if (!applicationSnapshot.exists()) {
      throw new Error("Application not found.");
    }

    const application = {
      id: applicationSnapshot.id,
      ...applicationSnapshot.data(),
    };

    // ===============================================
    // APPLICATION STATUS
    // ===============================================

    if (application.status !== "approved") {
      throw new Error("Only approved applications can receive rent payment.");
    }

    // ===============================================
    // PAYMENT STATUS
    // ===============================================

    if (
      application.paymentStatus === PAYMENT_STATUS.SUCCESSFUL ||
      application.paymentStatus === "paid"
    ) {
      throw new Error("This application has already been paid.");
    }

    // ===============================================
    // PAYMENT DEADLINE
    // ===============================================

    if (application.paymentDeadline) {
      const deadline = getTimestampMilliseconds(application.paymentDeadline);

      if (deadline && Date.now() > deadline) {
        throw new Error(
          "The payment deadline for this application has expired.",
        );
      }
    }

    // ===============================================
    // PROPERTY
    // ===============================================

    if (!application.propertyId) {
      throw new Error("Property ID is required.");
    }

    const propertyRef = doc(db, "properties", application.propertyId);

    const propertySnapshot = await transaction.get(propertyRef);

    if (!propertySnapshot.exists()) {
      throw new Error("The property no longer exists.");
    }

    const property = {
      id: propertySnapshot.id,
      ...propertySnapshot.data(),
    };

    // ===============================================
    // RESERVATION
    // ===============================================

    if (property.reservedForApplicationId !== applicationId) {
      throw new Error("This property is not reserved for this application.");
    }

    if (property.status !== PROPERTY_STATUS.RESERVED) {
      throw new Error("This property is no longer reserved.");
    }

    // ===============================================
    // MANAGER
    // ===============================================

    const managerId =
      application.managerId || property.agentId || property.ownerId || null;

    const managerRole =
      application.managerRole ||
      (property.managementType === "agent"
        ? PROPERTY_MANAGER_ROLE.AGENT
        : PROPERTY_MANAGER_ROLE.LANDLORD);

    const managerName = application.managerName || property.managerName || "";

    const managerEmail =
      application.managerEmail || property.managerEmail || "";

    if (!managerId) {
      throw new Error("Property manager could not be identified.");
    }

    // ===============================================
    // CONTRACT START DATE
    // ===============================================

    let startDate;

    if (application.moveInDate) {
      startDate = new Date(application.moveInDate);

      if (Number.isNaN(startDate.getTime())) {
        startDate = new Date();
      }
    } else {
      startDate = new Date();
    }

    // ===============================================
    // LEASE DURATION
    // ===============================================

    const leaseDuration =
      application.leaseDuration || property.leaseDuration || "12 Months";

    // ===============================================
    // RENT FREQUENCY
    // ===============================================

    const rentFrequency =
      application.rentFrequency ||
      property.rentFrequency ||
      RENT_FREQUENCY.ANNUAL;

    // ===============================================
    // CONTRACT END DATE
    // ===============================================

    const endDate = new Date(startDate);

    const durationNumber = parseInt(leaseDuration.match(/\d+/)?.[0], 10) || 12;

    if (leaseDuration.toLowerCase().includes("year")) {
      endDate.setFullYear(endDate.getFullYear() + durationNumber);
    } else {
      endDate.setMonth(endDate.getMonth() + durationNumber);
    }

    // ===============================================
    // RENT PERIOD
    // ===============================================

    const nextRentDueDate = calculateNextRentDueDate(startDate, rentFrequency);

    const currentRentPeriodStart = new Date(startDate);

    const currentRentPeriodEnd = calculateRentPeriodEnd(
      startDate,
      rentFrequency,
    );

    const formattedStartDate = formatDate(startDate);

    const formattedEndDate = formatDate(endDate);

    const formattedNextRentDueDate = formatDate(nextRentDueDate);

    // ===============================================
    // RENT AMOUNT
    // ===============================================

    const rentAmount =
      Number(application.paymentAmount) ||
      Number(property.price) ||
      Number(application.propertyPrice) ||
      0;

    // ===============================================
    // TENANCY DATA
    // ===============================================

    const tenancyData = {
      // ===========================================
      // RELATIONSHIP
      // ===========================================

      applicationId,

      propertyId: application.propertyId,

      tenantId: application.tenantId,

      // ===========================================
      // PROPERTY
      // ===========================================

      propertyTitle: property.title || application.propertyTitle || "",

      propertyImage: property.images?.[0] || application.propertyImage || "",

      // Private/internal address.
      propertyAddress: property.address || application.propertyAddress || "",

      propertyAreaName: property.areaName || application.propertyAreaName || "",

      propertyCity: property.city || application.propertyCity || "",

      propertyState: property.state || application.propertyState || "",

      // ===========================================
      // OWNERSHIP
      // ===========================================

      ownerId: property.ownerId || application.landlordId || null,

      ownerRole: property.ownerRole || null,

      landlordId: property.ownerId || application.landlordId || null,

      agentId: property.agentId || application.agentId || null,

      // ===========================================
      // MANAGER
      // ===========================================

      managerId,

      managerRole,

      managerName,

      managerEmail,

      // ===========================================
      // TENANT
      // ===========================================

      tenantName: application.tenantName || "",

      tenantEmail: application.tenantEmail || "",

      tenantPhone: application.phone || application.tenantPhone || "",

      // ===========================================
      // FINANCIAL
      // ===========================================

      rentAmount,

      currency: "NGN",

      rentFrequency,

      paymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      paymentReference,

      paymentCompletedAt: serverTimestamp(),

      // ===========================================
      // RENT SCHEDULE
      // ===========================================

      currentRentPeriodStart: formatDate(currentRentPeriodStart),

      currentRentPeriodEnd: formatDate(currentRentPeriodEnd),

      nextRentDueDate: formattedNextRentDueDate,

      rentPaymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      // Initial tenancy payment counts as rent payment #1.
      rentPaymentCount: 1,

      lastRentPaymentReference: paymentReference,

      lastRentPaymentDate: serverTimestamp(),

      // ===========================================
      // CONTRACT
      // ===========================================

      leaseDuration,

      moveInDate: formattedStartDate,

      contractStartDate: formattedStartDate,

      contractEndDate: formattedEndDate,

      // ===========================================
      // STATUS
      // ===========================================

      status: TENANCY_STATUS.ACTIVE,

      tenancyStatus: TENANCY_STATUS.ACTIVE,

      // ===========================================
      // TERMINATION FOUNDATION
      // ===========================================

      terminationStatus: "not_requested",

      terminationReason: null,

      terminationRequestedBy: null,

      terminationRequestedAt: null,

      terminationEffectiveDate: null,

      terminationCompletedAt: null,

      // ===========================================
      // MOVE-OUT FOUNDATION
      // ===========================================

      moveOutDate: null,

      handoverStatus: "not_started",

      // ===========================================
      // REFUND FOUNDATION
      // ===========================================

      refundStatus: "not_requested",

      refundAmount: 0,

      // ===========================================
      // TIMESTAMPS
      // ===========================================

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    };

    // ===============================================
    // CREATE TENANCY
    // ===============================================

    transaction.set(tenancyRef, tenancyData);

    // ===============================================
    // UPDATE APPLICATION
    // ===============================================

    transaction.update(applicationRef, {
      paymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      paymentReference,

      paymentCompletedAt: serverTimestamp(),

      paymentDeadline: null,

      reservationStatus: "completed",

      reservationExpiresAt: null,

      tenancyStatus: TENANCY_STATUS.ACTIVE,

      tenancyId: tenancyRef.id,

      updatedAt: serverTimestamp(),
    });

    // ===============================================
    // OCCUPY PROPERTY
    // ===============================================

    transaction.update(propertyRef, {
      status: PROPERTY_STATUS.OCCUPIED,

      tenantId: application.tenantId,

      rentedAt: serverTimestamp(),

      assignedAt: serverTimestamp(),

      reservedForApplicationId: null,

      reservedForTenantId: null,

      reservedAt: null,

      reservationExpiresAt: null,

      updatedAt: serverTimestamp(),
    });

    // ===============================================
    // RESULT
    // ===============================================

    result = {
      tenancyId: tenancyRef.id,

      applicationId,

      tenantId: application.tenantId,

      propertyId: application.propertyId,

      propertyTitle: property.title || application.propertyTitle || "",

      managerId,

      managerRole,

      managerName,

      managerEmail,

      paymentReference,

      paymentStatus: PAYMENT_STATUS.SUCCESSFUL,

      tenancyStatus: TENANCY_STATUS.ACTIVE,

      propertyStatus: PROPERTY_STATUS.OCCUPIED,

      rentAmount,

      rentFrequency,

      contractStartDate: formattedStartDate,

      contractEndDate: formattedEndDate,

      currentRentPeriodStart: formatDate(currentRentPeriodStart),

      currentRentPeriodEnd: formatDate(currentRentPeriodEnd),

      nextRentDueDate: formattedNextRentDueDate,
    };
  });

  return result;
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
// CALCULATE CURRENT RENT PERIOD END
// =====================================================

function calculateRentPeriodEnd(startDate, rentFrequency) {
  const endDate = new Date(calculateNextRentDueDate(startDate, rentFrequency));

  // A rent period ends the day before
  // the next payment is due.
  endDate.setDate(endDate.getDate() - 1);

  return endDate;
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
// GET TIMESTAMP MILLISECONDS
// =====================================================

function getTimestampMilliseconds(value) {
  if (value && typeof value.toMillis === "function") {
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

// =====================================================
// GET ALL TENANT ACTIVE TENANCIES
// =====================================================
//
// A tenant can have multiple active rentals.
//
// We intentionally query only by tenantId + active
// status and then filter payment status in JavaScript.
//
// This allows us to support BOTH:
//
//   paymentStatus: "successful"
//   paymentStatus: "paid"
//
// without requiring a Firestore composite index.
//
// =====================================================

export async function getMyTenancies(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, "tenancies"),
    where("tenantId", "==", tenantId),
    where("status", "==", TENANCY_STATUS.ACTIVE),
  );

  const snapshot = await getDocs(q);

  const tenancies = snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (tenancy) =>
        tenancy.paymentStatus === PAYMENT_STATUS.SUCCESSFUL ||
        tenancy.paymentStatus === "paid",
    );

  // ==========================================
  // NEWEST TENANCY FIRST
  // ==========================================

  tenancies.sort((a, b) => {
    const getTime = (value) => {
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

      const date = new Date(value);

      return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    };

    return getTime(b.createdAt) - getTime(a.createdAt);
  });

  return tenancies;
}

// =====================================================
// GET ONE TENANT ACTIVE TENANCY
// =====================================================
//
// Kept for compatibility with existing pages.
//
// If a page needs ALL rentals, use:
// getMyTenancies()
//
// If a page needs ONE rental, use:
// getMyTenancy()
//
// =====================================================

export async function getMyTenancy(tenantId) {
  if (!tenantId) {
    return null;
  }

  const tenancies = await getMyTenancies(tenantId);

  return tenancies[0] || null;
}

// =====================================================
// GET LANDLORD TENANCIES
// =====================================================

export async function getLandlordTenancies(landlordId) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, "tenancies"),
    where("landlordId", "==", landlordId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET AGENT TENANCIES
// =====================================================

export async function getAgentTenancies(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(collection(db, "tenancies"), where("agentId", "==", agentId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// UPDATE TENANCY STATUS
// =====================================================
//
// Kept for compatibility.
//
// More advanced status transitions such as:
// - termination
// - expiry
// - move-out
// - refund
//
// will be handled by dedicated services later.
//
// =====================================================

export async function updateTenancyStatus(tenancyId, status) {
  if (!tenancyId) {
    throw new Error("Tenancy ID is required.");
  }

  await updateDoc(doc(db, "tenancies", tenancyId), {
    status,

    tenancyStatus: status,

    updatedAt: serverTimestamp(),
  });
}
