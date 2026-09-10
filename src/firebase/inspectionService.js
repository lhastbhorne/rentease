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
import { createNotification } from "./notificationService";

import {
  INSPECTION_FEE,
  INSPECTION_STATUS,
  INSPECTION_TYPE,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  TRANSACTION_CURRENCY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "./rentalConstants";

// =====================================================
// COLLECTIONS
// =====================================================

const INSPECTIONS_COLLECTION = "inspections";
const PAYMENTS_COLLECTION = "payments";
const TRANSACTIONS_COLLECTION = "transactions";

// =====================================================
// ACTIVE INSPECTION STATUSES
// =====================================================

const ACTIVE_INSPECTION_STATUSES = [
  INSPECTION_STATUS.PENDING,
  INSPECTION_STATUS.ACCEPTED,
  INSPECTION_STATUS.PAYMENT_PENDING,
  INSPECTION_STATUS.CONFIRMED,
  INSPECTION_STATUS.RESCHEDULED,
  INSPECTION_STATUS.AWAITING_TENANT_CONFIRMATION,
];

// =====================================================
// CREATE INSPECTION REQUEST
// =====================================================

export async function createInspectionRequest(inspectionData) {
  if (!inspectionData) {
    throw new Error("Inspection request information is required.");
  }

  if (!inspectionData.propertyId) {
    throw new Error("Property ID is required.");
  }

  if (!inspectionData.tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!inspectionData.requestedDate) {
    throw new Error("Inspection date is required.");
  }

  if (!inspectionData.requestedTime) {
    throw new Error("Inspection time is required.");
  }

  if (!inspectionData.managerId) {
    throw new Error("Property manager could not be identified.");
  }

  // ===================================================
  // PREVENT DUPLICATE ACTIVE REQUEST
  // ===================================================

  const existingQuery = query(
    collection(db, INSPECTIONS_COLLECTION),
    where("tenantId", "==", inspectionData.tenantId),
    where("propertyId", "==", inspectionData.propertyId),
  );

  const existingSnapshot = await getDocs(existingQuery);

  const activeInspection = existingSnapshot.docs.find((item) => {
    const data = item.data();

    return ACTIVE_INSPECTION_STATUSES.includes(data.status);
  });

  if (activeInspection) {
    throw new Error(
      "You already have an active inspection request for this property. Please wait for the current request to be completed, rejected, or cancelled.",
    );
  }

  // ===================================================
  // INSPECTION DATA
  // ===================================================

  const inspection = {
    type: inspectionData.type || INSPECTION_TYPE.PROPERTY_VIEWING,

    status: INSPECTION_STATUS.PENDING,

    // =================================================
    // PROPERTY
    // =================================================

    propertyId: inspectionData.propertyId,

    propertyTitle: inspectionData.propertyTitle || "",

    propertyImage: inspectionData.propertyImage || "",

    propertyAreaName: inspectionData.propertyAreaName || "",

    propertyCity: inspectionData.propertyCity || "",

    propertyState: inspectionData.propertyState || "",

    // =================================================
    // TENANT
    // =================================================

    tenantId: inspectionData.tenantId,

    tenantName: inspectionData.tenantName || "",

    tenantEmail: inspectionData.tenantEmail || "",

    tenantPhone: inspectionData.tenantPhone || "",

    // =================================================
    // PROPERTY MANAGER
    // =================================================

    managerId: inspectionData.managerId,

    managerRole: inspectionData.managerRole || "",

    managerName: inspectionData.managerName || "",

    // =================================================
    // ORIGINAL REQUEST
    // =================================================

    requestedDate: inspectionData.requestedDate,

    requestedTime: inspectionData.requestedTime,

    message: inspectionData.message || "",

    // =================================================
    // CONFIRMED SCHEDULE
    // =================================================

    confirmedDate: null,

    confirmedTime: null,

    // =================================================
    // RESCHEDULE
    // =================================================

    proposedDate: null,

    proposedTime: null,

    rescheduleReason: "",

    // =================================================
    // TENANT RESPONSE
    // =================================================

    tenantResponse: null,

    tenantResponseMessage: "",

    tenantRespondedAt: null,

    // =================================================
    // MANAGER RESPONSE
    // =================================================

    responseMessage: "",

    respondedAt: null,

    respondedBy: null,

    // =================================================
    // INSPECTION FEE
    // =================================================
    // NO PAYMENT IS REQUIRED AT REQUEST STAGE.

    feeStatus: "not_started",

    inspectionFee: INSPECTION_FEE,

    paymentReference: "",

    paymentId: null,

    transactionId: null,

    paymentProvider: PAYMENT_PROVIDER.PAYSTACK,

    // =================================================
    // TIMESTAMPS
    // =================================================

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  const inspectionRef = await addDoc(
    collection(db, INSPECTIONS_COLLECTION),
    inspection,
  );

  // =====================================================
  // NOTIFY PROPERTY MANAGER
  // =====================================================

  try {
    await createNotification({
      userId: inspectionData.managerId,

      title: "New Inspection Request",

      message: `${
        inspectionData.tenantName || "A tenant"
      } has requested an inspection for "${
        inspectionData.propertyTitle || "your property"
      }" on ${inspectionData.requestedDate} at ${
        inspectionData.requestedTime
      }.`,

      type: "inspection",

      relatedId: inspectionRef.id,

      relatedType: "inspection",

      link:
        inspectionData.managerRole === "agent"
          ? "/agent/inspections"
          : "/landlord/inspections",
    });
  } catch (notificationError) {
    console.error("Inspection notification error:", notificationError);
  }

  return {
    id: inspectionRef.id,
    ...inspection,
  };
}

// =====================================================
// CREATE INSPECTION PAYMENT
// =====================================================
// IMPORTANT:
// This should ONLY be called after the manager has
// accepted the inspection.
//
// For now this records a development payment.
// Real Paystack verification will replace this later.
// =====================================================

export async function createInspectionPayment(
  inspectionId,
  tenantId,
  paymentReference,
) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!paymentReference) {
    throw new Error("Payment reference is required.");
  }

  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (inspection.tenantId !== tenantId) {
    throw new Error("You are not authorized to pay for this inspection.");
  }

  // ===================================================
  // PAYMENT ONLY AFTER ACCEPTANCE
  // ===================================================

  if (
    inspection.status !== INSPECTION_STATUS.PAYMENT_PENDING &&
    inspection.status !== INSPECTION_STATUS.ACCEPTED
  ) {
    throw new Error("This inspection is not currently awaiting payment.");
  }

  if (
    inspection.feeStatus === "successful" ||
    inspection.feeStatus === "paid"
  ) {
    throw new Error("This inspection fee has already been paid.");
  }

  const amount = Number(inspection.inspectionFee) || INSPECTION_FEE;

  // ===================================================
  // PAYMENT RECORD
  // ===================================================

  const paymentRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
    tenantId,

    inspectionId,

    propertyId: inspection.propertyId || null,

    paymentType: TRANSACTION_TYPE.INSPECTION,

    amount,

    grossAmount: amount,

    platformFee: 0,

    platformFeeRate: 0,

    managerAmount: 0,

    currency: TRANSACTION_CURRENCY.NGN,

    status: PAYMENT_STATUS.SUCCESSFUL,

    paymentProvider: PAYMENT_PROVIDER.PAYSTACK,

    paymentReference,

    description: `Inspection fee for ${inspection.propertyTitle || "property"}`,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // ===================================================
  // TRANSACTION LEDGER
  // ===================================================

  const transactionRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    type: TRANSACTION_TYPE.INSPECTION,

    status: TRANSACTION_STATUS.SUCCESSFUL,

    payerId: tenantId,

    payerRole: "tenant",

    recipientId: null,

    recipientRole: null,

    paymentId: paymentRef.id,

    inspectionId,

    propertyId: inspection.propertyId || null,

    grossAmount: amount,

    platformFee: 0,

    platformFeeRate: 0,

    recipientAmount: 0,

    rentEaseAmount: amount,

    currency: TRANSACTION_CURRENCY.NGN,

    paymentProvider: PAYMENT_PROVIDER.PAYSTACK,

    paymentReference,

    description: `Inspection fee - ${inspection.propertyTitle || "property"}`,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // ===================================================
  // CONFIRM INSPECTION
  // ===================================================

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    status: INSPECTION_STATUS.CONFIRMED,

    feeStatus: "successful",

    paymentReference,

    paymentId: paymentRef.id,

    transactionId: transactionRef.id,

    paymentProvider: PAYMENT_PROVIDER.PAYSTACK,

    updatedAt: serverTimestamp(),
  });

  // ===================================================
  // NOTIFY MANAGER
  // ===================================================

  if (inspection.managerId) {
    try {
      await createNotification({
        userId: inspection.managerId,

        title: "Inspection Fee Paid",

        message: `${
          inspection.tenantName || "The tenant"
        } has paid the inspection fee for "${
          inspection.propertyTitle || "your property"
        }". The inspection is now confirmed.`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link:
          inspection.managerRole === "agent"
            ? "/agent/inspections"
            : "/landlord/inspections",
      });
    } catch (error) {
      console.error("Manager payment notification error:", error);
    }
  }

  return {
    paymentId: paymentRef.id,

    transactionId: transactionRef.id,

    inspectionId,

    amount,

    feeStatus: "successful",

    paymentReference,
  };
}

