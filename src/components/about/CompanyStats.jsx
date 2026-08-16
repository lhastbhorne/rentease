import companyStats from "../../data/companyStats";
import StatCard from "./StatCard";

function CompanyStats() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Our Impact
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            RentEase in Numbers
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            These milestones reflect our commitment to connecting tenants,
            landlords, and property professionals through one trusted platform.
          </p>
        </div>

        {/* Statistics */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {companyStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompanyStats;
