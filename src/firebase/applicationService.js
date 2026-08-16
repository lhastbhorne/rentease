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

import { createTenancy } from "./tenancyService";

import {
  assignPropertyToTenant,
} from "./propertyService";

// ==========================================
// CREATE APPLICATION
// ==========================================

export async function createApplication(
  applicationData,
) {
  const {
    tenantId,
    propertyId,
  } = applicationData;

  if (!tenantId) {
    throw new Error(
      "Tenant ID is required.",
    );
  }

  if (!propertyId) {
    throw new Error(
      "Property ID is required.",
    );
  }

  // ==========================================
  // GET PROPERTY
  // ==========================================

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

  const propertySnapshot =
    await getDoc(propertyRef);

  if (!propertySnapshot.exists()) {
    throw new Error(
      "This property no longer exists.",
    );
  }

  const property = {
    id: propertySnapshot.id,
    ...propertySnapshot.data(),
  };

  // ==========================================
  // CHECK PROPERTY AVAILABILITY
  // ==========================================

  if (
    property.status &&
    property.status !== "available"
  ) {
    throw new Error(
      "This property is no longer available.",
    );
  }

  // ==========================================
  // DETERMINE PROPERTY MANAGER
  // ==========================================

  let managerId = null;
  let managerRole = null;

  // Agent-managed property
  if (
    property.managementType === "agent" &&
    property.agentId
  ) {
    managerId = property.agentId;
    managerRole = "agent";
  }

  // Landlord-managed property
  else if (property.ownerId) {
    managerId = property.ownerId;
    managerRole = "landlord";
  }

  if (!managerId) {
    throw new Error(
      "This property does not have a valid manager.",
    );
  }

  // ==========================================
  // CHECK PREVIOUS APPLICATIONS
  // ==========================================

  const q = query(
    collection(db, "applications"),
    where(
      "tenantId",
      "==",
      tenantId,
    ),
    where(
      "propertyId",
      "==",
      propertyId,
    ),
  );

  const snapshot =
    await getDocs(q);

  // Only pending and approved applications
  // prevent a new application.
  //
  // Rejected applications are allowed again.

  const activeApplication =
    snapshot.docs.find(
      (applicationDoc) => {
        const data =
          applicationDoc.data();

        return (
          data.status === "pending" ||
          data.status === "approved"
        );
      },
    );

  if (activeApplication) {
    const existing =
      activeApplication.data();

    if (
      existing.status ===
      "approved"
    ) {
      throw new Error(
        "You have already been approved for this property.",
      );
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

    propertyTitle:
      property.title ||
      applicationData.propertyTitle ||
      "",

    propertyImage:
      property.images?.[0] ||
      applicationData.propertyImage ||
      "",

    propertyAddress:
      property.address ||
      applicationData.propertyAddress ||
      "",

    propertyCity:
      property.city ||
      applicationData.propertyCity ||
      "",

    propertyState:
      property.state ||
      applicationData.propertyState ||
      "",

    propertyPrice:
      Number(property.price) ||
      Number(
        applicationData.propertyPrice,
      ) ||
      0,

    // ------------------------------------------
    // Manager
    // ------------------------------------------

    managerId,

    managerRole,

    // ------------------------------------------
    // Compatibility fields
    // ------------------------------------------

    landlordId:
      property.ownerId || null,

    agentId:
      property.agentId || null,

    // ------------------------------------------
    // Status
    // ------------------------------------------

    status: "pending",

    rejectionReason: "",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, "applications"),
    application,
  );

  // ==========================================
  // NOTIFY PROPERTY MANAGER
  // ==========================================

  try {
    await createNotification({
      userId: managerId,

      title:
        "New Rental Application",

      message: `A tenant has submitted an application for "${application.propertyTitle || "your property"}".`,

      type: "application",

      relatedId: docRef.id,

      relatedType: "application",
    });
  } catch (notificationError) {
    // Don't fail the application if notification fails.
    console.error(
      "Application notification error:",
      notificationError,
    );
  }

  return docRef.id;
}

// ==========================================
// CHECK ACTIVE APPLICATION
// ==========================================

