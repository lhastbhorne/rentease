import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFlag, FaUser, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { createReport } from "../../firebase/reportService";

function ReportUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const reportedUser = location.state?.reportedUser;

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!reportedUser) {
      setError("The account you are trying to report could not be found.");
      return;
    }

    if (!reason) {
      setError("Please select a reason for this report.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe what happened.");
      return;
    }

    try {
      setSubmitting(true);

      await createReport({
        reporterId: user.uid,
        reporterName: user.fullName || user.displayName || "",
        reporterEmail: user.email || "",

        reportedUserId: reportedUser.id,
        reportedUserName:
          reportedUser.fullName || reportedUser.displayName || "",
        reportedUserEmail: reportedUser.email || "",
        reportedUserRole: reportedUser.role,

        // No property is required.
        propertyId: "",
        propertyTitle: "",

        reason,
        description,
      });

      navigate("/tenant/dashboard", {
        state: {
          reportSubmitted: true,
        },
      });
    } catch (error) {
      console.error("Report submission error:", error);

      setError(
        error.message || "Something went wrong while submitting your report.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!reportedUser) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <FaFlag size={25} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
              Account Not Found
            </h1>

            <p className="mt-3 text-slate-500 dark:text-slate-400">
              We could not determine which landlord or agent you are trying to
              report.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <FaArrowLeft size={14} />
              Go Back
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const reportedName =
    reportedUser.fullName || reportedUser.displayName || "User";

  const reportedRole = reportedUser.role === "agent" ? "Agent" : "Landlord";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FaArrowLeft size={12} />
            Go Back
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <FaFlag size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Report {reportedRole}
              </h1>

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Report an account that you believe has violated RentEase
                policies.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          {/* Reported Account */}
          <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <FaUser size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Reporting Account
                </p>

                <p className="mt-1 truncate font-bold text-slate-900 dark:text-white">
                  {reportedName}
                </p>

                <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
                  {reportedRole}
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Reason */}
          <div className="mb-6">
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Reason for report
            </label>

            <select
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Select a reason</option>

              <option value="fraud">Fraud or scam</option>

              <option value="harassment">Harassment or abusive behavior</option>

              <option value="impersonation">
                Impersonation or fake identity
              </option>

              <option value="false_information">
                False or misleading information
              </option>

              <option value="unlawful_behavior">
                Unlawful or inappropriate behavior
              </option>

              <option value="payment_fraud">Payment-related fraud</option>

              <option value="threats">Threats or intimidation</option>

              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Tell us what happened
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={8}
              placeholder="Please explain what happened and provide as much relevant information as possible..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          {/* Evidence */}
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <FaFlag className="mt-1 text-slate-400" />

              <div>
                <p className="font-semibold text-slate-800 dark:text-white">
                  Supporting evidence
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  You will be able to upload screenshots, images, or documents
                  supporting your report.
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
            <p className="text-sm leading-6 text-amber-800 dark:text-amber-300">
              Please only submit genuine reports. False, misleading, or
              malicious reports may result in action being taken against your
              own account.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-red-600 px-5 py-3.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting Report..." : "Submit Report"}
          </button>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}

export default ReportUser;
