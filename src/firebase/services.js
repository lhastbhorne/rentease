import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  reload,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth } from "./auth";
import { db } from "./firestore";

/* ---------------- REGISTER ---------------- */

export async function registerUser({
  fullName,
  email,
  password,
  role,
  ...extraData
}) {
  if (!fullName?.trim()) {
    throw new Error("Full name is required.");
  }

  if (!email?.trim()) {
    throw new Error("Email address is required.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  if (!role) {
    throw new Error("User role is required.");
  }

  // ==========================================
  // CREATE FIREBASE AUTH ACCOUNT
  // ==========================================

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    );

  const user = userCredential.user;

  // ==========================================
  // UPDATE FIREBASE DISPLAY NAME
  // ==========================================

  await updateProfile(user, {
    displayName: fullName.trim(),
  });

  // ==========================================
  // SEND EMAIL VERIFICATION
  // ==========================================

  await sendEmailVerification(user);

  // ==========================================
  // CREATE FIRESTORE USER PROFILE
  // ==========================================

  const userProfile = {
    uid: user.uid,

    fullName: fullName.trim(),

    email: email.trim().toLowerCase(),

    role,

    emailVerified: false,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),

    // Additional information
    // including verification documents
    ...extraData,
  };

  await setDoc(
    doc(db, "users", user.uid),
    userProfile,
  );

  return user;
}

/* ---------------- LOGIN ---------------- */

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const firebaseUser = userCredential.user;

  const profile = await getUserProfile(firebaseUser.uid);

  return {
    firebaseUser,
    profile,
  };
}

/* ---------------- LOGOUT ---------------- */

export async function logoutUser() {
  await signOut(auth);
}

/* ------------ PASSWORD RESET ------------ */

export async function forgotPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/* ------------ GET USER PROFILE ---------- */

export async function getUserProfile(uid) {
  const docRef = doc(db, "users", uid);

  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data();
}

// ==========================================
// RESEND VERIFICATION EMAIL
// ==========================================

export async function resendVerificationEmail() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "No authenticated user found. Please register or log in again."
    );
  }

  // Refresh the user's Firebase information
  await reload(user);

  if (user.emailVerified) {
    return {
      alreadyVerified: true,
    };
  }

  await sendEmailVerification(user);

  return {
    alreadyVerified: false,
  };
}

// ==========================================
// CHECK EMAIL VERIFICATION
// ==========================================

export async function checkEmailVerified() {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  await reload(user);

  return user.emailVerified;
}