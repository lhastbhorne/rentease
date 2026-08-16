import AmenityCard from "./AmenityCard";

function Amenities({ amenities }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Features
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">Amenities</h2>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            This property comes with premium amenities designed for comfort,
            convenience, and security.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((amenity) => (
            <AmenityCard key={amenity.id} amenity={amenity} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Amenities;
