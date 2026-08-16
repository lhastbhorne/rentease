function AmenityCard({ amenity }) {
  const Icon = amenity.icon;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
        <Icon />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{amenity.name}</h3>
    </div>
  );
}

export default AmenityCard;