// =====================================================
// GET INSPECTION BY ID
// =====================================================

export async function getInspectionById(inspectionId) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  const inspectionRef = doc(db, INSPECTIONS_COLLECTION, inspectionId);

  const snapshot = await getDoc(inspectionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// =====================================================
// GET TENANT INSPECTIONS
// =====================================================

export async function getMyInspections(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, INSPECTIONS_COLLECTION),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const inspections = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  inspections.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return inspections;
}

// =====================================================
// GET LANDLORD INSPECTIONS
// =====================================================

export async function getLandlordInspections(landlordId) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, INSPECTIONS_COLLECTION),
    where("managerId", "==", landlordId),
    where("managerRole", "==", "landlord"),
  );

  const snapshot = await getDocs(q);

  const inspections = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  inspections.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return inspections;
}

// =====================================================
// GET AGENT INSPECTIONS
// =====================================================

export async function getAgentInspections(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, INSPECTIONS_COLLECTION),
    where("managerId", "==", agentId),
    where("managerRole", "==", "agent"),
  );

  const snapshot = await getDocs(q);

  const inspections = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  inspections.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return inspections;
}

// =====================================================
// GET PROPERTY INSPECTIONS
// =====================================================

export async function getPropertyInspections(propertyId) {
  if (!propertyId) {
    return [];
  }

  const q = query(
    collection(db, INSPECTIONS_COLLECTION),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  const inspections = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  inspections.sort(
    (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
  );

  return inspections;
}

// =====================================================
// UPDATE INSPECTION STATUS
// =====================================================

export async function updateInspectionStatus(
  inspectionId,
  status,
  responseMessage = "",
  respondedBy = null,
) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  if (!Object.values(INSPECTION_STATUS).includes(status)) {
    throw new Error("Invalid inspection status.");
  }

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    status,

    responseMessage,

    respondedBy,

    respondedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// ACCEPT INSPECTION
// =====================================================

export async function acceptInspection(
  inspectionId,
  responseMessage = "",
  managerId = null,
) {
  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (inspection.status !== INSPECTION_STATUS.PENDING) {
    throw new Error("Only pending inspection requests can be accepted.");
  }

  const confirmedDate = inspection.proposedDate || inspection.requestedDate;

  const confirmedTime = inspection.proposedTime || inspection.requestedTime;

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    // ACCEPTED = manager accepted it.
    // PAYMENT_PENDING = tenant must now pay.
    status: INSPECTION_STATUS.PAYMENT_PENDING,

    confirmedDate,

    confirmedTime,

    responseMessage,

    respondedBy: managerId,

    respondedAt: serverTimestamp(),

    feeStatus: "pending",

    updatedAt: serverTimestamp(),
  });

  // ===================================================
  // NOTIFY TENANT
  // ===================================================

  if (inspection.tenantId) {
    try {
      await createNotification({
        userId: inspection.tenantId,

        title: "Inspection Accepted - Payment Required",

        message: `Your inspection request for "${
          inspection.propertyTitle || "the property"
        }" has been accepted. Please pay the ₦${(
          inspection.inspectionFee || INSPECTION_FEE
        ).toLocaleString()} inspection fee to confirm your inspection.`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link: "/tenant/inspections",
      });
    } catch (error) {
      console.error("Tenant inspection notification error:", error);
    }
  }
}

