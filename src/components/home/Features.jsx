import {
  FaShieldAlt,
  FaSearchLocation,
  FaHome,
  FaHandshake,
} from "react-icons/fa";

function Features() {
  const features = [
    {
      id: 1,
      icon: <FaShieldAlt size={40} />,
      title: "Verified Properties",
      description:
        "Every property goes through a verification process before it is listed.",
    },
    {
      id: 2,
      icon: <FaSearchLocation size={40} />,
      title: "Easy Property Search",
      description:
        "Search by location, price, property type, and amenities with ease.",
    },
    {
      id: 3,
      icon: <FaHome size={40} />,
      title: "Wide Range of Homes",
      description:
        "Browse apartments, duplexes, studios, commercial spaces, and more.",
    },
    {
      id: 4,
      icon: <FaHandshake size={40} />,
      title: "Trusted Landlords & Agents",
      description:
        "Only verified landlords and registered agents can list properties.",
    },
  ];

  return (
    <section className="bg-slate-50 py-20 transition-colors duration-300 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
            Why Choose RentEase?
          </h2>

          <p className="mt-4 text-lg text-slate-600 transition-colors duration-300 dark:text-slate-400">
            We make renting easier, safer, and more transparent for tenants,
            landlords, and agents.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group relative overflow-hidden rounded-2xl border border-transparent bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:bg-blue-50 hover:shadow-xl dark:border-transparent dark:bg-slate-800 dark:shadow-black/20 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
            >
              <div className="mb-6 flex justify-center text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400">
                {feature.icon}
              </div>

              <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </h3>

              <p className="leading-7 text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
