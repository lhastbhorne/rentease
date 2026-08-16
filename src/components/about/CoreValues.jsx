import coreValues from "../../data/coreValues";
import ValueCard from "./ValueCard";

function CoreValues() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            What We Believe
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Our Core Values
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            These principles shape every decision we make and every experience
            we create for our users.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value) => (
            <ValueCard
              key={value.id}
              value={value}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CoreValues;