// =====================================================
// REJECT INSPECTION
// =====================================================

export async function rejectInspection(
  inspectionId,
  responseMessage = "",
  managerId = null,
) {
  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (
    inspection.status !== INSPECTION_STATUS.PENDING &&
    inspection.status !== INSPECTION_STATUS.RESCHEDULED &&
    inspection.status !== INSPECTION_STATUS.AWAITING_TENANT_CONFIRMATION
  ) {
    throw new Error("This inspection request cannot be rejected.");
  }

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    status: INSPECTION_STATUS.REJECTED,

    responseMessage,

    respondedBy: managerId,

    respondedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // ===================================================
  // NOTIFY TENANT
  // ===================================================

  if (inspection.tenantId) {
    try {
      await createNotification({
        userId: inspection.tenantId,

        title: "Inspection Request Declined",

        message: `Your inspection request for "${
          inspection.propertyTitle || "the property"
        }" was declined.${
          responseMessage ? ` Message: ${responseMessage}` : ""
        }`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link: "/tenant/inspections",
      });
    } catch (error) {
      console.error("Tenant inspection notification error:", error);
    }
  }
}

// =====================================================
// RESCHEDULE INSPECTION
// =====================================================

export async function rescheduleInspection(
  inspectionId,
  proposedDate,
  proposedTime,
  reason = "",
  managerId = null,
) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  if (!proposedDate) {
    throw new Error("Proposed inspection date is required.");
  }

  if (!proposedTime) {
    throw new Error("Proposed inspection time is required.");
  }

  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (
    inspection.status !== INSPECTION_STATUS.PENDING &&
    inspection.status !== INSPECTION_STATUS.RESCHEDULED
  ) {
    throw new Error("This inspection cannot be rescheduled.");
  }

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    status: INSPECTION_STATUS.RESCHEDULED,

    proposedDate,

    proposedTime,

    rescheduleReason: reason,

    responseMessage: reason,

    respondedBy: managerId,

    respondedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // ===================================================
  // NOTIFY TENANT
  // ===================================================

  if (inspection.tenantId) {
    try {
      await createNotification({
        userId: inspection.tenantId,

        title: "Inspection Rescheduled",

        message: `The inspection for "${
          inspection.propertyTitle || "the property"
        }" has been proposed for ${proposedDate} at ${proposedTime}. Please review the new time.`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link: "/tenant/inspections",
      });
    } catch (error) {
      console.error("Tenant reschedule notification error:", error);
    }
  }
}

