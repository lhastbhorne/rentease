import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";

import { db } from "./firestore";
import { createNotification } from "./notificationService";
import { completePaymentAndCreateTenancy } from "./tenancyService";

import {
  PROPERTY_STATUS,
  APPLICATION_STATUS,
  PAYMENT_STATUS,
  TENANCY_STATUS,
  PAYMENT_DEADLINE_DAYS as RENTAL_PAYMENT_DEADLINE_DAYS,
} from "./rentalConstants";

// ==========================================
// PAYMENT CONFIGURATION
// ==========================================
//
// Kept as an exported alias so existing components
// importing PAYMENT_DEADLINE_DAYS from this service
// continue to work.
//

export const PAYMENT_DEADLINE_DAYS = RENTAL_PAYMENT_DEADLINE_DAYS;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getApplicationDate(application) {
  if (!application?.createdAt) {
    return 0;
  }

  if (typeof application.createdAt?.toMillis === "function") {
    return application.createdAt.toMillis();
  }

  if (application.createdAt instanceof Date) {
    return application.createdAt.getTime();
  }

  if (typeof application.createdAt === "number") {
    return application.createdAt;
  }

  return 0;
}

function getTimestampMilliseconds(timestamp) {
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp?.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  if (typeof timestamp === "number") {
    return timestamp;
  }

  return null;
}

// ==========================================
// CREATE APPLICATION
// ==========================================

export async function createApplication(applicationData) {
  const { tenantId, propertyId } = applicationData;

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  // ==========================================
  // GET PROPERTY
  // ==========================================

  const propertyRef = doc(db, "properties", propertyId);

  const propertySnapshot = await getDoc(propertyRef);

  if (!propertySnapshot.exists()) {
    throw new Error("This property no longer exists.");
  }

  const property = {
    id: propertySnapshot.id,
    ...propertySnapshot.data(),
  };

  // ==========================================
  // CHECK PROPERTY AVAILABILITY
  // ==========================================

  if (property.status && property.status !== PROPERTY_STATUS.AVAILABLE) {
    if (property.status === PROPERTY_STATUS.RESERVED) {
      throw new Error(
        "This property is currently reserved for another tenant.",
      );
    }

    if (property.status === PROPERTY_STATUS.OCCUPIED) {
      throw new Error("This property is currently occupied.");
    }

    if (property.status === PROPERTY_STATUS.MAINTENANCE) {
      throw new Error("This property is currently under maintenance.");
    }

    throw new Error("This property is no longer available.");
  }

  // ==========================================
  // DETERMINE PROPERTY MANAGER
  // ==========================================

  let managerId = null;
  let managerRole = null;

  // Agent-managed property
  if (property.managementType === "agent" && property.agentId) {
    managerId = property.agentId;
    managerRole = "agent";
  }

  // Landlord-managed property
  else if (property.ownerId) {
    managerId = property.ownerId;
    managerRole = "landlord";
  }

  if (!managerId) {
    throw new Error("This property does not have a valid manager.");
  }

  // ==========================================
  // CHECK PREVIOUS APPLICATIONS
  // ==========================================

  const q = query(
    collection(db, "applications"),
    where("tenantId", "==", tenantId),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  const activeApplication = snapshot.docs.find((applicationDoc) => {
    const data = applicationDoc.data();

    return (
      data.status === APPLICATION_STATUS.PENDING ||
      data.status === APPLICATION_STATUS.APPROVED
    );
  });

  if (activeApplication) {
    const existing = activeApplication.data();

    if (existing.status === APPLICATION_STATUS.APPROVED) {
      throw new Error("You have already been approved for this property.");
    }

    throw new Error(
      "You already have a pending application for this property.",
    );
  }

  // ==========================================
  // CREATE APPLICATION
  // ==========================================

  const application = {
    ...applicationData,

    // ------------------------------------------
    // Property
    // ------------------------------------------

    propertyId,

    propertyTitle: property.title || applicationData.propertyTitle || "",

    propertyImage: property.images?.[0] || applicationData.propertyImage || "",

    // Keep the exact address internally.
    propertyAddress: property.address || applicationData.propertyAddress || "",

    propertyAreaName:
      property.areaName || applicationData.propertyAreaName || "",

    propertyCity: property.city || applicationData.propertyCity || "",

    propertyState: property.state || applicationData.propertyState || "",

    propertyPrice:
      Number(property.price) || Number(applicationData.propertyPrice) || 0,

    // ------------------------------------------
    // Manager
    // ------------------------------------------

    managerId,

    managerRole,

    managerName: property.managerName || applicationData.managerName || "",

    managerEmail: property.managerEmail || applicationData.managerEmail || "",

    // ------------------------------------------
    // Ownership compatibility
    // ------------------------------------------

    landlordId: property.ownerId || null,

    agentId: property.agentId || null,

    // ------------------------------------------
    // Application status
    // ------------------------------------------

    status: APPLICATION_STATUS.PENDING,

    rejectionReason: "",

    approvedAt: null,

    rejectedAt: null,

    expiredAt: null,

    // ------------------------------------------
    // Payment
    // ------------------------------------------

    paymentStatus: PAYMENT_STATUS.NOT_STARTED,

    paymentDeadline: null,

    paymentApprovedAt: null,

    paymentCompletedAt: null,

    paymentReference: "",

    paymentAmount: Number(property.price) || 0,

    // ------------------------------------------
    // Reservation
    // ------------------------------------------

    reservationStatus: "not_reserved",

    reservedAt: null,

    reservationExpiresAt: null,

    // ------------------------------------------
    // Tenancy
    // ------------------------------------------

    tenancyStatus: TENANCY_STATUS.NOT_STARTED,

    tenancyId: null,

    // ------------------------------------------
    // Timestamps
    // ------------------------------------------

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "applications"), application);

  // ==========================================
  // NOTIFY MANAGER
  // ==========================================

  try {
    await createNotification({
      userId: managerId,

      title: "New Rental Application",

      message: `A tenant has submitted an application for "${
        application.propertyTitle || "your property"
      }".`,

      type: "application",

      relatedId: docRef.id,

      relatedType: "application",
    });
  } catch (notificationError) {
    console.error("Application notification error:", notificationError);
  }

  return docRef.id;
}

