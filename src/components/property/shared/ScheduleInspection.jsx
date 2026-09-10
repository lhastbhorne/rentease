import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaPaperPlane,
  FaCheckCircle,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../contexts/AuthContext";
import { createInspectionRequest } from "../../../firebase/inspectionService";

function ScheduleInspection({ property }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function openPicker(inputRef) {
    if (inputRef.current) {
      // Chrome/Edge support showPicker() for native date/time controls.
      if (typeof inputRef.current.showPicker === "function") {
        try {
          inputRef.current.showPicker();
          return;
        } catch (error) {
          // Fall back to the normal browser input behavior.
        }
      }

      inputRef.current.focus();
    }
  }

  // =====================================================
  // GUEST
  // =====================================================

  if (!user) {
    return (
      <section className="bg-slate-50 px-6 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FaLock />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
              Tenant Login Required
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
              Only registered RentEase tenants can request property inspections.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <FaSignInAlt />
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/register/tenant")}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Create Tenant Account
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // =====================================================
  // NON-TENANT
  // =====================================================

  if (user.role !== "tenant") {
    return (
      <section className="bg-slate-50 px-6 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <FaLock />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
              Tenant Account Required
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
              Inspection requests are available only to registered tenant
              accounts.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  // =====================================================
  // SUBMIT INSPECTION REQUEST
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!user?.uid) {
      setError("Please log in as a tenant before requesting an inspection.");
      return;
    }

    if (user.role !== "tenant") {
      setError("Only registered tenants can request property inspections.");
      return;
    }

    if (!property?.id) {
      setError("Property information could not be found.");
      return;
    }

    if (!formData.date) {
      setError("Please select an inspection date.");
      return;
    }

    if (!formData.time) {
      setError("Please select an inspection time.");
      return;
    }

    // =====================================================
    // DETERMINE PROPERTY MANAGER
    // =====================================================

    let managerId = null;
    let managerRole = null;

    if (property.managementType === "agent" && property.agentId) {
      managerId = property.agentId;
      managerRole = "agent";
    } else if (property.ownerId) {
      managerId = property.ownerId;
      managerRole = "landlord";
    }

    if (!managerId) {
      setError("This property does not have a valid landlord or agent.");
      return;
    }

    try {
      setLoading(true);

      await createInspectionRequest({
        propertyId: property.id,

        propertyTitle: property.title || "",

        propertyImage: property.images?.[0] || "",

        propertyAreaName: property.areaName || "",

        propertyCity: property.city || "",

        propertyState: property.state || "",

        tenantId: user.uid,

        tenantName: user.fullName || user.displayName || "",

        tenantEmail: user.email || "",

        tenantPhone: user.phone || "",

        managerId,

        managerRole,

        managerName: property.managerName || "",

        requestedDate: formData.date,

        requestedTime: formData.time,

        message: formData.message.trim(),
      });

      setSuccess(
        "Your inspection request has been sent successfully. The landlord/agent will review your request.",
      );

      setFormData({
        date: "",
        time: "",
        message: "",
      });
    } catch (err) {
      console.error("Inspection request error:", err);

      setError(err?.message || "Unable to submit inspection request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-slate-50 px-6 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 md:p-10"
        >
          {/* HEADER */}

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FaCalendarAlt />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Schedule an Inspection
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
              Choose a convenient date and time to request a viewing of this
              property.
            </p>
          </div>

          {/* INFO */}

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="mt-1 shrink-0 text-blue-600 dark:text-blue-400" />

              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">
                  Request first, pay after acceptance
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700 dark:text-blue-400">
                  There is no inspection payment at this stage. If the landlord
                  or agent accepts your request, you will be notified and asked
                  to pay the inspection fee before the inspection is confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* SUCCESS */}

          {success && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
              <FaCheckCircle className="mt-0.5 shrink-0" />

              <p>{success}</p>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* DATE + TIME */}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Preferred Date
                </label>

                <div className="relative">
                  <FaCalendarAlt className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    ref={dateInputRef}
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    onClick={() => openPicker(dateInputRef)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Preferred Time
                </label>

                <div className="relative">
                  <FaClock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    ref={timeInputRef}
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    onClick={() => openPicker(timeInputRef)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                  />
                </div>
              </div>
            </div>

            {/* MESSAGE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Message{" "}
                <span className="font-normal text-slate-400">(Optional)</span>
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Add any information the landlord/agent should know..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
              />
            </div>

            {/* SUBMIT */}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : undefined}
              whileTap={!loading ? { scale: 0.98 } : undefined}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaPaperPlane />

              {loading ? "Sending Request..." : "Request Inspection"}
            </motion.button>
          </form>

          {/* FOOTER */}

          <p className="mt-5 text-center text-xs text-slate-400">
            Only registered tenants can request inspections. You will only be
            charged if the landlord or agent accepts your inspection request.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ScheduleInspection;