// =====================================================
// TENANT ACCEPTS RESCHEDULE
// =====================================================

export async function acceptRescheduledInspection(
  inspectionId,
  tenantId,
  responseMessage = "",
) {
  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (inspection.tenantId !== tenantId) {
    throw new Error("You are not authorized to respond to this inspection.");
  }

  if (inspection.status !== INSPECTION_STATUS.RESCHEDULED) {
    throw new Error(
      "There is no proposed inspection time awaiting your response.",
    );
  }

  if (!inspection.proposedDate || !inspection.proposedTime) {
    throw new Error("No proposed inspection schedule was found.");
  }

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    status: INSPECTION_STATUS.PAYMENT_PENDING,

    confirmedDate: inspection.proposedDate,

    confirmedTime: inspection.proposedTime,

    tenantResponse: "accepted",

    tenantResponseMessage: responseMessage,

    tenantRespondedAt: serverTimestamp(),

    feeStatus: "pending",

    updatedAt: serverTimestamp(),
  });

  // ===================================================
  // NOTIFY MANAGER
  // ===================================================

  if (inspection.managerId) {
    try {
      await createNotification({
        userId: inspection.managerId,

        title: "Inspection Time Accepted",

        message: `${
          inspection.tenantName || "The tenant"
        } accepted the proposed inspection time for "${
          inspection.propertyTitle || "your property"
        }". The tenant must now pay the inspection fee.`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link:
          inspection.managerRole === "agent"
            ? "/agent/inspections"
            : "/landlord/inspections",
      });
    } catch (error) {
      console.error("Manager inspection notification error:", error);
    }
  }
}

// =====================================================
// TENANT REJECTS RESCHEDULE
// =====================================================

