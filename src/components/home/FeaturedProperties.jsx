import { Link } from "react-router-dom";
import PropertyCard from "../property/public/PropertyCard";
import properties from "../../data/properties";

function FeaturedProperties() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">Featured Properties</h2>

            <p className="mt-3 text-gray-600">
              Explore some of our latest verified properties.
            </p>
          </div>

          <Link
            to="/properties"
            className="hidden rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 md:block"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            to="/properties"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProperties;