// ==========================================
// CHECK ACTIVE APPLICATION
// ==========================================

export async function hasActiveApplication(tenantId, propertyId) {
  if (!tenantId || !propertyId) {
    return false;
  }

  const q = query(
    collection(db, "applications"),
    where("tenantId", "==", tenantId),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.some((applicationDoc) => {
    const data = applicationDoc.data();

    return (
      data.status === APPLICATION_STATUS.PENDING ||
      data.status === APPLICATION_STATUS.APPROVED
    );
  });
}

// ==========================================
// GET TENANT APPLICATIONS
// ==========================================

export async function getMyApplications(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, "applications"),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const applications = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  applications.sort((a, b) => {
    return getApplicationDate(b) - getApplicationDate(a);
  });

  return applications;
}

// ==========================================
// GET LANDLORD APPLICATIONS
// ==========================================

export async function getLandlordApplications(landlordId) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, "applications"),
    where("landlordId", "==", landlordId),
  );

  const snapshot = await getDocs(q);

  const applications = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  applications.sort((a, b) => {
    return getApplicationDate(b) - getApplicationDate(a);
  });

  return applications;
}

// ==========================================
// GET AGENT APPLICATIONS
// ==========================================

export async function getAgentApplications(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, "applications"),
    where("agentId", "==", agentId),
  );

  const snapshot = await getDocs(q);

  const applications = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  applications.sort((a, b) => {
    return getApplicationDate(b) - getApplicationDate(a);
  });

  return applications;
}

// ==========================================
// GET APPLICATION STATUS
// ==========================================