export async function rejectRescheduledInspection(
  inspectionId,
  tenantId,
  responseMessage = "",
) {
  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (inspection.tenantId !== tenantId) {
    throw new Error("You are not authorized to respond to this inspection.");
  }

  if (inspection.status !== INSPECTION_STATUS.RESCHEDULED) {
    throw new Error(
      "There is no proposed inspection time awaiting your response.",
    );
  }

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    status: INSPECTION_STATUS.CANCELLED,

    tenantResponse: "rejected",

    tenantResponseMessage: responseMessage,

    tenantRespondedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  if (inspection.managerId) {
    try {
      await createNotification({
        userId: inspection.managerId,

        title: "Inspection Time Rejected",

        message: `${
          inspection.tenantName || "The tenant"
        } rejected the proposed inspection time for "${
          inspection.propertyTitle || "your property"
        }".`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link:
          inspection.managerRole === "agent"
            ? "/agent/inspections"
            : "/landlord/inspections",
      });
    } catch (error) {
      console.error("Manager inspection notification error:", error);
    }
  }
}

// =====================================================
// CANCEL INSPECTION
// =====================================================

export async function cancelInspection(
  inspectionId,
  cancelledBy = null,
  cancelledByRole = "tenant",
  cancellationReason = "",
) {
  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (
    inspection.status === INSPECTION_STATUS.COMPLETED ||
    inspection.status === INSPECTION_STATUS.CANCELLED
  ) {
    throw new Error("This inspection cannot be cancelled.");
  }

  await updateDoc(doc(db, INSPECTIONS_COLLECTION, inspectionId), {
    status: INSPECTION_STATUS.CANCELLED,

    responseMessage: cancellationReason,

    respondedBy: cancelledBy,

    respondedAt: serverTimestamp(),

    cancelledByRole,

    cancellationReason,

    updatedAt: serverTimestamp(),
  });

  const recipientId =
    cancelledByRole === "tenant" ? inspection.managerId : inspection.tenantId;

  if (recipientId) {
    try {
      await createNotification({
        userId: recipientId,

        title: "Inspection Cancelled",

        message: `The inspection request for "${
          inspection.propertyTitle || "the property"
        }" has been cancelled.${
          cancellationReason ? ` Reason: ${cancellationReason}` : ""
        }`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link:
          cancelledByRole === "tenant"
            ? inspection.managerRole === "agent"
              ? "/agent/inspections"
              : "/landlord/inspections"
            : "/tenant/inspections",
      });
    } catch (error) {
      console.error("Inspection cancellation notification error:", error);
    }
  }
}

// =====================================================
// COMPLETE INSPECTION
// =====================================================

// =====================================================
// MANAGER MARKS INSPECTION AS COMPLETION PENDING
// =====================================================

// =====================================================
// MANAGER MARKS INSPECTION AS COMPLETED
// =====================================================

export async function completeInspection(
  inspectionId,
  managerId = null,
) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  if (!managerId) {
    throw new Error("Manager ID is required.");
  }

  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  // Make sure this manager owns the inspection
  if (inspection.managerId !== managerId) {
    throw new Error(
      "You are not authorized to complete this inspection.",
    );
  }

  // ---------------------------------------------------
  // CASE 1:
  // Tenant has already confirmed completion.
  // Manager is the second party.
  // ---------------------------------------------------

  if (
    inspection.status ===
      INSPECTION_STATUS.COMPLETION_PENDING_CONFIRMATION &&
    inspection.tenantCompletionConfirmed === true
  ) {
    await updateDoc(
      doc(db, INSPECTIONS_COLLECTION, inspectionId),
      {
        status: INSPECTION_STATUS.COMPLETED,

        managerCompletionConfirmed: true,
        managerCompletionConfirmedBy: managerId,
        managerCompletionConfirmedAt: serverTimestamp(),

        completedAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      },
    );

    if (inspection.tenantId) {
      try {
        await createNotification({
          userId: inspection.tenantId,

          title: "Inspection Completed",

          message: `The inspection for "${
            inspection.propertyTitle || "the property"
          }" has been confirmed by the property manager and is now officially completed.`,

          type: "inspection",

          relatedId: inspectionId,

          relatedType: "inspection",

          link: "/tenant/inspections",
        });
      } catch (error) {
        console.error(
          "Tenant completion notification error:",
          error,
        );
      }
    }

    return {
      status: INSPECTION_STATUS.COMPLETED,
    };
  }

  // ---------------------------------------------------
  // CASE 2:
  // Manager is the first party confirming completion.
  // ---------------------------------------------------

  if (
    inspection.status === INSPECTION_STATUS.CONFIRMED
  ) {
    const completionDeadline = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await updateDoc(
      doc(db, INSPECTIONS_COLLECTION, inspectionId),
      {
        status:
          INSPECTION_STATUS.COMPLETION_PENDING_CONFIRMATION,

        managerCompletionConfirmed: true,
        managerCompletionConfirmedBy: managerId,
        managerCompletionConfirmedAt: serverTimestamp(),

        completionConfirmationDeadline:
          completionDeadline,

        updatedAt: serverTimestamp(),
      },
    );

    // Notify tenant
    if (inspection.tenantId) {
      try {
        await createNotification({
          userId: inspection.tenantId,

          title: "Confirm Inspection Completion",

          message: `The inspection for "${
            inspection.propertyTitle || "the property"
          }" has been marked as completed by the property manager. Please confirm the inspection within 24 hours.`,

          type: "inspection",

          relatedId: inspectionId,

          relatedType: "inspection",

          link: "/tenant/inspections",
        });
      } catch (error) {
        console.error(
          "Tenant completion confirmation notification error:",
          error,
        );
      }
    }

    return {
      status:
        INSPECTION_STATUS.COMPLETION_PENDING_CONFIRMATION,
    };
  }

  throw new Error(
    "This inspection cannot currently be marked as completed.",
  );
}

