import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaLock,
  FaTrash,
  FaSignOutAlt,
  FaShieldAlt,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserShield,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from "firebase/auth";

import { db } from "../../firebase/firestore";
import { auth } from "../../firebase/auth";

function Settings() {
  const { user, logout } = useAuth();

  // =====================================================
  // SETTINGS
  // =====================================================

  const [settings, setSettings] = useState({
    emailNotifications: true,
    applicationNotifications: true,
    paymentNotifications: true,
    messageNotifications: true,
  });

  // =====================================================
  // PASSWORD
  // =====================================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    async function loadSettings() {
      if (!user?.uid) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const settingsRef = doc(
          db,
          "users",
          user.uid,
          "settings",
          "preferences",
        );

        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {
          setSettings((prev) => ({
            ...prev,
            ...snapshot.data(),
          }));
        }
      } catch (err) {
        console.error("Error loading settings:", err);

        setError("Unable to load your settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  // =====================================================
  // TOGGLE SETTINGS
  // =====================================================

  function handleToggle(name) {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    setMessage("");
    setError("");
  }

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  async function handleSaveSettings() {
    if (!user?.uid) {
      setError("You must be logged in.");
      return;
    }

    try {
      setSavingSettings(true);
      setMessage("");
      setError("");

      const settingsRef = doc(db, "users", user.uid, "settings", "preferences");

      await setDoc(
        settingsRef,
        {
          ...settings,
          updatedAt: new Date(),
        },
        {
          merge: true,
        },
      );

      setMessage("Your notification preferences have been saved.");
    } catch (err) {
      console.error("Settings save error:", err);

      setError("Unable to save your settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  // =====================================================
  // PASSWORD INPUT
  // =====================================================

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async function handleChangePassword(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!auth.currentUser) {
      setError("You must be logged in.");
      return;
    }

    if (!passwordData.currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (!passwordData.newPassword) {
      setError("Enter a new password.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Your new password must contain at least 6 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const firebaseUser = auth.currentUser;

      // =================================================
      // RE-AUTHENTICATE USER
      // =================================================

      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        passwordData.currentPassword,
      );

      await reauthenticateWithCredential(firebaseUser, credential);

      // =================================================
      // UPDATE PASSWORD
      // =================================================

      await updatePassword(firebaseUser, passwordData.newPassword);

      // =================================================
      // CLEAR FORM
      // =================================================

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage("Your password has been changed successfully.");
    } catch (err) {
      console.error("Password change error:", err);

      switch (err.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Your current password is incorrect.");
          break;

        case "auth/requires-recent-login":
          setError(
            "For security, please log out and log in again before changing your password.",
          );
          break;

        case "auth/weak-password":
          setError("Your new password is too weak.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;

        default:
          setError(err.message || "Unable to change your password.");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  // =====================================================
  // DELETE ACCOUNT
  // =====================================================

  async function handleDeleteAccount() {
    if (!auth.currentUser) {
      setError("You must be logged in.");
      return;
    }

    const firstConfirmation = window.confirm(
      "Are you sure you want to delete your RentEase account?",
    );

    if (!firstConfirmation) {
      return;
    }

    const secondConfirmation = window.confirm(
      "This action cannot be undone. Your account will be permanently deleted. Continue?",
    );

    if (!secondConfirmation) {
      return;
    }

    try {
      setDeletingAccount(true);
      setMessage("");
      setError("");

      const firebaseUser = auth.currentUser;

      // =================================================
      // DELETE SETTINGS
      // =================================================

      await deleteDoc(
        doc(db, "users", firebaseUser.uid, "settings", "preferences"),
      );

      // =================================================
      // DELETE USER PROFILE
      // =================================================

      await deleteDoc(doc(db, "users", firebaseUser.uid));

      // =================================================
      // DELETE FIREBASE AUTH ACCOUNT
      // =================================================

      await deleteUser(firebaseUser);

      // =================================================
      // REDIRECT
      // =================================================

      window.location.href = "/";
    } catch (err) {
      console.error("Account deletion error:", err);

      if (err.code === "auth/requires-recent-login") {
        setError(
          "For security, please log out and log in again before deleting your account.",
        );
      } else {
        setError(err.message || "Unable to delete your account.");
      }
    } finally {
      setDeletingAccount(false);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    try {
      setMessage("");
      setError("");

      await logout();

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);

      setError("Unable to log out. Please try again.");
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
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="text-center"
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading settings...
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
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:flex">
              <FaShieldAlt />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                Manage your landlord account, notifications, and security.
              </p>
            </div>
          </div>
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

              <span>{message}</span>
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

              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <SettingsSection
            icon={<FaBell />}
            iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            title="Notifications"
            description="Choose which notifications you would like to receive."
          >
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              <Toggle
                title="Email Notifications"
                description="Receive important account updates by email."
                enabled={settings.emailNotifications}
                onChange={() => handleToggle("emailNotifications")}
              />

              <Toggle
                title="Application Notifications"
                description="Get notified when someone applies for your property."
                enabled={settings.applicationNotifications}
                onChange={() => handleToggle("applicationNotifications")}
              />

              <Toggle
                title="Payment Notifications"
                description="Receive notifications about rent and payment activity."
                enabled={settings.paymentNotifications}
                onChange={() => handleToggle("paymentNotifications")}
              />

              <Toggle
                title="Message Notifications"
                description="Get notified when tenants or agents send you messages."
                enabled={settings.messageNotifications}
                onChange={() => handleToggle("messageNotifications")}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <motion.button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                whileHover={
                  !savingSettings
                    ? {
                        y: -2,
                      }
                    : {}
                }
                whileTap={
                  !savingSettings
                    ? {
                        scale: 0.97,
                      }
                    : {}
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {savingSettings ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Preferences
                  </>
                )}
              </motion.button>
            </div>
          </SettingsSection>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <SettingsSection
            icon={<FaLock />}
            iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
            title="Change Password"
            description="Keep your account secure with a strong password."
          >
            <form onSubmit={handleChangePassword} className="space-y-5">
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />

              <div className="flex justify-end pt-1">
                <motion.button
                  type="submit"
                  disabled={changingPassword}
                  whileHover={
                    !changingPassword
                      ? {
                          y: -2,
                        }
                      : {}
                  }
                  whileTap={
                    !changingPassword
                      ? {
                          scale: 0.97,
                        }
                      : {}
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {changingPassword ? (
                    <>
                      <Spinner />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <FaLock />
                      Change Password
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </SettingsSection>

          {/* =================================================
              ACCOUNT SECURITY
          ================================================= */}

          <SettingsSection
            icon={<FaShieldAlt />}
            iconClassName="bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
            title="Account Security"
            description="Information about your account security."
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Email Address
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                    {auth.currentUser?.email || user?.email}
                  </p>
                </div>

                <span className="flex w-fit items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  <FaCheckCircle />
                  Active
                </span>
              </div>
            </div>
          </SettingsSection>

          {/* =================================================
              ACCOUNT ACTIONS
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <FaUserShield />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                  Account Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage your RentEase account.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* =================================================
                  LOGOUT
              ================================================= */}

              <motion.button
                type="button"
                onClick={handleLogout}
                whileHover={{
                  x: 3,
                }}
                whileTap={{
                  scale: 0.99,
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <FaSignOutAlt />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white">
                      Logout
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                      Sign out of your account.
                    </p>
                  </div>
                </div>

                <span className="hidden text-xs font-medium text-slate-400 sm:block">
                  Sign out
                </span>
              </motion.button>

              {/* =================================================
                  DELETE ACCOUNT
              ================================================= */}

              <motion.button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                whileHover={
                  !deletingAccount
                    ? {
                        x: 3,
                      }
                    : {}
                }
                whileTap={
                  !deletingAccount
                    ? {
                        scale: 0.99,
                      }
                    : {}
                }
                className="flex w-full items-center justify-between rounded-xl border border-red-200 p-4 text-left transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/20 dark:hover:bg-red-500/10"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    <FaTrash />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-red-700 dark:text-red-400">
                      Delete Account
                    </p>

                    <p className="mt-1 text-xs text-red-500 dark:text-red-400/80 sm:text-sm">
                      Permanently delete your RentEase account.
                    </p>
                  </div>
                </div>

                {deletingAccount && (
                  <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                    <Spinner dark />
                    Deleting...
                  </div>
                )}
              </motion.button>
            </div>
          </motion.section>

          {/* =================================================
              DANGER NOTICE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.1,
            }}
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10"
          >
            <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-500" />

            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Account deletion is permanent
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600 dark:text-red-400/80">
                Make sure you are certain before deleting your RentEase account.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

// =====================================================
// TOGGLE COMPONENT
// =====================================================

function Toggle({ title, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="min-w-0">
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
          {description}
        </p>
      </div>

      <motion.button
        type="button"
        onClick={onChange}
        whileTap={{
          scale: 0.9,
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
        aria-pressed={enabled}
        aria-label={`Toggle ${title}`}
      >
        <motion.span
          animate={{
            x: enabled ? 20 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow"
        />
      </motion.button>
    </div>
  );
}

// =====================================================
// PASSWORD INPUT
// =====================================================

function PasswordInput({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500" />

        <input
          type="password"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
        />
      </div>
    </div>
  );
}

// =====================================================
// SETTINGS SECTION
// =====================================================

function SettingsSection({
  icon,
  iconClassName,
  title,
  description,
  children,
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            {description}
          </p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}

// =====================================================
// SPINNER
// =====================================================

function Spinner({ dark = false }) {
  return (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 ${
        dark
          ? "border-red-200 border-t-red-600 dark:border-red-500/30 dark:border-t-red-400"
          : "border-white/40 border-t-white"
      }`}
    />
  );
}

export default Settings;
