import missionVision from "../../data/missionVision";
import MissionVisionCard from "./MissionVisionCard";

function MissionVision() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Our Purpose
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Mission & Vision
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Everything we build at RentEase is guided by a clear mission and a
            long-term vision to improve the rental experience for everyone.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {missionVision.map((item) => (
            <MissionVisionCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MissionVision;
