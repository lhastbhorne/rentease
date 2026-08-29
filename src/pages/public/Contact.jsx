import { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setSuccess(false);

      // Temporary submission handler.
      // We will connect this to Firebase/email service later.

      await new Promise((resolve) =>
        setTimeout(resolve, 800),
      );

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);

      alert(
        "Unable to send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="bg-blue-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">

          <h1 className="text-4xl font-bold md:text-5xl">
            Contact RentEase
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Need help with your account, property, application,
            payment or anything else on RentEase? Our support
            team is here to help.
          </p>

        </div>
      </section>


      {/* ==========================================
          CONTACT INFORMATION
      ========================================== */}

      <section className="px-6 py-16">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* Email */}

            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FaEnvelope className="text-xl" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                Email
              </h2>

              <p className="mt-2 text-slate-500">
                support@rentease.com
              </p>

            </div>


            {/* Phone */}

            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <FaPhone className="text-xl" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                Phone
              </h2>

              <p className="mt-2 text-slate-500">
                +234 800 000 0000
              </p>

            </div>


            {/* Address */}

            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <FaMapMarkerAlt className="text-xl" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                Office
              </h2>

              <p className="mt-2 text-slate-500">
                Lagos, Nigeria
              </p>

            </div>


            {/* Hours */}

            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <FaClock className="text-xl" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                Support Hours
              </h2>

              <p className="mt-2 text-slate-500">
                Monday – Friday
              </p>

              <p className="text-slate-500">
                8:00 AM – 5:00 PM
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==========================================
          CONTACT FORM
      ========================================== */}

      <section className="px-6 pb-20">

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">

          {/* Left */}

          <div className="flex flex-col justify-center">

            <span className="font-semibold text-blue-600">
              GET IN TOUCH
            </span>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              We're here to help
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Whether you're having trouble managing a property,
              submitting an application, accessing your account,
              or using one of RentEase's features, send us a
              message and we'll get back to you.
            </p>

            <div className="mt-8 rounded-2xl bg-blue-50 p-6">

              <h3 className="font-bold text-slate-800">
                What can you contact us about?
              </h3>

              <ul className="mt-4 space-y-3 text-slate-600">

                <li>
                  ✓ Account and login problems
                </li>

                <li>
                  ✓ Property verification
                </li>

                <li>
                  ✓ Rental applications
                </li>

                <li>
                  ✓ Payments and transactions
                </li>

                <li>
                  ✓ Technical problems
                </li>

                <li>
                  ✓ Reporting inappropriate activity
                </li>

              </ul>

            </div>

          </div>


          {/* Right - Form */}

          <div className="rounded-2xl bg-white p-8 shadow-sm md:p-10">

            <h2 className="text-2xl font-bold text-slate-900">
              Send us a message
            </h2>

            <p className="mt-2 text-slate-500">
              Fill out the form below and our support team will
              get back to you.
            </p>


            {/* Success */}

            {success && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                <p className="font-semibold">
                  Message sent successfully!
                </p>

                <p className="mt-1 text-sm">
                  Thank you for contacting RentEase. Our support
                  team will get back to you.
                </p>
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >

              {/* Name */}

              <div>

                <label className="mb-2 block font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 p-3.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>


              {/* Email */}

              <div>

                <label className="mb-2 block font-medium text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-300 p-3.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>


              {/* Subject */}

              <div>

                <label className="mb-2 block font-medium text-slate-700">
                  Subject
                </label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >

                  <option value="">
                    Select a subject
                  </option>

                  <option value="Account Issue">
                    Account Issue
                  </option>

                  <option value="Property Verification">
                    Property Verification
                  </option>

                  <option value="Rental Application">
                    Rental Application
                  </option>

                  <option value="Payment">
                    Payment
                  </option>

                  <option value="Technical Issue">
                    Technical Issue
                  </option>

                  <option value="Report">
                    Report an Issue
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* Message */}

              <div>

                <label className="mb-2 block font-medium text-slate-700">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="How can we help you?"
                  className="w-full resize-none rounded-xl border border-slate-300 p-3.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>


              {/* Submit */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Sending..."
                  : "Send Message"}
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Contact;