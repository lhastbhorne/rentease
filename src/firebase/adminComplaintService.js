import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firestore";

import {
  createNotification,
} from "./notificationService";

// ==========================================
// GET ALL COMPLAINTS
// ==========================================

export async function getAllComplaints() {
  const q = query(
    collection(db, "complaints"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// ==========================================
// UPDATE COMPLAINT STATUS
// ==========================================

export async function updateComplaintStatus(
  complaintId,
  status,
) {
  const complaintRef = doc(
    db,
    "complaints",
    complaintId,
  );

  // Get the complaint first
  const complaintSnapshot = await getDoc(
    complaintRef,
  );

  if (!complaintSnapshot.exists()) {
    throw new Error(
      "Complaint not found.",
    );
  }

  const complaint =
    complaintSnapshot.data();

  // Update complaint
  await updateDoc(complaintRef, {
    status,

    updatedAt: serverTimestamp(),
  });

  // Get tenant ID
  const tenantId =
    complaint.tenantId ||
    complaint.userId ||
    complaint.uid;

  // Notify tenant
  if (tenantId) {
    let title = "Complaint Updated";

    let message =
      "Your complaint status has been updated.";

    if (status === "in_progress") {
      title = "Complaint In Progress";

      message =
        "Your complaint is currently being reviewed by the RentEase administration team.";
    }

    if (status === "resolved") {
      title = "Complaint Resolved";

      message =
        "Your complaint has been resolved by the RentEase administration team.";
    }

    if (status === "rejected") {
      title = "Complaint Rejected";

      message =
        "Your complaint has been reviewed and rejected by the RentEase administration team.";
    }

    if (status === "pending") {
      title = "Complaint Pending";

      message =
        "Your complaint has been returned to pending status.";
    }

    await createNotification({
      userId: tenantId,

      title,

      message,

      type: "application",

      relatedId: complaintId,

      relatedType: "complaint",
    });
  }
}