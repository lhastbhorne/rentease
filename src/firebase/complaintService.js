import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firestore";

// =====================================================
// CREATE PROPERTY COMPLAINT
// =====================================================
// Tenant → Landlord OR Agent
//
// These complaints are NOT visible to the admin.
// =====================================================

export async function createPropertyComplaint(
  complaintData,
) {
  if (!complaintData?.tenantId) {
    throw new Error("Tenant ID is required.");
  }

  if (!complaintData?.propertyId) {
    throw new Error("Property is required.");
  }

  if (!complaintData?.subject?.trim()) {
    throw new Error("Complaint subject is required.");
  }

  if (!complaintData?.details?.trim()) {
    throw new Error("Complaint details are required.");
  }

  const docRef = await addDoc(
    collection(db, "complaints"),
    {
      ...complaintData,

      complaintType: "property",

      status: "pending",

      managerReply: "",

      repliedAt: null,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
}

// =====================================================
// GET TENANT'S PROPERTY COMPLAINTS
// =====================================================
// Admin complaints are automatically excluded.
//
// We only query tenantId to avoid a composite Firestore
// index requirement, then filter complaintType locally.
// =====================================================

export async function getMyComplaints(
  tenantId,
) {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, "complaints"),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const complaints = snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (complaint) =>
        complaint.complaintType === "property",
    );

  sortByNewest(complaints);

  return complaints;
}

// =====================================================
// GET LANDLORD PROPERTY COMPLAINTS
// =====================================================

export async function getLandlordComplaints(
  landlordId,
) {
  if (!landlordId) {
    return [];
  }

  const q = query(
    collection(db, "complaints"),
    where("landlordId", "==", landlordId),
  );

  const snapshot = await getDocs(q);

  const complaints = snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (complaint) =>
        complaint.complaintType === "property",
    );

  sortByNewest(complaints);

  return complaints;
}

// =====================================================
// GET AGENT PROPERTY COMPLAINTS
// =====================================================

export async function getAgentComplaints(
  agentId,
) {
  if (!agentId) {
    return [];
  }

  const q = query(
    collection(db, "complaints"),
    where("agentId", "==", agentId),
  );

  const snapshot = await getDocs(q);

  const complaints = snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (complaint) =>
        complaint.complaintType === "property",
    );

  sortByNewest(complaints);

  return complaints;
}

// =====================================================
// LANDLORD / AGENT REPLY TO PROPERTY COMPLAINT
// =====================================================

export async function replyToPropertyComplaint(
  complaintId,
  reply,
) {
  if (!complaintId) {
    throw new Error("Complaint ID is required.");
  }

  if (!reply?.trim()) {
    throw new Error("Reply cannot be empty.");
  }

  const complaintRef = doc(
    db,
    "complaints",
    complaintId,
  );

  await updateDoc(complaintRef, {
    managerReply: reply.trim(),

    repliedAt: serverTimestamp(),

    status: "resolved",

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// CREATE ADMIN SUPPORT COMPLAINT
// =====================================================
// Tenant / Landlord / Agent → Admin
// =====================================================

export async function createAdminComplaint(
  complaintData,
) {
  if (!complaintData?.userId) {
    throw new Error("User ID is required.");
  }

  if (!complaintData?.subject?.trim()) {
    throw new Error("Complaint subject is required.");
  }

  if (!complaintData?.details?.trim()) {
    throw new Error("Complaint details are required.");
  }

  const docRef = await addDoc(
    collection(db, "complaints"),
    {
      ...complaintData,

      complaintType: "admin",

      status: "pending",

      adminReply: "",

      repliedAt: null,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
}

// =====================================================
// GET USER'S ADMIN SUPPORT COMPLAINTS
// =====================================================
// This is for the user's Admin Support page.
//
// Works for:
// - Tenant
// - Landlord
// - Agent
// =====================================================

export async function getMyAdminComplaints(
  userId,
) {
  if (!userId) {
    return [];
  }

  const q = query(
    collection(db, "complaints"),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(q);

  const complaints = snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (complaint) =>
        complaint.complaintType === "admin",
    );

  sortByNewest(complaints);

  return complaints;
}

// =====================================================
// GET ADMIN SUPPORT COMPLAINTS
// =====================================================
// Admin sees ONLY complaints sent to Admin.
//
// Property complaints are excluded.
// =====================================================

export async function getAllComplaints() {
  const q = query(
    collection(db, "complaints"),
    where(
      "complaintType",
      "==",
      "admin",
    ),
  );

  const snapshot = await getDocs(q);

  const complaints = snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    }),
  );

  sortByNewest(complaints);

  return complaints;
}

// =====================================================
// ADMIN REPLY
// =====================================================

export async function replyToComplaint(
  complaintId,
  reply,
) {
  if (!complaintId) {
    throw new Error("Complaint ID is required.");
  }

  if (!reply?.trim()) {
    throw new Error("Reply cannot be empty.");
  }

  const complaintRef = doc(
    db,
    "complaints",
    complaintId,
  );

  await updateDoc(complaintRef, {
    adminReply: reply.trim(),

    repliedAt: serverTimestamp(),

    status: "resolved",

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// UPDATE ADMIN COMPLAINT STATUS
// =====================================================

export async function updateComplaintStatus(
  complaintId,
  status,
) {
  if (!complaintId) {
    throw new Error("Complaint ID is required.");
  }

  if (!status) {
    throw new Error("Complaint status is required.");
  }

  const allowedStatuses = [
    "pending",
    "in-progress",
    "resolved",
    "rejected",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid complaint status.");
  }

  const complaintRef = doc(
    db,
    "complaints",
    complaintId,
  );

  await updateDoc(complaintRef, {
    status,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// SORT COMPLAINTS
// =====================================================

function sortByNewest(
  complaints,
) {
  complaints.sort(
    (a, b) =>
      getComplaintDate(b) -
      getComplaintDate(a),
  );
}

// =====================================================
// GET COMPLAINT DATE
// =====================================================

function getComplaintDate(
  complaint,
) {
  if (!complaint?.createdAt) {
    return 0;
  }

  // Firestore Timestamp
  if (
    typeof complaint.createdAt
      .toMillis === "function"
  ) {
    return complaint.createdAt.toMillis();
  }

  // JavaScript Date
  if (
    complaint.createdAt instanceof Date
  ) {
    return complaint.createdAt.getTime();
  }

  // Number timestamp
  if (
    typeof complaint.createdAt === "number"
  ) {
    return complaint.createdAt;
  }

  return 0;
}