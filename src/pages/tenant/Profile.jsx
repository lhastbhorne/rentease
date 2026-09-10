import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaSave,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import { doc, getDoc, updateDoc } from "firebase/firestore";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  updateProfile,
} from "firebase/auth";

import { db } from "../../firebase/firestore";
import { auth } from "../../firebase/auth";

function Profile() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    occupation: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [originalEmail, setOriginalEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const userRef = doc(db, "users", user.uid);

        const snapshot = await getDoc(userRef);

        const firebaseUser = auth.currentUser;

        if (snapshot.exists()) {
          const data = snapshot.data();

          const email = firebaseUser?.email || data.email || user.email || "";

          setOriginalEmail(email);

          setFormData({
            fullName:
              data.fullName || firebaseUser?.displayName || user.fullName || "",

            email,

            phone: data.phone || "",

            gender: data.gender || "",

            dateOfBirth: data.dateOfBirth || "",

            occupation: data.occupation || "",

            emergencyContactName: data.emergencyContactName || "",

            emergencyContactPhone: data.emergencyContactPhone || "",
          });
        } else {
          const email = auth.currentUser?.email || user.email || "";

          setOriginalEmail(email);

          setFormData({
            fullName: auth.currentUser?.displayName || user.fullName || "",

            email,

            phone: "",
            gender: "",
            dateOfBirth: "",
            occupation: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
          });
        }
      } catch (err) {
        console.error("Profile loading error:", err);

        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user?.uid || !auth.currentUser) {
      setError("You must be logged in.");
      return;
    }

    setMessage("");
    setError("");

    const newEmail = formData.email.trim().toLowerCase();

    const oldEmail = originalEmail.trim().toLowerCase();

    const emailChanged = newEmail !== oldEmail;

    try {
      setSaving(true);

      const firebaseUser = auth.currentUser;

      // =================================================
      // EMAIL CHANGE
      // =================================================

      if (emailChanged) {
        if (!newEmail) {
          setError("Please enter a valid email address.");

          setSaving(false);
          return;
        }

        if (!currentPassword) {
          setError("Enter your current password to change your email.");

          setSaving(false);
          return;
        }

        setChangingEmail(true);

        // -----------------------------------------------
        // RE-AUTHENTICATE
        // -----------------------------------------------

        const credential = EmailAuthProvider.credential(
          oldEmail,
          currentPassword,
        );

        await reauthenticateWithCredential(firebaseUser, credential);

        // -----------------------------------------------
        // SEND VERIFICATION EMAIL
        // -----------------------------------------------

        await verifyBeforeUpdateEmail(firebaseUser, newEmail);

        /*
         * Firebase does NOT change the account email yet.
         *
         * The user must open the verification email
         * sent to the NEW email address.
         *
         * After verification, Firebase updates the
         * authentication email.
         */

        setMessage(
          `Verification email sent to ${newEmail}. Check your inbox and spam folder, then click the verification link to complete the email change.`,
        );

        setCurrentPassword("");
        setChangingEmail(false);
        setSaving(false);

        return;
      }

      // =================================================
      // UPDATE FIREBASE DISPLAY NAME
      // =================================================

      await updateProfile(firebaseUser, {
        displayName: formData.fullName,
      });

      // =================================================
      // UPDATE FIRESTORE PROFILE
      // =================================================

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        fullName: formData.fullName,

        phone: formData.phone,

        gender: formData.gender,

        dateOfBirth: formData.dateOfBirth,

        occupation: formData.occupation,

        emergencyContactName: formData.emergencyContactName,

        emergencyContactPhone: formData.emergencyContactPhone,
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setChangingEmail(false);

      // =================================================
      // FIREBASE ERROR HANDLING
      // =================================================

      switch (err.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Your current password is incorrect.");
          break;

        case "auth/requires-recent-login":
          setError(
            "For security, please log out and log in again before changing your email.",
          );
          break;

        case "auth/email-already-in-use":
          setError(
            "That email address is already being used by another account.",
          );
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/operation-not-allowed":
          setError(
            "Email changes are currently not allowed for this Firebase project.",
          );
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please wait a while and try again.");
          break;

        default:
          setError(err.message || "Unable to update your profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // EMAIL CHANGED
  // =====================================================

  const emailChanged =
    formData.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="flex flex-col items-center"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading profile...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="mx-auto max-w-4xl"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: -15,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Manage your personal information and account details.
          </p>
        </motion.div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400"
            >
              <FaCheckCircle className="mt-0.5 shrink-0" />

              <p>{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <FaExclamationTriangle className="mt-0.5 shrink-0" />

              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <div className="border-b border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}

              <motion.div
                whileHover={{
                  scale: 1.05,
                }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-3xl"
              >
                {formData.fullName
                  ? formData.fullName.charAt(0).toUpperCase()
                  : "T"}
              </motion.div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                  {formData.fullName || "Tenant"}
                </h2>

                <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-500 dark:text-slate-400">
                  <FaEnvelope className="shrink-0 text-xs" />

                  {formData.email}
                </p>

                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  <FaUser className="text-[10px]" />
                  Tenant
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit} className="space-y-8 p-5 sm:p-6">
            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <FaUser className="text-sm" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Personal Information
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Keep your personal details up to date.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>

                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500/10"
                    />
                  </div>

                  {emailChanged && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-2 flex items-start gap-2 text-xs leading-5 text-amber-600 dark:text-amber-400"
                    >
                      <FaExclamationTriangle className="mt-0.5 shrink-0" />

                      <span>
                        Changing your email requires your current password and
                        email verification.
                      </span>
                    </motion.p>
                  )}
                </div>

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />

                {/* GENDER */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500/10"
                  >
                    <option value="">Select gender</option>

                    <option value="male">Male</option>

                    <option value="female">Female</option>

                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />

                <Input
                  label="Occupation"
                  name="occupation"
                  placeholder="e.g. Software Developer"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* =================================================
                EMAIL SECURITY
            ================================================= */}

            <AnimatePresence>
              {emailChanged && (
                <motion.section
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <FaShieldAlt />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                          Confirm Email Change
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-amber-700 dark:text-amber-400">
                          Enter your current password to confirm that you own
                          this account. Firebase will then send a verification
                          email to your new address.
                        </p>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-medium text-amber-800 dark:text-amber-300">
                            Current Password
                          </label>

                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-amber-500/20 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* =================================================
                EMERGENCY CONTACT
            ================================================= */}

            <section className="border-t border-slate-200 pt-8 dark:border-slate-800">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <FaPhone className="text-sm" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Emergency Contact
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Someone RentEase can contact in an emergency.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Contact Name"
                  name="emergencyContactName"
                  placeholder="Emergency contact name"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />

                <Input
                  label="Contact Phone"
                  name="emergencyContactPhone"
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-800">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={
                  !saving
                    ? {
                        y: -2,
                      }
                    : {}
                }
                whileTap={
                  !saving
                    ? {
                        scale: 0.97,
                      }
                    : {}
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    {changingEmail ? "Sending Verification..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

// =====================================================
// REUSABLE INPUT
// =====================================================

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500/10"
      />
    </div>
  );
}

export default Profile;
