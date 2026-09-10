import { useEffect, useState } from "react";
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
    agencyName: "",
    officeAddress: "",
    cacNumber: "",
    gender: "",
    dateOfBirth: "",
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

            agencyName: data.agencyName || "",

            officeAddress: data.officeAddress || "",

            cacNumber: data.cacNumber || "",

            gender: data.gender || "",

            dateOfBirth: data.dateOfBirth || "",
          });
        } else {
          const email = firebaseUser?.email || user.email || "";

          setOriginalEmail(email);

          setFormData({
            fullName: firebaseUser?.displayName || user.fullName || "",

            email,

            phone: "",
            agencyName: "",
            officeAddress: "",
            cacNumber: "",
            gender: "",
            dateOfBirth: "",
          });
        }
      } catch (err) {
        console.error("Agent profile loading error:", err);

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
  // EMAIL CHANGE CHECK
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

        const credential = EmailAuthProvider.credential(
          originalEmail,
          currentPassword,
        );

        await reauthenticateWithCredential(firebaseUser, credential);

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

        agencyName: formData.agencyName.trim(),

        officeAddress: formData.officeAddress.trim(),

        cacNumber: formData.cacNumber.trim(),

        gender: formData.gender,

        dateOfBirth: formData.dateOfBirth,

        updatedAt: new Date(),
      });

      setMessage("Your agent profile has been updated successfully.");
    } catch (err) {
      console.error("Agent profile update error:", err);

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
          <p className="text-slate-500">Loading profile...</p>
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
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Agent Profile</h1>

          <p className="mt-2 text-slate-500">
            Manage your personal and professional information.
          </p>
        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <FaCheckCircle className="mt-1 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <FaExclamationCircle className="mt-1 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* PROFILE HEADER */}

          <div className="border-b bg-slate-50 p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                {formData.fullName
                  ? formData.fullName.charAt(0).toUpperCase()
                  : "A"}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-800">
                  {formData.fullName || "Agent"}
                </h2>

                <p className="mt-1 truncate text-slate-500">{formData.email}</p>

                <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Agent
                </span>
              </div>
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* PERSONAL INFORMATION */}

            <section>
              <div className="mb-5 flex items-center gap-3">
                <FaUser className="text-blue-600" />

                <h3 className="text-lg font-semibold text-slate-800">
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />

                  {emailChanged && (
                    <p className="mt-2 text-xs text-amber-600">
                      Changing your email requires your current password and
                      email verification.
                    </p>
                  )}
                </div>

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <Input
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="Male / Female"
                />

                <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* PROFESSIONAL INFORMATION */}

            <section className="border-t pt-8">
              <div className="mb-5 flex items-center gap-3">
                <FaShieldAlt className="text-blue-600" />

                <h3 className="text-lg font-semibold text-slate-800">
                  Professional Information
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Agency / Business Name"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  placeholder="ABC Properties Ltd."
                />

                <Input
                  label="CAC Registration Number"
                  name="cacNumber"
                  value={formData.cacNumber}
                  onChange={handleChange}
                  placeholder="RC1234567"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Office Address"
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={handleChange}
                    placeholder="Enter your office address"
                  />
                </div>
              </div>
            </section>

            {/* EMAIL SECURITY */}

            {emailChanged && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <FaShieldAlt className="mt-1 shrink-0 text-amber-600" />

                  <div className="w-full">
                    <h3 className="font-semibold text-amber-800">
                      Verify Email Change
                    </h3>

                    <p className="mt-1 text-sm text-amber-700">
                      Enter your current password. A verification email will be
                      sent to your new email address.
                    </p>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Current Password
                      </label>

                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* VERIFICATION */}

            <section className="border-t pt-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Agent Verification
              </h3>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Business Information
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Your agency and CAC information can be reviewed by
                      RentEase administrators.
                    </p>
                  </div>

                  {formData.agencyName ? (
                    <span className="flex shrink-0 items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      <FaCheckCircle />
                      Added
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                      Incomplete
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* SAVE */}

            <div className="flex justify-end border-t pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSave />

                {changingEmail
                  ? "Sending Verification..."
                  : saving
                    ? "Saving..."
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

// =====================================================
// INPUT
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

export default Profile;
