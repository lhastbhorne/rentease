import { useState } from "react";

function ScheduleInspection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log(formData);

    alert("Inspection request submitted!");

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      message: "",
    });
  }

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
          <h2 className="text-3xl font-bold text-slate-900">
            Schedule an Inspection
          </h2>

          <p className="mt-2 text-slate-600">
            Choose your preferred date and time to inspect this property.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="rounded-xl border border-slate-300 p-4 focus:border-blue-600 focus:outline-none"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-xl border border-slate-300 p-4 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="rounded-xl border border-slate-300 p-4 focus:border-blue-600 focus:outline-none"
              />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="rounded-xl border border-slate-300 p-4 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 p-4 focus:border-blue-600 focus:outline-none"
            />

            <textarea
              name="message"
              rows="5"
              placeholder="Additional message (optional)"
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 p-4 focus:border-blue-600 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              Request Inspection
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ScheduleInspection;
