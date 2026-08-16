import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

import { db } from "./firestore";

// ============================================
// CREATE COMPLAINT
// ============================================

export async function createComplaint(complaintData) {
  const docRef = await addDoc(collection(db, "complaints"), {
    ...complaintData,

    status: "pending",

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// ============================================
// GET TENANT'S COMPLAINTS
// ============================================

export async function getMyComplaints(userId) {
  const q = query(
    collection(db, "complaints"),
    where("tenantId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// ============================================
// GET COMPLAINTS FOR LANDLORD
// ============================================

export async function getLandlordComplaints(ownerId) {
  const q = query(
    collection(db, "complaints"),
    where("landlordId", "==", ownerId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
