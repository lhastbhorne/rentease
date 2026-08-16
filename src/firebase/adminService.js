import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  createNotification,
} from "./notificationService";

import { db } from "./firestore";

// ==========================================
// GET ALL USERS
// ==========================================

export async function getAllUsers() {
  const snapshot = await getDocs(
    collection(db, "users")
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// ==========================================
// GET ALL PROPERTIES
// ==========================================

export async function getAllAdminProperties() {
  const snapshot = await getDocs(
    collection(db, "properties")
  );

  const properties = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  properties.sort((a, b) => {
    const dateA = a.createdAt?.toMillis?.() || 0;
    const dateB = b.createdAt?.toMillis?.() || 0;

    return dateB - dateA;
  });

  return properties;
}

// ==========================================
// GET PENDING PROPERTIES
// ==========================================

export async function getPendingProperties() {
  const q = query(
    collection(db, "properties"),
    where("approvalStatus", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// ==========================================
// APPROVE PROPERTY
// ==========================================

export async function approveProperty(
  propertyId,
  adminId
) {
  const propertyRef = doc(
    db,
    "properties",
    propertyId
  );

  const propertySnapshot =
    await getDoc(propertyRef);

  if (!propertySnapshot.exists()) {
    throw new Error(
      "Property not found."
    );
  }

  const property =
    propertySnapshot.data();

  await updateDoc(propertyRef, {
    approvalStatus: "approved",

    approvedBy: adminId || "",

    approvedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // Notify landlord/agent
  if (property.ownerId) {
    await createNotification({
      userId: property.ownerId,

      title: "Property Approved",

      message: `Your property "${property.title || "Property"}" has been approved and is now available on RentEase.`,

      type: "property_approved",

      relatedId: propertyId,

      relatedType: "property",
    });
  }

  return true;
}

// ==========================================
// REJECT PROPERTY
// ==========================================

export async function rejectProperty(
  propertyId,
  adminId,
  reason = ""
) {
  const propertyRef = doc(
    db,
    "properties",
    propertyId
  );

  const propertySnapshot =
    await getDoc(propertyRef);

  if (!propertySnapshot.exists()) {
    throw new Error(
      "Property not found."
    );
  }

  const property =
    propertySnapshot.data();

  await updateDoc(propertyRef, {
    approvalStatus: "rejected",

    rejectionReason: reason,

    rejectedBy: adminId || "",

    rejectedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // Notify landlord/agent
  if (property.ownerId) {
    await createNotification({
      userId: property.ownerId,

      title: "Property Rejected",

      message: `Your property "${property.title || "Property"}" was rejected.${reason ? ` Reason: ${reason}` : ""}`,

      type: "property_rejected",

      relatedId: propertyId,

      relatedType: "property",
    });
  }

  return true;
}

export async function getAllAdminApplications() {
  const snapshot = await getDocs(
    collection(db, "applications")
  );

  const applications = snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    })
  );

  applications.sort((a, b) => {
    const dateA =
      a.createdAt?.toMillis?.() || 0;

    const dateB =
      b.createdAt?.toMillis?.() || 0;

    return dateB - dateA;
  });

  return applications;
}