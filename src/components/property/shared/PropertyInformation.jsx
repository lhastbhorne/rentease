function PropertyInformation({ property }) {
  return (
    <section className="bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Property Description */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900">
              Property Description
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              {property.description || "No description available for this property."}
            </p>
          </div>

          {/* Property Details */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Property Details
            </h2>

            <div className="mt-5 space-y-0">

              <DetailRow
                label="Property Type"
                value={property.type || "N/A"}
              />

              <DetailRow
                label="Status"
                value={property.status || "Available"}
              />

              <DetailRow
                label="Bedrooms"
                value={property.bedrooms ?? 0}
              />

              <DetailRow
                label="Bathrooms"
                value={property.bathrooms ?? 0}
              />

              <DetailRow
                label="Area"
                value={
                  property.area
                    ? `${property.area} sqft`
                    : "N/A"
                }
              />

              <DetailRow
                label="Parking"
                value={property.parking ?? 0}
              />

              <DetailRow
                label="Furnished"
                value={property.furnished || "N/A"}
              />

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-4 last:border-b-0">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

export default PropertyInformation;