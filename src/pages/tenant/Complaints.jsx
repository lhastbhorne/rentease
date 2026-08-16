import { useEffect, useState } from "react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  createComplaint,
  getMyComplaints,
} from "../../firebase/complaintService";

import { useAuth } from "../../contexts/AuthContext";

function Complaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
  });

  // ============================================
  // LOAD COMPLAINTS
  // ============================================

  useEffect(() => {
    async function loadComplaints() {
      try {
        const data = await getMyComplaints(user.uid);

        setComplaints(data);
      } catch (error) {
        console.error("Error loading complaints:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadComplaints();
    }
  }, [user]);

  // ============================================
  // HANDLE INPUT
  // ============================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ============================================
  // SUBMIT COMPLAINT
  // ============================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.subject || !formData.category || !formData.message) {
      alert("Please fill in all fields.");

      return;
    }

    try {
      setSubmitting(true);

      const complaintData = {
        tenantId: user.uid,

        tenantName: user.displayName || user.name || "Tenant",

        tenantEmail: user.email || "",

        subject: formData.subject,

        category: formData.category,

        message: formData.message,

        landlordId: "",

        propertyId: "",

        propertyTitle: "",
      };

      const complaintId = await createComplaint(complaintData);

      const newComplaint = {
        id: complaintId,
        ...complaintData,
        status: "pending",
      };

      setComplaints((prev) => [newComplaint, ...prev]);

      setFormData({
        subject: "",
        category: "",
        message: "",
      });

      alert("Complaint submitted successfully.");
    } catch (error) {
      console.error("Error submitting complaint:", error);

      alert("Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* PAGE HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Complaints & Support
          </h1>

          <p className="mt-2 text-slate-500">
            Report a problem or contact your landlord or managing agent.
          </p>
        </div>

        {/* COMPLAINT FORM */}

        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold">Lodge a Complaint</h2>

          <p className="mt-2 text-slate-500">
            Tell us about the issue you are experiencing.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* SUBJECT */}

            <div>
              <label className="mb-2 block font-medium">Subject</label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Water supply problem"
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block font-medium">
                Complaint Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              >
                <option value="">Select category</option>

                <option value="maintenance">Maintenance</option>

                <option value="electricity">Electricity</option>

                <option value="water">Water</option>

                <option value="security">Security</option>

                <option value="rent">Rent / Payment</option>

                <option value="property">Property Issue</option>

                <option value="noise">Noise</option>

                <option value="other">Other</option>
              </select>
            </div>

            {/* MESSAGE */}

            <div>
              <label className="mb-2 block font-medium">
                Complaint Details
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder="Describe the problem..."
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>

        {/* MY COMPLAINTS */}

        <div className="mt-10">
          <h2 className="text-2xl font-bold">My Complaints</h2>

          {loading ? (
            <div className="mt-5 rounded-xl bg-white p-8 text-center">
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="mt-5 rounded-xl bg-white p-8 text-center">
              <p className="text-lg font-medium">No complaints yet</p>

              <p className="mt-2 text-slate-500">
                Your submitted complaints will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{complaint.subject}</h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {complaint.category}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        complaint.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : complaint.status === "in-progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </div>

                  <p className="mt-4 text-slate-600">{complaint.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Complaints;
