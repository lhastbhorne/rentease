import team from "../../data/team";
import TeamCard from "./TeamCard";

function Team() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Our Team
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Meet the People Behind RentEase
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Our team is dedicated to building a trusted, innovative, and
            user-friendly platform that makes renting properties easier for
            everyone.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <TeamCard
              key={member.id}
              member={member}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Team;