import { useEffect, useState } from "react";
import {
  FaBell,
  FaLock,
  FaTrash,
  FaSignOutAlt,
  FaShieldAlt,
  FaSave,
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

  const [settings, setSettings] = useState({
    emailNotifications: true,
    applicationNotifications: true,
    paymentNotifications: true,
    messageNotifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
        console.error("Settings loading error:", err);

        setError("Unable to load your settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  // =====================================================
  // TOGGLE
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

      setMessage("");
      setError("");

      const firebaseUser = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        passwordData.currentPassword,
      );

      await reauthenticateWithCredential(firebaseUser, credential);

      await updatePassword(firebaseUser, passwordData.newPassword);

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
          setError("Please log in again before changing your password.");
          break;

        case "auth/weak-password":
          setError("Your new password is too weak.");
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

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your RentEase agent account?",
    );

    if (!confirmed) {
      return;
    }

    const secondConfirmation = window.confirm(
      "This action cannot be undone. Continue?",
    );

    if (!secondConfirmation) {
      return;
    }

    try {
      setDeletingAccount(true);

      setMessage("");
      setError("");

      const firebaseUser = auth.currentUser;

      // Delete notification preferences

      await deleteDoc(
        doc(db, "users", firebaseUser.uid, "settings", "preferences"),
      );

      // Delete user profile

      await deleteDoc(doc(db, "users", firebaseUser.uid));

      // Delete authentication account

      await deleteUser(firebaseUser);

      window.location.href = "/";
    } catch (err) {
      console.error("Account deletion error:", err);

      if (err.code === "auth/requires-recent-login") {
        setError("Please log in again before deleting your account.");
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
      await logout();

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-slate-500">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Agent Settings</h1>

          <p className="mt-2 text-slate-500">
            Manage your account preferences, security, and notifications.
          </p>
        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FaBell />
              </div>

              <div>
                <h2 className="text-xl font-semibold">Notifications</h2>

                <p className="text-sm text-slate-500">
                  Choose which notifications you want to receive.
                </p>
              </div>
            </div>

            <div className="divide-y">
              <Toggle
                title="Email Notifications"
                description="Receive important account updates."
                enabled={settings.emailNotifications}
                onChange={() => handleToggle("emailNotifications")}
              />

              <Toggle
                title="Application Notifications"
                description="Get notified about property applications."
                enabled={settings.applicationNotifications}
                onChange={() => handleToggle("applicationNotifications")}
              />

              <Toggle
                title="Payment Notifications"
                description="Receive payment-related notifications."
                enabled={settings.paymentNotifications}
                onChange={() => handleToggle("paymentNotifications")}
              />

              <Toggle
                title="Message Notifications"
                description="Get notified about new messages."
                enabled={settings.messageNotifications}
                onChange={() => handleToggle("messageNotifications")}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <FaSave />

                {savingSettings ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </section>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <FaLock />
              </div>

              <div>
                <h2 className="text-xl font-semibold">Change Password</h2>

                <p className="text-sm text-slate-500">
                  Update your account password.
                </p>
              </div>
            </div>

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

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </section>

          {/* =================================================
              SECURITY
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <FaShieldAlt />
              </div>

              <div>
                <h2 className="text-xl font-semibold">Account Security</h2>

                <p className="text-sm text-slate-500">
                  Your RentEase account security.
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Account Email</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {auth.currentUser?.email || user?.email}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              ACCOUNT ACTIONS
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Account Actions</h2>

            <p className="mb-6 mt-2 text-sm text-slate-500">
              Manage your RentEase account.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50"
              >
                <FaSignOutAlt className="text-slate-500" />

                <div>
                  <p className="font-medium">Logout</p>

                  <p className="text-sm text-slate-500">
                    Sign out of your account.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex w-full items-center gap-3 rounded-xl border border-red-200 px-5 py-4 text-left transition hover:bg-red-50 disabled:opacity-60"
              >
                <FaTrash className="text-red-600" />

                <div>
                  <p className="font-medium text-red-700">Delete Account</p>

                  <p className="text-sm text-red-500">
                    Permanently delete your agent account.
                  </p>
                </div>

                {deletingAccount && (
                  <span className="ml-auto text-sm text-red-600">
                    Deleting...
                  </span>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

// =====================================================
// TOGGLE
// =====================================================

function Toggle({ title, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div>
        <p className="font-medium text-slate-800">{title}</p>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-slate-300"
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

// =====================================================
// PASSWORD INPUT
// =====================================================

function PasswordInput({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

export default Settings;
