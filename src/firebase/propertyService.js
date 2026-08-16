import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firestore";

// ==========================================
// CREATE PROPERTY
// ==========================================

export async function createProperty(
  propertyData,
  ownerId,
  ownerRole = "landlord",
  agentId = null,
) {
  if (!ownerId) {
    throw new Error("Property owner is required.");
  }

  const docRef = await addDoc(collection(db, "properties"), {
    ...propertyData,

    // Actual property owner
    ownerId,

    ownerRole,

    // Agent managing the property
    agentId,

    managementType: agentId ? "agent" : "owner",

    // Property status
    status: "available",

    // Admin verification
    approvalStatus: "pending",

    featured: false,

    views: 0,

    savedCount: 0,

    applicationCount: 0,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

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

// ==========================================
// GET LANDLORD'S PROPERTIES
// ==========================================

export async function getMyProperties(ownerId) {
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

// ==========================================
// GET AGENT'S PROPERTIES
// ==========================================

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

// ==========================================
// GET ALL AVAILABLE PUBLIC PROPERTIES
// ==========================================

export async function getAllProperties() {
  const q = query(
    collection(db, "properties"),
    where(
      "status",
      "==",
      "available",
    ),
    where(
      "approvalStatus",
      "==",
      "approved",
    ),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// ==========================================
// GET ONE PROPERTY
// ==========================================

export async function getPropertyById(propertyId) {
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

// ==========================================
// UPDATE PROPERTY
// ==========================================

export async function updateProperty(propertyId, propertyData) {
  const propertyRef = doc(db, "properties", propertyId);

  await updateDoc(propertyRef, {
    ...propertyData,

    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// ASSIGN PROPERTY TO AGENT
// ==========================================

export async function assignPropertyToAgent(propertyId, agentId) {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  if (!agentId) {
    throw new Error("Agent ID is required.");
  }

  const propertyRef = doc(db, "properties", propertyId);

  await updateDoc(propertyRef, {
    agentId,

    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// REMOVE AGENT FROM PROPERTY
// ==========================================

export async function removeAgentFromProperty(propertyId) {
  const propertyRef = doc(db, "properties", propertyId);

  await updateDoc(propertyRef, {
    agentId: null,

    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// ASSIGN PROPERTY TO TENANT
// ==========================================

export async function assignPropertyToTenant(propertyId, tenantId) {
  const propertyRef = doc(db, "properties", propertyId);

  await updateDoc(propertyRef, {
    tenantId,

    status: "occupied",

    assignedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// DELETE PROPERTY
// ==========================================

export async function deleteProperty(propertyId) {
  const propertyRef = doc(db, "properties", propertyId);

  await deleteDoc(propertyRef);
}