export async function getApplicationStatus(tenantId, propertyId) {
  if (!tenantId || !propertyId) {
    return null;
  }

  const q = query(
    collection(db, "applications"),
    where("tenantId", "==", tenantId),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const applications = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  applications.sort((a, b) => {
    return getApplicationDate(b) - getApplicationDate(a);
  });

  return applications[0]?.status || null;
}

// ==========================================
// CHECK WHETHER TENANT HAS APPLIED
// ==========================================

export async function hasAppliedForProperty(tenantId, propertyId) {
  return hasActiveApplication(tenantId, propertyId);
}

// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

export async function updateApplicationStatus(applicationId, status) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const applicationRef = doc(db, "applications", applicationId);

  await updateDoc(applicationRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// APPROVE APPLICATION
// ==========================================
//
// Approval does THREE things together:
//
// 1. Application → approved
// 2. Payment → pending for 7 days
// 3. Property → reserved
//
// The tenancy is NOT created here.
//

export async function approveApplication(applicationId, manager = null) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const applicationRef = doc(db, "applications", applicationId);

  let result = null;

  await runTransaction(db, async (transaction) => {
    // ========================================
    // GET APPLICATION
    // ========================================

    const applicationSnapshot = await transaction.get(applicationRef);

    if (!applicationSnapshot.exists()) {
      throw new Error("Application not found.");
    }

    const application = {
      id: applicationSnapshot.id,
      ...applicationSnapshot.data(),
    };

    // ========================================
    // CHECK APPLICATION STATUS
    // ========================================

    if (application.status !== APPLICATION_STATUS.PENDING) {
      throw new Error("This application has already been processed.");
    }

    // ========================================
    // GET PROPERTY
    // ========================================

    const propertyRef = doc(db, "properties", application.propertyId);

    const propertySnapshot = await transaction.get(propertyRef);

    if (!propertySnapshot.exists()) {
      throw new Error("The property no longer exists.");
    }

    const property = propertySnapshot.data();

    // ========================================
    // PROPERTY MUST STILL BE AVAILABLE
    // ========================================

    if (property.status !== PROPERTY_STATUS.AVAILABLE) {
      throw new Error("This property is no longer available.");
    }

    // ========================================
    // DETERMINE MANAGER
    // ========================================

    const managerId =
      manager?.uid ||
      application.managerId ||
      application.agentId ||
      application.landlordId;

    const managerRole =
      manager?.role ||
      application.managerRole ||
      (application.agentId ? "agent" : "landlord");

    const managerName =
      manager?.fullName ||
      manager?.displayName ||
      application.managerName ||
      "";

    const managerEmail = manager?.email || application.managerEmail || "";

    if (!managerId) {
      throw new Error("Property manager could not be identified.");
    }

    // ========================================
    // CREATE PAYMENT DEADLINE
    // ========================================

    const now = Date.now();

    const paymentDeadline = Timestamp.fromMillis(
      now + PAYMENT_DEADLINE_DAYS * 24 * 60 * 60 * 1000,
    );

    // ========================================
    // UPDATE APPLICATION
    // ========================================

    transaction.update(applicationRef, {
      status: APPLICATION_STATUS.APPROVED,

      rejectionReason: "",

      approvedAt: serverTimestamp(),

      expiredAt: null,

      // Payment
      paymentStatus: PAYMENT_STATUS.PENDING,

      paymentDeadline,

      paymentApprovedAt: serverTimestamp(),

      paymentAmount: Number(application.propertyPrice) || 0,

      paymentReference: "",

      paymentCompletedAt: null,

      // Reservation
      reservationStatus: "reserved",

      reservedAt: serverTimestamp(),

      reservationExpiresAt: paymentDeadline,

      // Tenancy
      tenancyStatus: TENANCY_STATUS.AWAITING_PAYMENT,

      tenancyId: null,

      // Manager
      managerId,

      managerRole,

      managerName,

      managerEmail,

      updatedAt: serverTimestamp(),
    });

    // ========================================
    // RESERVE PROPERTY
    // ========================================

    transaction.update(propertyRef, {
      status: PROPERTY_STATUS.RESERVED,

      reservedForApplicationId: applicationId,

      reservedForTenantId: application.tenantId,

      reservedAt: serverTimestamp(),

      reservationExpiresAt: paymentDeadline,

      // Tenant is NOT assigned yet.
      tenantId: null,

      updatedAt: serverTimestamp(),
    });

    result = {
      application,

      managerId,

      managerRole,

      managerName,

      managerEmail,

      paymentDeadline,
    };
  });

  // ==========================================
  // NOTIFY TENANT
  // ==========================================

  try {
    await createNotification({
      userId: result.application.tenantId,

      title: "Application Approved",

      message: `Congratulations! Your application for "${
        result.application.propertyTitle || "the property"
      }" has been approved. The property has been reserved for you. You have ${PAYMENT_DEADLINE_DAYS} days to complete your rent payment.`,

      type: "approved",

      relatedId: applicationId,

      relatedType: "application",
    });
  } catch (notificationError) {
    console.error("Approval notification error:", notificationError);
  }

  // ==========================================
  // NOTIFY MANAGER
  // ==========================================

  try {
    await createNotification({
      userId: result.managerId,

      title: "Application Approved",

      message: `The application for "${
        result.application.propertyTitle || "your property"
      }" has been approved. The property has been reserved for the tenant for ${PAYMENT_DEADLINE_DAYS} days while they complete payment.`,

      type: "application",

      relatedId: applicationId,

      relatedType: "application",
    });
  } catch (notificationError) {
    console.error("Manager approval notification error:", notificationError);
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    id: applicationId,

    ...result.application,

    status: APPLICATION_STATUS.APPROVED,

    paymentStatus: PAYMENT_STATUS.PENDING,

    paymentDeadline: result.paymentDeadline,

    reservationStatus: "reserved",

    tenancyStatus: TENANCY_STATUS.AWAITING_PAYMENT,

    tenancyId: null,
  };
}

// ==========================================
// EXPIRE UNPAID APPLICATION
// ==========================================
//
// When the 7-day deadline passes:
//
// Application → expired
// Payment → expired
// Reservation → released
// Property → available
//
// This also uses a transaction.
//

export async function expireApplicationPayment(applicationId) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const applicationRef = doc(db, "applications", applicationId);

  let result = null;

  await runTransaction(db, async (transaction) => {
    // ========================================
    // GET APPLICATION
    // ========================================

    const applicationSnapshot = await transaction.get(applicationRef);

    if (!applicationSnapshot.exists()) {
      throw new Error("Application not found.");
    }

    const application = {
      id: applicationSnapshot.id,
      ...applicationSnapshot.data(),
    };

    // ========================================
    // ALREADY PROCESSED
    // ========================================

    if (application.status !== APPLICATION_STATUS.APPROVED) {
      result = application;
      return;
    }

    // ========================================
    // ALREADY PAID
    // ========================================

    if (
      application.paymentStatus === "paid" ||
      application.paymentStatus === PAYMENT_STATUS.SUCCESSFUL
    ) {
      result = application;
      return;
    }

    // ========================================
    // CHECK DEADLINE
    // ========================================

    if (!application.paymentDeadline) {
      result = application;
      return;
    }

    const deadline = getTimestampMilliseconds(application.paymentDeadline);

    if (!deadline) {
      result = application;
      return;
    }

    // Still within payment period.
    if (Date.now() < deadline) {
      result = application;
      return;
    }

    // ========================================
    // GET PROPERTY
    // ========================================

    const propertyRef = doc(db, "properties", application.propertyId);

    const propertySnapshot = await transaction.get(propertyRef);

    // ========================================
    // EXPIRE APPLICATION
    // ========================================

    transaction.update(applicationRef, {
      status: APPLICATION_STATUS.EXPIRED,

      expiredAt: serverTimestamp(),

      paymentStatus: PAYMENT_STATUS.EXPIRED,

      paymentDeadline: null,

      reservationStatus: "released",

      reservedAt: null,

      reservationExpiresAt: null,

      tenancyStatus: TENANCY_STATUS.EXPIRED,

      tenancyId: null,

      updatedAt: serverTimestamp(),
    });

    // ========================================
    // RELEASE PROPERTY
    // ========================================

    if (propertySnapshot.exists()) {
      const property = propertySnapshot.data();

      // Only release the property if
      // this application owns the reservation.

      if (property.reservedForApplicationId === applicationId) {
        transaction.update(propertyRef, {
          status: PROPERTY_STATUS.AVAILABLE,

          reservedForApplicationId: null,

          reservedForTenantId: null,

          reservedAt: null,

          reservationExpiresAt: null,

          tenantId: null,

          updatedAt: serverTimestamp(),
        });
      }
    }

    result = {
      ...application,

      status: APPLICATION_STATUS.EXPIRED,

      paymentStatus: PAYMENT_STATUS.EXPIRED,

      reservationStatus: "released",

      tenancyStatus: TENANCY_STATUS.EXPIRED,

      tenancyId: null,
    };
  });

  // Nothing changed.
  if (result?.status !== APPLICATION_STATUS.EXPIRED) {
    return result;
  }

  // ==========================================
  // NOTIFY TENANT
  // ==========================================

  if (result.tenantId) {
    try {
      await createNotification({
        userId: result.tenantId,

        title: "Payment Deadline Expired",

        message: `Your payment deadline for "${
          result.propertyTitle || "the property"
        }" has expired. The property reservation has been released.`,

        type: "expired",

        relatedId: applicationId,

        relatedType: "application",
      });
    } catch (notificationError) {
      console.error("Expiration notification error:", notificationError);
    }
  }

  // ==========================================
  // NOTIFY MANAGER
  // ==========================================

  if (result.managerId) {
    try {
      await createNotification({
        userId: result.managerId,

        title: "Property Reservation Released",

        message: `The application for "${
          result.propertyTitle || "your property"
        }" expired because the tenant did not complete payment within ${PAYMENT_DEADLINE_DAYS} days. The property is available again.`,

        type: "application",

        relatedId: applicationId,

        relatedType: "application",
      });
    } catch (notificationError) {
      console.error(
        "Manager expiration notification error:",
        notificationError,
      );
    }
  }

  return result;
}

