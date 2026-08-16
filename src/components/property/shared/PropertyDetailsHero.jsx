import SavePropertyButton from "../../common/InfoRow"
function PropertyDetailsHero({ property }) {
  return (
    <section className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <span className="inline-block rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold">
          {property.status}
        </span>

        <h1 className="mt-6 text-4xl font-bold md:text-5xl">
          {property.title}
        </h1>

        <p className="mt-4 text-lg text-slate-300">📍 {property.location}</p>

        <div className="mt-8 flex flex-wrap gap-8">
          <div>
            <p className="text-sm text-slate-400">Bedrooms</p>
            <p className="text-xl font-bold">{property.bedrooms}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Bathrooms</p>
            <p className="text-xl font-bold">{property.bathrooms}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Area</p>
            <p className="text-xl font-bold">{property.area}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-4xl font-bold text-blue-400">{property.price}</h2>
          <div className="mt-6">
            <SavePropertyButton />
          </div>
        </div>
      </div>
    </section>
  );
}

export default PropertyDetailsHero;
