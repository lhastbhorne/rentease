import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import {
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import { auth } from "../../firebase/firebase";
import { db } from "../../firebase/firestore";

function SocialLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Open Google login
      const result = await signInWithPopup(auth, provider);

      const firebaseUser = result.user;

      console.log("Google user:", firebaseUser);

      // ==========================================
      // FIND USER PROFILE
      // ==========================================

      const userRef = doc(db, "users", firebaseUser.uid);

      const userSnapshot = await getDoc(userRef);

      let role = "tenant";

      // ==========================================
      // NEW GOOGLE USER
      // ==========================================

      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,

          fullName: firebaseUser.displayName || "",

          email: firebaseUser.email || "",

          role: "tenant",

          photoURL: firebaseUser.photoURL || "",

          createdAt: serverTimestamp(),

          updatedAt: serverTimestamp(),
        });

        role = "tenant";
      }

      // ==========================================
      // EXISTING GOOGLE USER
      // ==========================================
      else {
        const userData = userSnapshot.data();

        role = userData.role || "tenant";
      }

      // ==========================================
      // REDIRECT BASED ON ROLE
      // ==========================================

      switch (role) {
        case "admin":
          navigate("/admin/dashboard");
          break;

        case "landlord":
          navigate("/landlord/dashboard");
          break;

        case "agent":
          navigate("/agent/dashboard");
          break;

        case "tenant":
        default:
          navigate("/tenant/dashboard");
          break;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      if (error.code === "auth/popup-blocked") {
        alert(
          "Google login popup was blocked. Please allow popups for localhost.",
        );

        return;
      }

      if (error.code === "auth/unauthorized-domain") {
        alert(
          "localhost is not authorized for Google login. Add localhost under Firebase Authentication → Settings → Authorized domains.",
        );

        return;
      }

      if (error.code === "auth/account-exists-with-different-credential") {
        alert(
          "An account already exists with this email using another login method.",
        );

        return;
      }

      alert(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addPasswordToGoogleAccount() {
    try {
      const password = window.prompt(
        "Enter the new password for your admin account:",
      );

      if (!password) {
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please sign in with Google first.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password,
      );

      await linkWithCredential(currentUser, credential);

      alert(
        "Password added successfully. You can now log in with your email and password.",
      );
    } catch (error) {
      console.error("Error adding password:", error);

      alert(error.message || "Could not add password.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 py-3 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FaGoogle />

      {loading ? "Signing in with Google..." : "Continue with Google"}
    </button>
  );
 
}

export default SocialLogin;