// ==========================================
// MARK PAYMENT AS COMPLETED
// ==========================================
//
// IMPORTANT:
//
// This should ONLY be called after verified
// payment from Paystack/server-side logic.
//
// The actual atomic operation is delegated to
// tenancyService.js.
//

export async function markApplicationPaymentCompleted(
  applicationId,
  paymentReference,
) {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!paymentReference) {
    throw new Error("Payment reference is required.");
  }

  // ==========================================
  // COMPLETE PAYMENT + CREATE TENANCY
  // ==========================================

  const result = await completePaymentAndCreateTenancy(
    applicationId,
    paymentReference,
  );

  // ==========================================
  // NOTIFY TENANT
  // ==========================================

  if (result?.tenantId) {
    try {
      await createNotification({
        userId: result.tenantId,

        title: "Rent Payment Confirmed",

        message: `Your rent payment for "${
          result.propertyTitle || "the property"
        }" has been confirmed. Your tenancy is now active.`,

        type: "payment",

        relatedId: applicationId,

        relatedType: "application",
      });
    } catch (notificationError) {
      console.error("Payment notification error:", notificationError);
    }
  }

  // ==========================================
  // NOTIFY MANAGER
  // ==========================================

  if (result?.managerId) {
    try {
      await createNotification({
        userId: result.managerId,

        title: "Rent Payment Received",

        message: `Rent payment for "${
          result.propertyTitle || "your property"
        }" has been confirmed. The property is now occupied by the tenant.`,

        type: "payment",

        relatedId: applicationId,

        relatedType: "application",
      });
    } catch (notificationError) {
      console.error("Manager payment notification error:", notificationError);
    }
  }

  // ==========================================
  // RETURN
  // ==========================================

  return result;
}

