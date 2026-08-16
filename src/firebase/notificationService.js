import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firestore";

// ==========================================
// CREATE NOTIFICATION
// ==========================================

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
  relatedId = "",
  relatedType = "",
}) {
  if (!userId) {
    throw new Error("Notification user ID is required.");
  }

  const notificationRef = await addDoc(
    collection(db, "notifications"),
    {
      userId,

      title,
      message,

      type,

      relatedId,
      relatedType,

      read: false,

      createdAt: serverTimestamp(),
    }
  );

  return notificationRef.id;
}

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================

export async function getMyNotifications(userId) {
  if (!userId) {
    return [];
  }

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  const notifications = snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    })
  );

  // Newest first
  notifications.sort((a, b) => {
    const dateA =
      a.createdAt?.toMillis?.() || 0;

    const dateB =
      b.createdAt?.toMillis?.() || 0;

    return dateB - dateA;
  });

  return notifications;
}

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

export async function markNotificationAsRead(
  notificationId
) {
  const notificationRef = doc(
    db,
    "notifications",
    notificationId
  );

  await updateDoc(notificationRef, {
    read: true,
  });
}

// ==========================================
// MARK ALL AS READ
// ==========================================

export async function markAllNotificationsAsRead(
  userId
) {
  const notifications =
    await getMyNotifications(userId);

  const unread =
    notifications.filter(
      (notification) =>
        !notification.read
    );

  await Promise.all(
    unread.map((notification) =>
      markNotificationAsRead(
        notification.id
      )
    )
  );
}

// ==========================================
// DELETE NOTIFICATION
// ==========================================

export async function deleteNotification(
  notificationId
) {
  await deleteDoc(
    doc(
      db,
      "notifications",
      notificationId
    )
  );
}

export async function getUserNotifications(userId) {
  return getMyNotifications(userId);
}