export async function hasActiveApplication(
  tenantId,
  propertyId,
) {
  if (!tenantId || !propertyId) {
    return false;
  }

  const q = query(
    collection(db, "applications"),
    where(
      "tenantId",
      "==",
      tenantId,
    ),
    where(
      "propertyId",
      "==",
      propertyId,
    ),
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.some(
    (applicationDoc) => {
      const data =
        applicationDoc.data();

      return (
        data.status === "pending" ||
        data.status === "approved"
      );
    },
  );
}

// ==========================================
// GET TENANT APPLICATIONS
// ==========================================

export async function getMyApplications(
  tenantId,
) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, "applications"),
    where(
      "tenantId",
      "==",
      tenantId,
    ),
  );

  const snapshot =
    await getDocs(q);

  const applications =
    snapshot.docs.map(
      (item) => ({
        id: item.id,
        ...item.data(),
      }),
    );

  // Newest first
  applications.sort(
    (a, b) => {
      return (
        getApplicationDate(b) -
        getApplicationDate(a)
      );
    },
  );

  return applications;
}

// ==========================================
// GET LANDLORD APPLICATIONS
// ==========================================

export async function getLandlordApplications(
  landlordId,
) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, "applications"),
    where(
      "landlordId",
      "==",
      landlordId,
    ),
  );

  const snapshot =
    await getDocs(q);

  const applications =
    snapshot.docs.map(
      (item) => ({
        id: item.id,
        ...item.data(),
      }),
    );

  applications.sort(
    (a, b) => {
      return (
        getApplicationDate(b) -
        getApplicationDate(a)
      );
    },
  );

  return applications;
}

// ==========================================
// GET AGENT APPLICATIONS
// ==========================================

export async function getAgentApplications(
  agentId,
) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, "applications"),
    where(
      "agentId",
      "==",
      agentId,
    ),
  );

  const snapshot =
    await getDocs(q);

  const applications =
    snapshot.docs.map(
      (item) => ({
        id: item.id,
        ...item.data(),
      }),
    );

  applications.sort(
    (a, b) => {
      return (
        getApplicationDate(b) -
        getApplicationDate(a)
      );
    },
  );

  return applications;
}

// ==========================================
// GET APPLICATION DATE
// ==========================================

function getApplicationDate(
  application,
) {
  if (!application?.createdAt) {
    return 0;
  }

  // Firestore Timestamp
  if (
    typeof application.createdAt
      ?.toMillis === "function"
  ) {
    return application.createdAt.toMillis();
  }

  // JavaScript Date
  if (
    application.createdAt instanceof
    Date
  ) {
    return application.createdAt.getTime();
  }

  // Number timestamp
  if (
    typeof application.createdAt ===
    "number"
  ) {
    return application.createdAt;
  }

  return 0;
}

// ==========================================
// GET APPLICATION STATUS
// ==========================================

export async function getApplicationStatus(
  tenantId,
  propertyId,
) {
  if (!tenantId || !propertyId) {
    return null;
  }

  const q = query(
    collection(db, "applications"),
    where(
      "tenantId",
      "==",
      tenantId,
    ),
    where(
      "propertyId",
      "==",
      propertyId,
    ),
  );

  const snapshot =
    await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const applications =
    snapshot.docs.map(
      (item) => ({
        id: item.id,
        ...item.data(),
      }),
    );

  applications.sort(
    (a, b) => {
      return (
        getApplicationDate(b) -
        getApplicationDate(a)
      );
    },
  );

  return (
    applications[0]?.status ||
    null
  );
}

// ==========================================
// CHECK WHETHER TENANT HAS ACTIVE APPLICATION
// ==========================================
//
// Pending = true
// Approved = true
// Rejected = false
// No application = false
//
// This allows a tenant to reapply after rejection.
//

export async function hasAppliedForProperty(
  tenantId,
  propertyId,
) {
  return hasActiveApplication(
    tenantId,
    propertyId,
  );
}

// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================
//
// General-purpose status update.
// Use approveApplication() or rejectApplication()
// for the actual approval/rejection workflow.
//

export async function updateApplicationStatus(
  applicationId,
  status,
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required.",
    );
  }

  const applicationRef = doc(
    db,
    "applications",
    applicationId,
  );

  await updateDoc(
    applicationRef,
    {
      status,

      updatedAt:
        serverTimestamp(),
    },
  );
}

// ==========================================
// APPROVE APPLICATION
// ==========================================
//
// This performs the COMPLETE approval workflow:
//
// 1. Approve application
// 2. Create tenancy
// 3. Assign property to tenant
// 4. Notify tenant
//
// IMPORTANT:
// Do not separately call createTenancy()
// or assignPropertyToTenant() from Applications.jsx.