// =====================================================
// MANAGER CONFIRMS INSPECTION COMPLETION
// =====================================================

export async function confirmInspectionCompletionByManager(
  inspectionId,
  managerId,
) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  if (!managerId) {
    throw new Error("Manager ID is required.");
  }

  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  if (inspection.managerId !== managerId) {
    throw new Error(
      "You are not authorized to confirm this inspection.",
    );
  }

  if (
    inspection.status !==
    INSPECTION_STATUS.COMPLETION_PENDING_CONFIRMATION
  ) {
    throw new Error(
      "This inspection is not awaiting completion confirmation.",
    );
  }

  // ---------------------------------------------------
  // Check 24-hour confirmation window
  // ---------------------------------------------------

  const deadline = getTimestamp(
    inspection.completionConfirmationDeadline,
  );

  if (deadline && Date.now() > deadline) {
    await updateDoc(
      doc(db, INSPECTIONS_COLLECTION, inspectionId),
      {
        status:
          INSPECTION_STATUS.COMPLETION_CONFIRMATION_EXPIRED,

        updatedAt: serverTimestamp(),
      },
    );

    throw new Error(
      "The 24-hour inspection confirmation window has expired.",
    );
  }

  // ---------------------------------------------------
  // If tenant already confirmed, inspection completes.
  // ---------------------------------------------------

  if (inspection.tenantCompletionConfirmed === true) {
    await updateDoc(
      doc(db, INSPECTIONS_COLLECTION, inspectionId),
      {
        status: INSPECTION_STATUS.COMPLETED,

        managerCompletionConfirmed: true,
        managerCompletionConfirmedBy: managerId,
        managerCompletionConfirmedAt: serverTimestamp(),

        completedAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      },
    );

    if (inspection.tenantId) {
      try {
        await createNotification({
          userId: inspection.tenantId,

          title: "Inspection Completed",

          message: `The inspection for "${
            inspection.propertyTitle || "the property"
          }" has now been officially completed.`,

          type: "inspection",

          relatedId: inspectionId,

          relatedType: "inspection",

          link: "/tenant/inspections",
        });
      } catch (error) {
        console.error(
          "Tenant completion notification error:",
          error,
        );
      }
    }

    return {
      status: INSPECTION_STATUS.COMPLETED,
    };
  }

  // ---------------------------------------------------
  // Manager confirms first
  // ---------------------------------------------------

  await updateDoc(
    doc(db, INSPECTIONS_COLLECTION, inspectionId),
    {
      managerCompletionConfirmed: true,
      managerCompletionConfirmedBy: managerId,
      managerCompletionConfirmedAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
  );

  // Notify tenant
  if (inspection.tenantId) {
    try {
      await createNotification({
        userId: inspection.tenantId,

        title: "Confirm Inspection Completion",

        message: `The property manager has confirmed completion of the inspection for "${
          inspection.propertyTitle || "the property"
        }". Please confirm within the remaining confirmation window.`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link: "/tenant/inspections",
      });
    } catch (error) {
      console.error(
        "Tenant completion notification error:",
        error,
      );
    }
  }

  return {
    status:
      INSPECTION_STATUS.COMPLETION_PENDING_CONFIRMATION,
  };
}

