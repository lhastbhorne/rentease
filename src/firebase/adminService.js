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

import { createNotification } from "./notificationService";

import { db } from "./firestore";

// ==========================================
// GET ALL USERS
// ==========================================

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// ==========================================
// GET PENDING ACCOUNTS
// ==========================================
// Only landlords and agents waiting for admin
// verification are returned.
//
// Tenants are NOT included.
// ==========================================

export async function getPendingUsers() {
  const q = query(
    collection(db, "users"),
    where("accountStatus", "==", "pending"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter((user) => user.role === "landlord" || user.role === "agent");
}

// ==========================================
// APPROVE USER ACCOUNT
// ==========================================

export async function approveUser(userId, adminId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const userRef = doc(db, "users", userId);

  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found.");
  }

  const user = userSnapshot.data();

  // Only landlord and agent accounts require
  // this approval process.
  if (user.role !== "landlord" && user.role !== "agent") {
    throw new Error("Only landlord and agent accounts can be approved here.");
  }

  await updateDoc(userRef, {
    accountStatus: "approved",

    approvalStatus: "approved",

    verificationStatus: "approved",

    adminApproved: true,

    isActive: true,

    approvedBy: adminId || "",

    approvedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // ==========================================
  // NOTIFY USER
  // ==========================================

  await createNotification({
    userId,

    title: "Account Approved",

    message:
      "Congratulations! Your RentEase account has been verified and approved. You can now access your dashboard and rental management features.",

    type: "account_approved",

    relatedId: userId,

    relatedType: "user",
  });

  return true;
}

// ==========================================
// REJECT USER ACCOUNT
// ==========================================

export async function rejectUser(userId, adminId, reason = "") {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const userRef = doc(db, "users", userId);

  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found.");
  }

  const user = userSnapshot.data();

  // Only landlord and agent accounts require
  // this approval process.
  if (user.role !== "landlord" && user.role !== "agent") {
    throw new Error("Only landlord and agent accounts can be rejected here.");
  }

  await updateDoc(userRef, {
    accountStatus: "rejected",

    approvalStatus: "rejected",

    verificationStatus: "rejected",

    adminApproved: false,

    isActive: false,

    rejectionReason: reason,

    rejectedBy: adminId || "",

    rejectedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  // ==========================================
  // NOTIFY USER
  // ==========================================

  await createNotification({
    userId,

    title: "Account Verification Update",

    message: `Your RentEase account verification was not approved.${reason ? ` Reason: ${reason}` : ""}`,

    type: "account_rejected",

    relatedId: userId,

    relatedType: "user",
  });

  return true;
}

// ==========================================
// GET ALL PROPERTIES
// ==========================================

export async function getAllAdminProperties() {
  const snapshot = await getDocs(collection(db, "properties"));

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
    where("approvalStatus", "==", "pending"),
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

export async function approveProperty(propertyId, adminId) {
  const propertyRef = doc(db, "properties", propertyId);

  const propertySnapshot = await getDoc(propertyRef);

  if (!propertySnapshot.exists()) {
    throw new Error("Property not found.");
  }

  const property = propertySnapshot.data();

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

export async function rejectProperty(propertyId, adminId, reason = "") {
  const propertyRef = doc(db, "properties", propertyId);

  const propertySnapshot = await getDoc(propertyRef);

  if (!propertySnapshot.exists()) {
    throw new Error("Property not found.");
  }

  const property = propertySnapshot.data();

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

// ==========================================
// GET ALL APPLICATIONS
// ==========================================

export async function getAllAdminApplications() {
  const snapshot = await getDocs(collection(db, "applications"));

  const applications = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  applications.sort((a, b) => {
    const dateA = a.createdAt?.toMillis?.() || 0;

    const dateB = b.createdAt?.toMillis?.() || 0;

    return dateB - dateA;
  });

  return applications;
}
