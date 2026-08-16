import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";

import { db } from "./firestore";

// ==========================================
// CREATE OR GET CONVERSATION
// ==========================================

export async function getOrCreateConversation({
  tenantId,
  landlordId = "",
  agentId = "",
  propertyId = "",
  propertyTitle = "",
  tenantName = "",
  landlordName = "",
  agentName = "",
}) {
  const conversationsRef = collection(db, "conversations");

  let q;

  if (landlordId) {
    q = query(
      conversationsRef,
      where("tenantId", "==", tenantId),
      where("landlordId", "==", landlordId),
      where("propertyId", "==", propertyId),
    );
  } else {
    q = query(
      conversationsRef,
      where("tenantId", "==", tenantId),
      where("agentId", "==", agentId),
      where("propertyId", "==", propertyId),
    );
  }

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  }

  const conversationData = {
    tenantId,
    landlordId,
    agentId,
    propertyId,
    propertyTitle,
    tenantName,
    landlordName,
    agentName,

    lastMessage: "",
    lastMessageAt: null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const conversationRef = await addDoc(conversationsRef, conversationData);

  return {
    id: conversationRef.id,
    ...conversationData,
  };
}

// ==========================================
// GET TENANT CONVERSATIONS
// ==========================================

export async function getTenantConversations(tenantId) {
  const q = query(
    collection(db, "conversations"),
    where("tenantId", "==", tenantId),
  );

  const snapshot = await getDocs(q);

  const conversations = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  conversations.sort((a, b) => {
    const dateA = getTimestamp(a.lastMessageAt);
    const dateB = getTimestamp(b.lastMessageAt);

    return dateB - dateA;
  });

  return conversations;
}

// ==========================================
// REAL-TIME MESSAGES
// ==========================================

export function subscribeToMessages(conversationId, callback) {
  const messagesRef = collection(db, "messages");

  const q = query(
    messagesRef,
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    callback(messages);
  });
}

// ==========================================
// SEND MESSAGE
// ==========================================

export async function sendMessage({
  conversationId,
  senderId,
  senderRole,
  senderName,
  text,
}) {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("Message cannot be empty.");
  }

  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    senderRole,
    senderName,
    text: cleanText,
    read: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: cleanText,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// EDIT MESSAGE
// ==========================================

export async function editMessage(messageId, senderId, newText) {
  const cleanText = newText.trim();

  if (!cleanText) {
    throw new Error("Message cannot be empty.");
  }

  const messageRef = doc(db, "messages", messageId);

  await updateDoc(messageRef, {
    text: cleanText,
    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// DELETE MESSAGE
// ==========================================

export async function deleteMessage(messageId) {
  await deleteDoc(doc(db, "messages", messageId));
}

// ==========================================
// MARK MESSAGE AS READ
// ==========================================

export async function markMessageAsRead(messageId) {
  await updateDoc(doc(db, "messages", messageId), {
    read: true,
  });
}

// ==========================================
// TIMESTAMP HELPER
// ==========================================

function getTimestamp(timestamp) {
  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  return 0;
}