export async function approveApplication(
  applicationId,
  manager = null,
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required.",
    );
  }

  // ------------------------------------------
  // GET APPLICATION
  // ------------------------------------------

  const applicationRef = doc(
    db,
    "applications",
    applicationId,
  );

  const snapshot =
    await getDoc(applicationRef);

  if (!snapshot.exists()) {
    throw new Error(
      "Application not found.",
    );
  }

  const application = {
    id: snapshot.id,
    ...snapshot.data(),
  };

  // ------------------------------------------
  // CHECK STATUS
  // ------------------------------------------

  if (
    application.status !==
    "pending"
  ) {
    throw new Error(
      "This application has already been processed.",
    );
  }

  // ------------------------------------------
  // DETERMINE MANAGER
  // ------------------------------------------

  const managerId =
    manager?.uid ||
    application.managerId ||
    application.agentId ||
    application.landlordId;

  const managerRole =
    manager?.role ||
    application.managerRole ||
    (application.agentId
      ? "agent"
      : "landlord");

  const managerName =
    manager?.fullName ||
    manager?.displayName ||
    application.managerName ||
    "";

  const managerEmail =
    manager?.email ||
    application.managerEmail ||
    "";

  if (!managerId) {
    throw new Error(
      "Property manager could not be identified.",
    );
  }

  // ------------------------------------------
  // APPROVE APPLICATION
  // ------------------------------------------

  await updateDoc(
    applicationRef,
    {
      status: "approved",

      rejectionReason: "",

      approvedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  // ------------------------------------------
  // CREATE TENANCY
  // ------------------------------------------

  try {
    await createTenancy({
      application,

      tenantId:
        application.tenantId,

      managerId,

      managerRole,

      managerName,

      managerEmail,
    });
  } catch (error) {
    // Roll application back if tenancy creation
    // fails.

    await updateDoc(
      applicationRef,
      {
        status: "pending",

        updatedAt:
          serverTimestamp(),
      },
    );

    throw new Error(
      error.message ||
        "Failed to create tenancy.",
    );
  }

  // ------------------------------------------
  // ASSIGN PROPERTY
  // ------------------------------------------

  try {
    await assignPropertyToTenant(
      application.propertyId,
      application.tenantId,
    );
  } catch (error) {
    console.error(
      "Property assignment error:",
      error,
    );

    throw new Error(
      error.message ||
        "Application approved, but property assignment failed.",
    );
  }

  // ------------------------------------------
  // NOTIFY TENANT
  // ------------------------------------------

  try {
    await createNotification({
      userId:
        application.tenantId,

      title:
        "Application Approved",

      message: `Congratulations! Your application for "${application.propertyTitle || "the property"}" has been approved. Your tenancy has been created.`,

      type: "approved",

      relatedId:
        application.propertyId,

      relatedType: "property",
    });
  } catch (notificationError) {
    console.error(
      "Approval notification error:",
      notificationError,
    );
  }

  return {
    id: applicationId,

    ...application,

    status: "approved",
  };
}

// ==========================================
// REJECT APPLICATION
// ==========================================
//
// Rejected applications remain in Firestore,
// but the tenant can apply again.

export async function rejectApplication(
  applicationId,
  reason = "",
) {
  if (!applicationId) {
    throw new Error(
      "Application ID is required.",
    );
  }

  // ------------------------------------------
  // GET APPLICATION
  // ------------------------------------------

  const applicationRef = doc(
    db,
    "applications",
    applicationId,
  );

  const snapshot =
    await getDoc(applicationRef);

  if (!snapshot.exists()) {
    throw new Error(
      "Application not found.",
    );
  }

  const application = {
    id: snapshot.id,
    ...snapshot.data(),
  };

  // ------------------------------------------
  // CHECK STATUS
  // ------------------------------------------

  if (
    application.status !==
    "pending"
  ) {
    throw new Error(
      "This application has already been processed.",
    );
  }

  // ------------------------------------------
  // REJECT
  // ------------------------------------------

  await updateDoc(
    applicationRef,
    {
      status: "rejected",

      rejectionReason:
        reason || "",

      rejectedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  // ------------------------------------------
  // NOTIFY TENANT
  // ------------------------------------------

  if (application.tenantId) {
    try {
      await createNotification({
        userId:
          application.tenantId,

        title:
          "Application Rejected",

        message: `Your application for "${application.propertyTitle || "the property"}" has been rejected.${reason ? ` Reason: ${reason}` : ""}`,

        type: "rejected",

        relatedId:
          application.propertyId,

        relatedType: "property",
      });
    } catch (notificationError) {
      console.error(
        "Rejection notification error:",
        notificationError,
      );
    }
  }

  return {
    id: applicationId,

    ...application,

    status: "rejected",

    rejectionReason:
      reason || "",
  };
}