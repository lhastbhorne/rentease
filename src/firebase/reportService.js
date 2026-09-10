import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firestore";

/**
 * Create a report against a landlord or agent.
 */
export async function createReport({
  reporterId,
  reporterName = "",
  reporterEmail = "",
  reportedUserId,
  reportedUserName = "",
  reportedUserEmail = "",
  reportedUserRole,
  propertyId = "",
  propertyTitle = "",
  reason,
  description,
  evidence = [],
}) {
  if (!reporterId) {
    throw new Error("Reporter is required.");
  }

  if (!reportedUserId) {
    throw new Error("Reported user is required.");
  }

  if (reporterId === reportedUserId) {
    throw new Error("You cannot report your own account.");
  }

  if (!reportedUserRole) {
    throw new Error("Reported user role is required.");
  }

  if (!["landlord", "agent"].includes(reportedUserRole)) {
    throw new Error("Only landlords and agents can be reported.");
  }

  if (!reason) {
    throw new Error("Report reason is required.");
  }

  if (!description?.trim()) {
    throw new Error("Please provide a description.");
  }

  const reportData = {
    reporterId,
    reporterName,
    reporterEmail,
    reporterRole: "tenant",

    reportedUserId,
    reportedUserName,
    reportedUserEmail,
    reportedUserRole,

    propertyId,
    propertyTitle,

    reason,
    description: description.trim(),
    evidence,

    status: "pending",

    createdAt: serverTimestamp(),

    reviewedAt: null,
    reviewedBy: "",

    adminNotes: "",
  };

  const reportRef = await addDoc(collection(db, "reports"), reportData);

  return {
    id: reportRef.id,
    ...reportData,
  };
}

/**
 * Get all reports.
 */
export async function getAllReports() {
  const reportsQuery = query(
    collection(db, "reports"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

/**
 * Mark a report as under review.
 */
export async function markReportUnderReview(reportId, adminId) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!adminId) {
    throw new Error("Admin ID is required.");
  }

  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    status: "under_review",
    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),
  });
}

/**
 * Dismiss a report.
 *
 * The reported account remains active.
 */
export async function dismissReport(reportId, adminId, adminNotes = "") {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!adminId) {
    throw new Error("Admin ID is required.");
  }

  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    status: "dismissed",

    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),

    adminNotes: adminNotes.trim(),
  });
}

/**
 * Suspend a landlord or agent because of a report.
 *
 * The account is NOT deleted.
 * The user will be given an opportunity to appeal.
 */
export async function suspendReportedUser({
  reportId,
  userId,
  adminId,
  reason,
  appealDeadline,
}) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!adminId) {
    throw new Error("Admin ID is required.");
  }

  if (!reason?.trim()) {
    throw new Error("Suspension reason is required.");
  }

  if (!appealDeadline) {
    throw new Error("Appeal deadline is required.");
  }

  const userRef = doc(db, "users", userId);

  const reportRef = doc(db, "reports", reportId);

  /*
   * Suspend the reported account.
   */
  await updateDoc(userRef, {
    enforcementStatus: "suspended",

    suspensionReason: reason.trim(),

    suspendedBy: adminId,
    suspendedAt: serverTimestamp(),

    appealDeadline,

    appealStatus: "none",

    isActive: false,

    updatedAt: serverTimestamp(),
  });

  /*
   * Update the report.
   */
  await updateDoc(reportRef, {
    status: "resolved",

    resolution: "account_suspended",

    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),

    adminNotes: reason.trim(),

    suspensionAppliedAt: serverTimestamp(),
  });
}
