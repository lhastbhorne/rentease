import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
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

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);

      alert("Unable to send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: "Email",
      value: "support@rentease.com",
      iconWrapper:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      icon: FaPhone,
      title: "Phone",
      value: "+234 800 000 0000",
      iconWrapper:
        "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Office",
      value: "Lagos, Nigeria",
      iconWrapper:
        "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    },
    {
      icon: FaClock,
      title: "Support Hours",
      value: "Monday – Friday",
      extra: "8:00 AM – 5:00 PM",
      iconWrapper:
        "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    },
  ];

  const contactTopics = [
    "Account and login problems",
    "Property verification",
    "Rental applications",
    "Payments and transactions",
    "Technical problems",
    "Reporting inappropriate activity",
  ];

  return (
    <main className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative overflow-hidden bg-blue-600 px-5 py-20 text-white transition-colors duration-300 dark:bg-blue-700 md:py-24">
        {/* Decorative Elements */}
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.12, 0.2, 0.12],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.16, 0.08],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-7xl text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="inline-flex rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
          >
            Get in Touch
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Contact RentEase
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg"
          >
            Need help with your account, property, application, payment or
            anything else on RentEase? Our support team is here to help.
          </motion.p>
        </motion.div>
      </section>

      {/* ==========================================
          CONTACT INFORMATION
      ========================================== */}

      <section className="px-5 py-16 transition-colors duration-300 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {contactInfo.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 30,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.55,
                        ease: "easeOut",
                      },
                    },
                  }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    transition={{ duration: 0.25 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${item.iconWrapper}`}
                  >
                    <Icon />
                  </motion.div>

                  <h2 className="mt-5 text-xl font-bold text-slate-800 transition-colors duration-300 dark:text-white">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-slate-500 transition-colors duration-300 dark:text-slate-400">
                    {item.value}
                  </p>

                  {item.extra && (
                    <p className="text-slate-500 dark:text-slate-400">
                      {item.extra}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          CONTACT FORM
      ========================================== */}

      <section className="px-5 pb-20 transition-colors duration-300 sm:px-6 md:pb-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <span className="font-semibold tracking-wide text-blue-600 dark:text-blue-400">
              GET IN TOUCH
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-4xl">
              We're here to help
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 transition-colors duration-300 dark:text-slate-300 sm:text-lg">
              Whether you're having trouble managing a property, submitting an
              application, accessing your account, or using one of RentEase's
              features, send us a message and we'll get back to you.
            </p>

            {/* Contact Topics */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 transition-colors duration-300 dark:border-blue-900/40 dark:bg-blue-500/5"
            >
              <h3 className="font-bold text-slate-800 dark:text-white">
                What can you contact us about?
              </h3>

              <div className="mt-4 space-y-3">
                {contactTopics.map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                    }}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base"
                  >
                    <FaCheckCircle className="shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>{topic}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-8 md:p-10"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Send us a message
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Fill out the form below and our support team will get back to you.
            </p>

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-900/50 dark:bg-green-500/10 dark:text-green-400"
              >
                <p className="font-semibold">Message sent successfully!</p>

                <p className="mt-1 text-sm">
                  Thank you for contacting RentEase. Our support team will get
                  back to you.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-medium text-slate-700 dark:text-slate-200"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-medium text-slate-700 dark:text-slate-200"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block font-medium text-slate-700 dark:text-slate-200"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Property Verification">
                    Property Verification
                  </option>
                  <option value="Rental Application">Rental Application</option>
                  <option value="Payment">Payment</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Report">Report an Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block font-medium text-slate-700 dark:text-slate-200"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="How can we help you?"
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={!submitting ? { y: -2 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default Contact;
