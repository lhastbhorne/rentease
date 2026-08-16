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
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await updateProfile(user, {
    displayName: fullName,
  });

  await sendEmailVerification(user);

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    role,
    emailVerified: false,
    createdAt: serverTimestamp(),
    ...extraData,
  });

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