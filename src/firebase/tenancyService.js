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

// ==========================================
// CREATE TENANCY
// ==========================================

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

  // ==========================================
  // GET PROPERTY
  // ==========================================

  let property = null;

  if (application.propertyId) {
    const propertyRef = doc(
      db,
      "properties",
      application.propertyId,
    );

    const propertySnapshot =
      await getDoc(propertyRef);

    if (propertySnapshot.exists()) {
      property = {
        id: propertySnapshot.id,
        ...propertySnapshot.data(),
      };
    }
  }

  // ==========================================
  // PREVENT DUPLICATE ACTIVE TENANCY
  // ==========================================

  const existingQuery = query(
    collection(db, "tenancies"),
    where("tenantId", "==", tenantId),
    where("propertyId", "==", application.propertyId),
    where("status", "==", "active"),
  );

  const existingSnapshot =
    await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    return existingSnapshot.docs[0].id;
  }

  // ==========================================
  // CREATE TENANCY
  // ==========================================

  const tenancyData = {
    applicationId: application.id,

    // Property
    propertyId: application.propertyId,

    propertyTitle:
      property?.title ||
      application.propertyTitle ||
      "",

    propertyImage:
      property?.images?.[0] ||
      application.propertyImage ||
      "",

    propertyAddress:
      property?.address ||
      application.propertyAddress ||
      "",

    propertyCity:
      property?.city ||
      application.propertyCity ||
      "",

    propertyState:
      property?.state ||
      application.propertyState ||
      "",

    // ========================================
    // MANAGER
    // ========================================

    managerId,

    managerRole,

    managerName,

    managerEmail,

    // Keep landlordId for compatibility
    landlordId:
      property?.ownerId ||
      application.landlordId ||
      null,

    // Keep agentId for compatibility
    agentId:
      property?.agentId ||
      application.agentId ||
      null,

    // ========================================
    // TENANT
    // ========================================

    tenantId,

    tenantName:
      application.tenantName || "",

    tenantEmail:
      application.tenantEmail || "",

    tenantPhone:
      application.phone || "",

    // ========================================
    // FINANCIAL
    // ========================================

    rentAmount:
      Number(property?.price) ||
      Number(application.propertyPrice) ||
      0,

    // ========================================
    // CONTRACT
    // ========================================

    moveInDate:
      application.moveInDate || "",

    contractStartDate:
      application.moveInDate || "",

    contractEndDate: "",

    // ========================================
    // STATUS
    // ========================================

    status: "active",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  const tenancyRef = await addDoc(
    collection(db, "tenancies"),
    tenancyData,
  );

  return tenancyRef.id;
}

// ==========================================
// GET TENANT ACTIVE TENANCY
// ==========================================

export async function getMyTenancy(tenantId) {
  if (!tenantId) {
    return null;
  }

  const q = query(
    collection(db, "tenancies"),
    where("tenantId", "==", tenantId),
    where("status", "==", "active"),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const tenancyDoc = snapshot.docs[0];

  return {
    id: tenancyDoc.id,
    ...tenancyDoc.data(),
  };
}

// ==========================================
// GET LANDLORD TENANCIES
// ==========================================

export async function getLandlordTenancies(
  landlordId,
) {
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

// ==========================================
// GET AGENT TENANCIES
// ==========================================

export async function getAgentTenancies(agentId) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, "tenancies"),
    where("agentId", "==", agentId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// ==========================================
// UPDATE TENANCY STATUS
// ==========================================

export async function updateTenancyStatus(
  tenancyId,
  status,
) {
  if (!tenancyId) {
    throw new Error("Tenancy ID is required.");
  }

  await updateDoc(
    doc(db, "tenancies", tenancyId),
    {
      status,
      updatedAt: serverTimestamp(),
    },
  );
}