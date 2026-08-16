import whyChooseUs from "../../data/whyChooseUs";
import WhyChooseCard from "./WhyChooseCard";

function WhyChooseUs() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left Image */}
        <div>
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900"
            alt="Modern apartment"
            className="w-full rounded-3xl shadow-xl"
          />
        </div>

        {/* Right Content */}
        <div>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Why RentEase
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Why Choose RentEase?
          </h2>

          <p className="mt-5 mb-10 leading-8 text-slate-600">
            We combine technology, transparency, and trusted property management
            tools to create a better rental experience for everyone.
          </p>

          <div className="space-y-6">
            {whyChooseUs.map((feature) => (
              <WhyChooseCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
