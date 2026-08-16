import LandlordPropertyCard from "./LandlordPropertyCard";

function LandlordPropertyGrid({ properties, onDelete }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">
          No Properties Found
        </h2>

        <p className="mt-3 text-slate-500">
          You haven't uploaded any properties yet.
        </p>

        <p className="mt-1 text-slate-500">
          Click <strong>Add Property</strong> to create your first listing.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {properties.map((property) => (
        <LandlordPropertyCard
          key={property.id}
          property={property}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default LandlordPropertyGrid;