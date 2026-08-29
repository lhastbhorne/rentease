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

  const docRef = await addDoc(
    collection(db, "properties"),
    {
      ...propertyData,

      // Actual owner / creator
      ownerId,

      ownerRole,

      // Agent managing the property
      agentId: agentId || null,

      managementType: agentId
        ? "agent"
        : "owner",

      // Property status
      status: "available",

      // Admin verification
      approvalStatus: "pending",

      featured: false,

      views: 0,

      savedCount: 0,

      applicationCount: 0,

      // Tenant information
      tenantId: null,

      assignedAt: null,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
}

// =====================================================
// GET LANDLORDS
// =====================================================

export async function getLandlords() {
  const q = query(
    collection(db, "users"),
    where("role", "==", "landlord"),
  );

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
  const q = query(
    collection(db, "users"),
    where("role", "==", "agent"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// =====================================================
// GET LANDLORD'S PROPERTIES
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
// Used by the public properties/tenant browsing pages.
//
// We query by status only and filter approvalStatus
// in JavaScript to avoid requiring a composite index.
// =====================================================

export async function getAllProperties() {
  const q = query(
    collection(db, "properties"),
    where("status", "==", "available"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (property) =>
        property.approvalStatus === "approved",
    );
}

// =====================================================
// GET ALL PROPERTIES FOR ADMIN
// =====================================================
// Admin should be able to see pending, approved,
// rejected, available and occupied properties.
// =====================================================

export async function getAllPropertiesForAdmin() {
  const snapshot = await getDocs(
    collection(db, "properties"),
  );

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

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

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
// This is used by the tenant complaint page.
//
// A tenant can rent multiple properties, so every
// property containing their tenantId is returned.
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

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (property) =>
        property.tenantId === tenantId,
    );
}

// =====================================================
// ASSIGN PROPERTY TO TENANT
// =====================================================

export async function assignPropertyToTenant(
  propertyId,
  tenantId,
) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required.");
  }

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

  await updateDoc(propertyRef, {
    tenantId,

    status: "occupied",

    assignedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// REMOVE TENANT FROM PROPERTY
// =====================================================

export async function removeTenantFromProperty(
  propertyId,
) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

  await updateDoc(propertyRef, {
    tenantId: null,

    status: "available",

    assignedAt: null,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// UPDATE PROPERTY
// =====================================================

export async function updateProperty(
  propertyId,
  propertyData,
) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

  await updateDoc(propertyRef, {
    ...propertyData,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// ASSIGN PROPERTY TO AGENT
// =====================================================

export async function assignPropertyToAgent(
  propertyId,
  agentId,
) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  if (!agentId) {
    throw new Error("Agent ID is required.");
  }

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

  await updateDoc(propertyRef, {
    agentId,

    managementType: "agent",

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// REMOVE AGENT FROM PROPERTY
// =====================================================

export async function removeAgentFromProperty(
  propertyId,
) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

  await updateDoc(propertyRef, {
    agentId: null,

    managementType: "owner",

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// DELETE PROPERTY
// =====================================================

export async function deleteProperty(propertyId) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const propertyRef = doc(
    db,
    "properties",
    propertyId,
  );

  await deleteDoc(propertyRef);
}