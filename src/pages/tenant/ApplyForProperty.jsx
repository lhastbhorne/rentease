import { useState } from "react";
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
    phone: "",
    employmentStatus: "",
    occupation: "",
    monthlyIncome: "",
    moveInDate: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // ==========================================
  // NO PROPERTY
  // ==========================================

  if (!property) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-slate-800">
            Property Not Found
          </h1>

          <p className="mt-2 text-slate-500">
            Please return to the properties page and select a property again.
          </p>

          <button
            onClick={() => navigate("/properties")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Browse Properties
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (!formData.phone || !formData.moveInDate) {
      alert("Please fill in the required fields.");
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

        tenantId: user.uid,

        tenantName: user.fullName || user.displayName || "",

        tenantEmail: user.email || "",

        phone: formData.phone,

        employmentStatus: formData.employmentStatus,

        occupation: formData.occupation,

        monthlyIncome: Number(formData.monthlyIncome) || 0,

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
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Apply for Property
          </h1>

          <p className="mt-2 text-slate-500">
            Complete the form below to submit your rental application.
          </p>
        </div>

        {/* Property Summary */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
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
              <h2 className="text-2xl font-bold text-slate-800">
                {property.title}
              </h2>

              <p className="mt-2 text-slate-500">
                {property.city}, {property.state}
              </p>

              <p className="mt-4 text-2xl font-bold text-blue-600">
                ₦{Number(property.price || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-800">
            Applicant Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone */}
            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Phone Number *
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Employment Status */}
            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Employment Status
              </label>

              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-600"
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
              <label className="mb-2 block font-medium text-slate-700">
                Occupation
              </label>

              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Software Developer"
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-600"
              />
            </div>

            {/* Monthly Income */}
            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Monthly Income (₦)
              </label>

              <input
                type="number"
                min="0"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="500000"
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-600"
              />
            </div>

            {/* Move-in Date */}
            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Preferred Move-in Date *
              </label>

              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Message */}
          <div className="mt-6">
            <label className="mb-2 block font-medium text-slate-700">
              Message to Landlord
            </label>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              placeholder="Tell the landlord anything important about your application..."
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-600"
            />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ApplyForProperty;
