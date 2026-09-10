import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  createApplication,
  hasAppliedForProperty,
} from "../../firebase/applicationService";

import { useAuth } from "../../contexts/AuthContext";

function ApplyForProperty() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const property = location.state?.property;

  const [formData, setFormData] = useState({
    employmentStatus: "",
    occupation: "",
    monthlyIncome: "",
    moveInDate: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const dateInputRef = useRef(null);



  // ==========================================
  // NO PROPERTY
  // ==========================================

  if (!property) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-white p-8 text-center shadow transition-colors duration-300 dark:bg-slate-900 dark:shadow-black/20"
        >
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Property Not Found
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Please return to the properties page and select a property again.
          </p>

          <motion.button
            onClick={() => navigate("/properties")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Browse Properties
          </motion.button>
        </motion.div>
      </DashboardLayout>
    );
  }

  function formatNumberWithCommas(value) {
    const numbersOnly = value.replace(/\D/g, "");

    if (!numbersOnly) return "";

    return Number(numbersOnly).toLocaleString("en-NG");
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "monthlyIncome") {
      setFormData((prev) => ({
        ...prev,
        monthlyIncome: formatNumberWithCommas(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function openDatePicker() {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        try {
          dateInputRef.current.showPicker();
          return;
        } catch (error) {
          // Fall back to focus
        }
      }

      dateInputRef.current.focus();
    }
  }

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("Please log in before applying.");
      return;
    }

    if (user.role !== "tenant") {
      alert("Only tenants can apply for properties.");
      return;
    }

    if (!formData.moveInDate) {
      alert("Please select your preferred move-in date.");
      return;
    }

    try {
      setLoading(true);

      // ==========================================
      // CHECK FOR DUPLICATE APPLICATION
      // ==========================================

      const alreadyApplied = await hasAppliedForProperty(user.uid, property.id);

      if (alreadyApplied) {
        alert("You have already submitted an application for this property.");

        navigate("/tenant/applications");

        return;
      }

      // ==========================================
      // CREATE APPLICATION
      // ==========================================

      await createApplication({
        propertyId: property.id,

        propertyTitle: property.title || "",

        propertyPrice: Number(property.price) || 0,

        propertyImage: property.images?.length > 0 ? property.images[0] : "",

        propertyAddress: property.address || "",

        propertyCity: property.city || "",

        propertyState: property.state || "",

        landlordId: property.ownerId || "",

        // ==========================================
        // TENANT INFORMATION
        // Get contact details from user profile
        // ==========================================

        tenantId: user.uid,

        tenantName: user.fullName || user.displayName || "",

        tenantEmail: user.email || "",

        phone: user.phone || "",

        // ==========================================
        // APPLICATION INFORMATION
        // ==========================================

        employmentStatus: formData.employmentStatus,

        occupation: formData.occupation,

        monthlyIncome: Number(formData.monthlyIncome.replace(/,/g, "")) || 0,

        moveInDate: formData.moveInDate,

        message: formData.message,
      });

      alert("Application submitted successfully!");

      navigate("/tenant/applications");
    } catch (error) {
      console.error("Error submitting application:", error);

      alert("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100"
      >
        <div className="mx-auto max-w-4xl">
          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Apply for Property
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Complete the form below to submit your rental application.
            </p>
          </motion.div>

          {/* Property Summary */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.1,
            }}
            className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm transition-colors duration-300 dark:bg-slate-900 dark:shadow-black/20"
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={
                  property.images?.length
                    ? property.images[0]
                    : "https://placehold.co/500x300?text=No+Image"
                }
                alt={property.title}
                className="h-64 w-full object-cover md:w-80"
              />

              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {property.title}
                </h2>

                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  {property.city}, {property.state}
                </p>

                <p className="mt-4 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₦{Number(property.price || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Application Form */}

          <motion.form
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.2,
            }}
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-6 shadow-sm transition-colors duration-300 dark:bg-slate-900 dark:shadow-black/20 md:p-8"
          >
            <h2 className="mb-6 text-2xl font-bold text-slate-800 dark:text-white">
              Applicant Information
            </h2>

            {/* Account Information */}

            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Contact information
              </p>

              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                Your contact details from your tenant account will automatically
                be included with this application.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 font-medium text-slate-800 dark:text-white">
                    {user?.email || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 font-medium text-slate-800 dark:text-white">
                    {user?.phone || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Employment Status */}

              <div>
                <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
                  Employment Status
                </label>

                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 outline-none transition-colors focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Select status</option>

                  <option value="Employed">Employed</option>

                  <option value="Self Employed">Self Employed</option>

                  <option value="Student">Student</option>

                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>

              {/* Occupation */}

              <div>
                <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
                  Occupation
                </label>

                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Software Developer"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              {/* Monthly Income */}

              <div>
                <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
                  Monthly Income (₦)
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="500,000"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              {/* Move-in Date */}

              <div>
                <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
                  Preferred Move-in Date *
                </label>

                <input
                  ref={dateInputRef}
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  onClick={openDatePicker}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            {/* Message */}

            <div className="mt-6">
              <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
                Message to Landlord
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell the landlord anything important about your application..."
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Buttons */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : undefined}
                whileTap={!loading ? { scale: 0.98 } : undefined}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </motion.main>
    </DashboardLayout>
  );
}

export default ApplyForProperty;