// ==========================================
// REJECT APPLICATION
// ==========================================

export async function rejectApplication(applicationId, reason = "") {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const applicationRef = doc(db, "applications", applicationId);

  const snapshot = await getDoc(applicationRef);

  if (!snapshot.exists()) {
    throw new Error("Application not found.");
  }

  const application = {
    id: snapshot.id,
    ...snapshot.data(),
  };

  if (application.status !== APPLICATION_STATUS.PENDING) {
    throw new Error("This application has already been processed.");
  }

  await updateDoc(applicationRef, {
    status: APPLICATION_STATUS.REJECTED,

    rejectionReason: reason || "",

    rejectedAt: serverTimestamp(),

    paymentStatus: PAYMENT_STATUS.NOT_STARTED,

    paymentDeadline: null,

    paymentApprovedAt: null,

    paymentCompletedAt: null,

    paymentReference: "",

    reservationStatus: "not_reserved",

    reservedAt: null,

    reservationExpiresAt: null,

    tenancyStatus: TENANCY_STATUS.NOT_STARTED,

    tenancyId: null,

    updatedAt: serverTimestamp(),
  });

  // ==========================================
  // NOTIFY TENANT
  // ==========================================

  if (application.tenantId) {
    try {
      await createNotification({
        userId: application.tenantId,

        title: "Application Rejected",

        message: `Your application for "${
          application.propertyTitle || "the property"
        }" has been rejected.${reason ? ` Reason: ${reason}` : ""}`,

        type: "rejected",

        relatedId: application.propertyId,

        relatedType: "property",
      });
    } catch (notificationError) {
      console.error("Rejection notification error:", notificationError);
    }
  }

  return {
    id: applicationId,

    ...application,

    status: APPLICATION_STATUS.REJECTED,

    rejectionReason: reason || "",

    paymentStatus: PAYMENT_STATUS.NOT_STARTED,

    paymentDeadline: null,

    reservationStatus: "not_reserved",

    tenancyStatus: TENANCY_STATUS.NOT_STARTED,

    tenancyId: null,
  };
}