// =====================================================
// TENANT MARKS INSPECTION AS COMPLETED
// =====================================================

export async function markInspectionCompletedByTenant(
  inspectionId,
  tenantId,
) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  // Make sure this is the tenant who requested
  // the inspection.
  if (inspection.tenantId !== tenantId) {
    throw new Error(
      "You are not authorized to complete this inspection.",
    );
  }

  // The inspection must have been confirmed and paid.
  if (inspection.status !== INSPECTION_STATUS.CONFIRMED) {
    throw new Error(
      "Only confirmed inspections can be marked as completed.",
    );
  }

  const completionDeadline = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );

  await updateDoc(
    doc(db, INSPECTIONS_COLLECTION, inspectionId),
    {
      status:
        INSPECTION_STATUS.COMPLETION_PENDING_CONFIRMATION,

      tenantCompletionConfirmed: true,
      tenantCompletionConfirmedBy: tenantId,
      tenantCompletionConfirmedAt: serverTimestamp(),

      completionConfirmationDeadline:
        completionDeadline,

      updatedAt: serverTimestamp(),
    },
  );

  // Notify landlord/agent
  if (inspection.managerId) {
    try {
      const managerLink =
        inspection.managerRole === "agent"
          ? "/agent/inspections"
          : "/landlord/inspections";

      await createNotification({
        userId: inspection.managerId,

        title: "Confirm Inspection Completion",

        message: `The tenant has marked the inspection for "${
          inspection.propertyTitle || "the property"
        }" as completed. Please confirm the inspection within 24 hours.`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link: managerLink,
      });
    } catch (error) {
      console.error(
        "Manager completion confirmation notification error:",
        error,
      );
    }
  }
}

// =====================================================
// TENANT CONFIRMS INSPECTION COMPLETION
// =====================================================

export async function confirmInspectionCompletion(
  inspectionId,
  tenantId,
) {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  const inspection = await getInspectionById(inspectionId);

  if (!inspection) {
    throw new Error("Inspection request not found.");
  }

  // Make sure this is the tenant who requested
  // the inspection.
  if (inspection.tenantId !== tenantId) {
    throw new Error(
      "You are not authorized to confirm this inspection.",
    );
  }

  if (
    inspection.status !==
    INSPECTION_STATUS.COMPLETION_PENDING_CONFIRMATION
  ) {
    throw new Error(
      "This inspection is not awaiting completion confirmation.",
    );
  }

  // Check the 24-hour deadline.
  const deadline =
    getTimestamp(inspection.completionConfirmationDeadline);

  if (deadline && Date.now() > deadline) {
    await updateDoc(
      doc(db, INSPECTIONS_COLLECTION, inspectionId),
      {
        status:
          INSPECTION_STATUS.COMPLETION_CONFIRMATION_EXPIRED,

        updatedAt: serverTimestamp(),
      },
    );

    throw new Error(
      "The 24-hour inspection confirmation window has expired.",
    );
  }

  await updateDoc(
    doc(db, INSPECTIONS_COLLECTION, inspectionId),
    {
      status: INSPECTION_STATUS.COMPLETED,

      tenantCompletionConfirmed: true,
      tenantCompletionConfirmedBy: tenantId,
      tenantCompletionConfirmedAt: serverTimestamp(),

      completedAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
  );

  // Notify manager
  if (inspection.managerId) {
    try {
      const managerLink =
        inspection.managerRole === "agent"
          ? "/agent/inspections"
          : "/landlord/inspections";

      await createNotification({
        userId: inspection.managerId,

        title: "Inspection Completed",

        message: `The tenant has confirmed completion of the inspection for "${
          inspection.propertyTitle || "the property"
        }".`,

        type: "inspection",

        relatedId: inspectionId,

        relatedType: "inspection",

        link: managerLink,
      });
    } catch (error) {
      console.error(
        "Manager completion notification error:",
        error,
      );
    }
  }
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
