import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firestore";

import { PROPERTY_STATUS, MANAGEMENT_TYPE } from "./rentalConstants";

// =====================================================
// PROPERTY STATUS
// =====================================================

// These statuses define the complete property lifecycle.
//
// available
//    ↓
// reserved
//    ↓
// occupied
//    ↓
// maintenance
//    ↓
// available
//
// IMPORTANT:
// A property becomes occupied only after successful
// payment and tenancy activation.

export { PROPERTY_STATUS };

// =====================================================
// CREATE PROPERTY
// =====================================================

export async function createProperty(
  propertyData,
  ownerId,
  ownerRole = "landlord",
  agentId = null,
) {
  if (!ownerId) {
    throw new Error("Property owner is required.");
  }

  const isAgent = ownerRole === "agent";

  const propertyRef = await addDoc(collection(db, "properties"), {
    ...propertyData,

    // =================================================
    // PROPERTY OWNER / UPLOADER
    // =================================================

    ownerId,
    ownerRole,

    // =================================================
    // PROPERTY MANAGER
    // =================================================

    // Agents manage properties they personally upload.
    //
    // Landlords do not have an agent assigned at this
    // stage of the system.

    agentId: isAgent ? ownerId : null,

    // =================================================
    // MANAGEMENT TYPE
    // =================================================

    managementType: isAgent ? MANAGEMENT_TYPE.AGENT : MANAGEMENT_TYPE.OWNER,

    // =================================================
    // PROPERTY STATUS
    // =================================================

    status: PROPERTY_STATUS.AVAILABLE,

    // =================================================
    // ADMIN VERIFICATION
    // =================================================

    approvalStatus: "pending",

    // =================================================
    // PROPERTY STATISTICS
    // =================================================

    featured: false,
    views: 0,
    savedCount: 0,
    applicationCount: 0,

    // =================================================
    // TENANT INFORMATION
    // =================================================

    tenantId: null,
    assignedAt: null,

    // =================================================
    // RESERVATION INFORMATION
    // =================================================

    reservedForApplicationId: null,
    reservedForTenantId: null,
    reservedAt: null,
    reservationExpiresAt: null,

    // =================================================
    // RENTAL INFORMATION
    // =================================================

    rentedAt: null,

    // =================================================
    // MAINTENANCE INFORMATION
    // =================================================

    maintenanceStartedAt: null,
    maintenanceReason: null,

    // =================================================
    // TIMESTAMPS
    // =================================================

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return propertyRef.id;
}

// =====================================================
// GET LANDLORDS
// =====================================================

export async function getLandlords() {
  const q = query(collection(db, "users"), where("role", "==", "landlord"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET AGENTS
// =====================================================

export async function getAgents() {
  const q = query(collection(db, "users"), where("role", "==", "agent"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET USER'S PROPERTIES
// =====================================================

export async function getMyProperties(ownerId) {
  if (!ownerId) {
    return [];
  }

  const q = query(
    collection(db, "properties"),
    where("ownerId", "==", ownerId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET AGENT'S PROPERTIES
// =====================================================

export async function getAgentProperties(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, "properties"),
    where("agentId", "==", agentId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET ALL PUBLIC AVAILABLE PROPERTIES
// =====================================================

export async function getAllProperties() {
  const q = query(
    collection(db, "properties"),
    where("status", "==", PROPERTY_STATUS.AVAILABLE),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter((property) => property.approvalStatus === "approved");
}

// =====================================================
// GET ALL PROPERTIES FOR ADMIN
// =====================================================

export async function getAllPropertiesForAdmin() {
  const snapshot = await getDocs(collection(db, "properties"));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET ONE PROPERTY
// =====================================================

export async function getPropertyById(propertyId) {
  if (!propertyId) {
    return null;
  }

  const propertyRef = doc(db, "properties", propertyId);

  const snapshot = await getDoc(propertyRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// =====================================================
// GET TENANT'S RENTED PROPERTIES
// =====================================================

export async function getTenantProperties(tenantId) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, "properties"),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// ASSIGN PROPERTY TO TENANT
// =====================================================
//
// IMPORTANT:
//
// This function is kept for compatibility with existing
// code, but it MUST NOT be used to activate a tenancy.
//
// The correct rental flow is:
//
// Application approved
//        ↓
// Property reserved
//        ↓
// Tenant pays
//        ↓
// Payment verified
//        ↓
// Tenancy created
//        ↓
// Property becomes occupied
//
// Therefore, direct tenant assignment is blocked here.
//
// The actual assignment is performed by
// completePaymentAndCreateTenancy() in tenancyService.js.
//

export async function assignPropertyToTenant(propertyId, tenantId) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  throw new Error(
    "Direct tenant assignment is disabled. A property can only become occupied after verified payment and tenancy activation.",
  );
}

// =====================================================
// REMOVE TENANT FROM PROPERTY
// =====================================================
//
// IMPORTANT:
//
// A tenant cannot simply be removed from an occupied
// property.
//
// The correct future flow is:
//
// Active tenancy
//      ↓
// Termination request
//      ↓
// Move-out / handover
//      ↓
// Refund processing if applicable
//      ↓
// Tenancy terminated
//      ↓
// Property released
//
// This will be implemented in the termination phases.
//
// Therefore this function is blocked for now.
//

export async function removeTenantFromProperty(propertyId) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  throw new Error(
    "Direct tenant removal is disabled. A property must be released through the tenancy termination process.",
  );
}

// =====================================================
// UPDATE PROPERTY
// =====================================================
//
// A property can only be edited when it is AVAILABLE.
//
// RESERVED properties are temporarily locked because a
// tenant has an approved application and a payment window.
//
// OCCUPIED properties are locked because they have an
// active tenant.
//
// MAINTENANCE properties are also locked until the
// maintenance lifecycle is implemented.
//

export async function updateProperty(propertyId, propertyData) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(db, "properties", propertyId);

  const snapshot = await getDoc(propertyRef);

  if (!snapshot.exists()) {
    throw new Error("Property not found.");
  }

  const property = snapshot.data();

  const lockedStatuses = [
    PROPERTY_STATUS.RESERVED,
    PROPERTY_STATUS.OCCUPIED,
    PROPERTY_STATUS.MAINTENANCE,
  ];

  if (lockedStatuses.includes(property.status)) {
    throw new Error(
      `This property cannot be edited while its status is "${property.status}".`,
    );
  }

  await updateDoc(propertyRef, {
    ...propertyData,
    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// ASSIGN PROPERTY TO AGENT
// =====================================================
//
// Reserved for the future landlord → agent handover
// system.
//
// DO NOT use this feature yet.
//

export async function assignPropertyToAgent(propertyId, agentId) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  if (!agentId) {
    throw new Error("Agent ID is required.");
  }

  const propertyRef = doc(db, "properties", propertyId);

  const snapshot = await getDoc(propertyRef);

  if (!snapshot.exists()) {
    throw new Error("Property not found.");
  }

  const property = snapshot.data();

  if (property.status !== PROPERTY_STATUS.AVAILABLE) {
    throw new Error("Only available properties can be assigned to an agent.");
  }

  await updateDoc(propertyRef, {
    agentId,
    managementType: MANAGEMENT_TYPE.AGENT,
    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// REMOVE AGENT FROM PROPERTY
// =====================================================
//
// Reserved for the future landlord → agent handover
// system.
//

export async function removeAgentFromProperty(propertyId) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(db, "properties", propertyId);

  const snapshot = await getDoc(propertyRef);

  if (!snapshot.exists()) {
    throw new Error("Property not found.");
  }

  const property = snapshot.data();

  if (property.status !== PROPERTY_STATUS.AVAILABLE) {
    throw new Error(
      "The agent cannot be removed while the property is not available.",
    );
  }

  await updateDoc(propertyRef, {
    agentId: null,
    managementType: MANAGEMENT_TYPE.OWNER,
    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// DELETE PROPERTY
// =====================================================
//
// Properties cannot be deleted while they are:
//
// reserved
// occupied
// maintenance
//
// This protects active rental records and prevents a
// property from disappearing while it is connected to
// applications, payments, or tenancies.
//

export async function deleteProperty(propertyId) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(db, "properties", propertyId);

  const snapshot = await getDoc(propertyRef);

  if (!snapshot.exists()) {
    throw new Error("Property not found.");
  }

  const property = snapshot.data();

  const lockedStatuses = [
    PROPERTY_STATUS.RESERVED,
    PROPERTY_STATUS.OCCUPIED,
    PROPERTY_STATUS.MAINTENANCE,
  ];

  if (lockedStatuses.includes(property.status)) {
    throw new Error(
      `This property cannot be deleted while its status is "${property.status}".`,
    );
  }

  await deleteDoc(propertyRef);
}
