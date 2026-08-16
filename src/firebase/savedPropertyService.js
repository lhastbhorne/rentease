import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firestore";

/*
|--------------------------------------------------------------------------
| Save Property
|--------------------------------------------------------------------------
*/

export async function saveProperty(userId, property) {
  if (!userId) {
    throw new Error("User must be logged in.");
  }

  // Check if property is already saved
  const q = query(
    collection(db, "savedProperties"),
    where("tenantId", "==", userId),
    where("propertyId", "==", property.id),
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  const savedProperty = {
    tenantId: userId,

    propertyId: property.id,

    title: property.title || "",

    description: property.description || "",

    price: Number(property.price || 0),

    category: property.category || "",

    type: property.type || "",

    bedrooms: Number(property.bedrooms || 0),

    bathrooms: Number(property.bathrooms || 0),

    parking: Number(property.parking || 0),

    furnished: property.furnished || "",

    area: property.area || "",

    address: property.address || "",

    city: property.city || "",

    state: property.state || "",

    images: Array.isArray(property.images) ? property.images : [],

    ownerId: property.ownerId || "",

    status: property.status || "available",

    savedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, "savedProperties"), savedProperty);

  return docRef.id;
}

/*
|--------------------------------------------------------------------------
| Remove Saved Property
|--------------------------------------------------------------------------
*/

export async function removeSavedProperty(userId, propertyId) {
  if (!userId) {
    throw new Error("User must be logged in.");
  }

  const q = query(
    collection(db, "savedProperties"),
    where("tenantId", "==", userId),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  const deletePromises = snapshot.docs.map((savedDoc) =>
    deleteDoc(doc(db, "savedProperties", savedDoc.id)),
  );

  await Promise.all(deletePromises);
}

/*
|--------------------------------------------------------------------------
| Check If Property Is Saved
|--------------------------------------------------------------------------
*/

export async function isPropertySaved(userId, propertyId) {
  if (!userId || !propertyId) {
    return false;
  }

  const q = query(
    collection(db, "savedProperties"),
    where("tenantId", "==", userId),
    where("propertyId", "==", propertyId),
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

/*
|--------------------------------------------------------------------------
| Get All Saved Properties
|--------------------------------------------------------------------------
*/

export async function getSavedProperties(userId) {
  if (!userId) {
    return [];
  }

  const q = query(
    collection(db, "savedProperties"),
    where("tenantId", "==", userId),
  );

  const snapshot = await getDocs(q);

  const properties = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  // Newest saved properties first
  properties.sort((a, b) => {
    const dateA = a.savedAt?.toMillis?.() || new Date(a.savedAt || 0).getTime();

    const dateB = b.savedAt?.toMillis?.() || new Date(b.savedAt || 0).getTime();

    return dateB - dateA;
  });

  return properties;
}
