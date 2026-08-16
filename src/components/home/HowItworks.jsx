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
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            How RentEase Works
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Renting your next home has never been easier. Follow these four
            simple steps.
          </p>
        </div>

        {/* Steps */}

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center transition hover:-translate-y-2 hover:shadow-xl"
            >
              {/* Number */}

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {step.id}
              </div>

              {/* Icon */}

              <div className="mb-6 flex justify-center text-blue-600">
                {step.icon}
              </div>

              {/* Title */}

              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                {step.title}
              </h3>

              {/* Description */}

              <p className="leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
