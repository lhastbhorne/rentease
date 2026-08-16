import PropertyCard from "./PropertyCard";

function PropertyGrid({ properties = [] }) {
  // No properties
  if (properties.length === 0) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">
              No Properties Found
            </h2>

            <p className="mt-3 text-slate-500">
              There are currently no rental properties available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Available Properties
            </h2>

            <p className="mt-2 text-slate-600">
              Browse our collection of rental properties.
            </p>
          </div>

          <span className="w-fit rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-600">
            {properties.length}{" "}
            {properties.length === 1 ? "Property" : "Properties"} Found
          </span>
        </div>

        {/* Property Cards */}
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default PropertyGrid;