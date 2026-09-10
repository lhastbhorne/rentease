import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSave,
  FaUser,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
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
    nin: "",
    gender: "",
    dateOfBirth: "",
    occupation: "",
    address: "",
  });

  const [originalEmail, setOriginalEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD LANDLORD PROFILE
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

            nin: data.nin || "",

            gender: data.gender || "",

            dateOfBirth: data.dateOfBirth || "",

            occupation: data.occupation || "",

            address: data.address || "",
          });
        } else {
          const email = firebaseUser?.email || user.email || "";

          setOriginalEmail(email);

          setFormData({
            fullName: firebaseUser?.displayName || user.fullName || "",

            email,

            phone: "",
            nin: "",
            gender: "",
            dateOfBirth: "",
            occupation: "",
            address: "",
          });
        }
      } catch (err) {
        console.error("Error loading landlord profile:", err);

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

    setMessage("");
    setError("");
  }

  // =====================================================
  // EMAIL CHANGED?
  // =====================================================

  const emailChanged =
    formData.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

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

    try {
      setSaving(true);

      const firebaseUser = auth.currentUser;

      // =================================================
      // EMAIL CHANGE
      // =================================================

      if (emailChanged) {
        if (!formData.email.trim()) {
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

        // Re-authenticate landlord

        const credential = EmailAuthProvider.credential(
          originalEmail,
          currentPassword,
        );

        await reauthenticateWithCredential(firebaseUser, credential);

        // Send verification email to new address

        await verifyBeforeUpdateEmail(
          firebaseUser,
          formData.email.trim().toLowerCase(),
        );

        setMessage(
          `A verification email has been sent to ${formData.email
            .trim()
            .toLowerCase()}. Check your inbox and spam folder, then click the verification link to complete the email change.`,
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
        displayName: formData.fullName.trim(),
      });

      // =================================================
      // UPDATE FIRESTORE
      // =================================================

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        fullName: formData.fullName.trim(),

        phone: formData.phone.trim(),

        nin: formData.nin.trim(),

        gender: formData.gender,

        dateOfBirth: formData.dateOfBirth,

        occupation: formData.occupation.trim(),

        address: formData.address.trim(),

        updatedAt: new Date(),
      });

      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      console.error("Landlord profile update error:", err);

      setChangingEmail(false);

      switch (err.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Your current password is incorrect.");
          break;

        case "auth/requires-recent-login":
          setError(
            "For security, please log in again before changing your email.",
          );
          break;

        case "auth/email-already-in-use":
          setError(
            "This email address is already being used by another account.",
          );
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please wait and try again later.");
          break;

        default:
          setError(err.message || "Unable to update your profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500"
            />

            <p className="text-slate-500 dark:text-slate-400">
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
      <div className="mx-auto max-w-5xl">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 transition-colors duration-300 dark:text-white">
            Landlord Profile
          </h1>

          <p className="mt-2 text-slate-500 transition-colors duration-300 dark:text-slate-400">
            Manage your personal and landlord account information.
          </p>
        </motion.div>

        {/* =================================================
            SUCCESS / ERROR
        ================================================= */}

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{
                opacity: 0,
                y: -15,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -10,
                height: 0,
              }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex items-start gap-3 overflow-hidden rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400"
            >
              <FaCheckCircle className="mt-1 shrink-0" />

              <p>{message}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -15,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -10,
                height: 0,
              }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex items-start gap-3 overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <FaExclamationCircle className="mt-1 shrink-0" />

              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
          >
            {/* PROFILE HEADER */}

            <div className="border-b border-slate-200 bg-slate-50 p-6 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    rotate: 2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  {formData.fullName
                    ? formData.fullName.charAt(0).toUpperCase()
                    : "L"}
                </motion.div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {formData.fullName || "Landlord"}
                  </h2>

                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    {formData.email}
                  </p>

                  <motion.span
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.4,
                    }}
                    className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    Landlord
                  </motion.span>
                </div>
              </div>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-8 p-5 sm:p-6">
              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <FaUser className="text-blue-600 dark:text-blue-400" />

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Personal Information
                  </h3>
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
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                    />

                    <AnimatePresence>
                      {emailChanged && (
                        <motion.p
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="mt-2 overflow-hidden text-xs text-amber-600 dark:text-amber-400"
                        >
                          Changing your email requires your current password and
                          email verification.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <Input
                    label="National Identification Number (NIN)"
                    name="nin"
                    value={formData.nin}
                    onChange={handleChange}
                    placeholder="11-digit NIN"
                  />

                  {/* GENDER */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                    >
                      <option value="">Select gender</option>

                      <option value="male">Male</option>

                      <option value="female">Female</option>

                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
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
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="e.g. Business Owner"
                  />

                  <Input
                    label="Residential Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                </div>
              </motion.section>

              {/* =================================================
                  EMAIL SECURITY
              ================================================= */}

              <AnimatePresence>
                {emailChanged && (
                  <motion.section
                    initial={{
                      opacity: 0,
                      y: 15,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      height: 0,
                    }}
                    className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10"
                  >
                    <div className="flex items-start gap-3">
                      <FaShieldAlt className="mt-1 shrink-0 text-amber-600 dark:text-amber-400" />

                      <div className="w-full">
                        <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                          Verify Email Change
                        </h3>

                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                          Enter your current password. We will send a
                          verification email to your new email address.
                        </p>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Current Password
                          </label>

                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* =================================================
                  LANDLORD VERIFICATION
              ================================================= */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="border-t border-slate-200 pt-8 dark:border-slate-800"
              >
                <div className="mb-4 flex items-center gap-3">
                  <FaShieldAlt className="text-blue-600 dark:text-blue-400" />

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Account Verification
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        Identity Verification
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Your NIN can be used for landlord verification.
                      </p>
                    </div>

                    {formData.nin ? (
                      <motion.span
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        className="flex w-fit items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      >
                        <FaCheckCircle />
                        Information Added
                      </motion.span>
                    ) : (
                      <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                        Incomplete
                      </span>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* =================================================
                  SAVE
              ================================================= */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-800"
              >
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={
                    !saving
                      ? {
                          y: -2,
                          scale: 1.01,
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
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <motion.span
                    animate={
                      saving
                        ? {
                            rotate: 360,
                          }
                        : {}
                    }
                    transition={
                      saving
                        ? {
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }
                        : {}
                    }
                  >
                    <FaSave />
                  </motion.span>

                  {changingEmail
                    ? "Sending Verification..."
                    : saving
                      ? "Saving..."
                      : "Save Changes"}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
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
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
      />
    </div>
  );
}

export default Profile;
