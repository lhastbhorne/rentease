import {
  FaSearch,
  FaCalendarCheck,
  FaFileSignature,
  FaKey,
} from "react-icons/fa";

function HowItWorks() {
  const steps = [
    {
      id: 1,
      icon: <FaSearch size={36} />,
      title: "Search Properties",
      description:
        "Browse verified apartments, duplexes, studios, and commercial properties using our smart search.",
    },
    {
      id: 2,
      icon: <FaCalendarCheck size={36} />,
      title: "Book Inspection",
      description:
        "Schedule a convenient inspection date to visit the property before making any decision.",
    },
    {
      id: 3,
      icon: <FaFileSignature size={36} />,
      title: "Submit Application",
      description:
        "Complete your rental application securely through the RentEase platform.",
    },
    {
      id: 4,
      icon: <FaKey size={36} />,
      title: "Move Into Your New Home",
      description:
        "Once approved, complete the process and move into your new property with confidence.",
    },
  ];

  return (
    <section className="bg-white py-20 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
            How RentEase Works
          </h2>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Renting your next home has never been easier. Follow these four
            simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
            >
              {/* Number */}
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                {step.id}
              </div>

              {/* Icon */}
              <div className="mb-6 flex justify-center text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>

              {/* Description */}
              <p className="leading-7 text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
