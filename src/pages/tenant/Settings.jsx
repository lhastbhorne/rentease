import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaLock,
  FaSignOutAlt,
  FaTrash,
  FaSave,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import { updateDoc, doc, deleteDoc } from "firebase/firestore";

import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";

import { db } from "../../firebase/firestore";
import { auth } from "../../firebase/auth";
import { logoutUser } from "../../firebase/services";

function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    applications: true,
    messages: true,
    payments: true,
    propertyUpdates: true,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingNotifications, setSavingNotifications] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // NOTIFICATION SETTINGS
  // ==========================================

  function handleNotificationChange(e) {
    const { name, checked } = e.target;

    setNotifications((prev) => ({
      ...prev,
      [name]: checked,
    }));

    setMessage("");
    setError("");
  }

  async function saveNotificationSettings() {
    if (!user?.uid) return;

    try {
      setSavingNotifications(true);
      setMessage("");
      setError("");

      await updateDoc(doc(db, "users", user.uid), {
        notificationPreferences: notifications,
      });

      setMessage("Notification preferences saved.");
    } catch (err) {
      console.error(err);
      setError("Unable to save notification preferences.");
    } finally {
      setSavingNotifications(false);
    }
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  async function handleChangePassword(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!auth.currentUser) {
      setError("You must be logged in.");
      return;
    }

    try {
      setChangingPassword(true);

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword,
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Password changed successfully.");
    } catch (err) {
      console.error(err);

      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Your current password is incorrect.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/requires-recent-login") {
        setError(
          "For security, please log in again before changing your password.",
        );
      } else {
        setError("Unable to change your password.");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    try {
      setError("");
      setMessage("");

      await logoutUser();

      navigate("/login");
    } catch (err) {
      console.error(err);

      setError("Unable to log out.");
    }
  }

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  async function handleDeleteAccount() {
    if (!auth.currentUser) {
      setError("You must be logged in.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account?\n\nThis action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    const secondConfirmation = window.confirm(
      "This will permanently delete your RentEase account and profile. Continue?",
    );

    if (!secondConfirmation) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const currentUser = auth.currentUser;

      // Delete Firestore user profile
      await deleteDoc(doc(db, "users", currentUser.uid));

      // Delete Firebase Authentication account
      await deleteUser(currentUser);

      navigate("/");
    } catch (err) {
      console.error("Account deletion error:", err);

      if (err.code === "auth/requires-recent-login") {
        setError(
          "For security, please log in again before deleting your account.",
        );
      } else {
        setError("Unable to delete your account. Please try again.");
      }
    }
  }

  // ==========================================
  // UI
  // ==========================================

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
        {/* ======================================
            HEADER
        ====================================== */}

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
                Manage your account, security and notification preferences.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ======================================
            SUCCESS MESSAGE
        ====================================== */}

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

        {/* ======================================
            ERROR MESSAGE
        ====================================== */}

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
          {/* ======================================
              NOTIFICATIONS
          ====================================== */}

          <SettingsSection
            icon={<FaBell />}
            iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            title="Notifications"
            description="Choose what notifications you want to receive."
          >
            <div className="space-y-3">
              <NotificationOption
                name="applications"
                checked={notifications.applications}
                onChange={handleNotificationChange}
                title="Application Updates"
                description="Get notified when your rental application status changes."
              />

              <NotificationOption
                name="messages"
                checked={notifications.messages}
                onChange={handleNotificationChange}
                title="Messages"
                description="Receive notifications when landlords or agents send you messages."
              />

              <NotificationOption
                name="payments"
                checked={notifications.payments}
                onChange={handleNotificationChange}
                title="Payment Notifications"
                description="Receive updates about rent payments and transactions."
              />

              <NotificationOption
                name="propertyUpdates"
                checked={notifications.propertyUpdates}
                onChange={handleNotificationChange}
                title="Property Updates"
                description="Receive updates about properties you have saved or applied for."
              />
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
              <motion.button
                type="button"
                onClick={saveNotificationSettings}
                disabled={savingNotifications}
                whileHover={!savingNotifications ? { y: -2 } : {}}
                whileTap={!savingNotifications ? { scale: 0.97 } : {}}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {savingNotifications ? (
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

          {/* ======================================
              SECURITY
          ====================================== */}

          <SettingsSection
            icon={<FaLock />}
            iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
            title="Security"
            description="Change your account password."
          >
            <form onSubmit={handleChangePassword} className="space-y-5">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="pt-1">
                <motion.button
                  type="submit"
                  disabled={changingPassword}
                  whileHover={!changingPassword ? { y: -2 } : {}}
                  whileTap={!changingPassword ? { scale: 0.97 } : {}}
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

          {/* ======================================
              ACCOUNT
          ====================================== */}

          <SettingsSection
            icon={<FaUserShield />}
            iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            title="Account"
            description="Manage your account access."
          >
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
            >
              <FaSignOutAlt />
              Logout
            </motion.button>
          </SettingsSection>

          {/* ======================================
              DANGER ZONE
          ====================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-red-500/20 dark:bg-slate-900 sm:p-6"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <FaTrash />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 sm:text-xl">
                  Danger Zone
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Permanently deleting your account cannot be undone.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 dark:border-red-500/10 dark:bg-red-500/5">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-1 shrink-0 text-red-500" />

                <p className="text-sm leading-6 text-red-700 dark:text-red-400">
                  Deleting your account will remove your RentEase profile and
                  Firebase Authentication account permanently.
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleDeleteAccount}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 sm:w-auto"
            >
              <FaTrash />
              Delete Account
            </motion.button>
          </motion.section>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

// ==========================================
// SETTINGS SECTION
// ==========================================

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

          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}

// ==========================================
// NOTIFICATION OPTION
// ==========================================

function NotificationOption({ name, checked, onChange, title, description }) {
  return (
    <motion.label
      whileHover={{
        y: -1,
      }}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
          {description}
        </p>
      </div>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 dark:bg-slate-700 dark:peer-checked:bg-blue-600" />

        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </motion.label>
  );
}

// ==========================================
// PASSWORD FIELD
// ==========================================

function PasswordField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500" />

        <input
          type="password"
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
          required
        />
      </div>
    </div>
  );
}

// ==========================================
// SPINNER
// ==========================================

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

export default Settings;
