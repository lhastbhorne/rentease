import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "../property/public/PropertyCard";
import { getAllProperties } from "../../firebase/propertyService";

function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeaturedProperties() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllProperties();

        const sortedProperties = [...data].sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(0);

          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(0);

          return dateB - dateA;
        });

        setProperties(sortedProperties.slice(0, 6));
      } catch (err) {
        console.error("Error loading featured properties:", err);
        setError("Unable to load properties at the moment.");
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedProperties();
  }, []);

  return (
    <section className="bg-slate-50 py-20 transition-colors duration-300 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-14 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">
              Featured Properties
            </h2>

            <p className="mt-3 text-gray-600 transition-colors duration-300 dark:text-slate-400">
              Explore some of our latest verified properties.
            </p>
          </div>

          <Link
            to="/properties"
            className="hidden rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 md:block"
          >
            View All
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl bg-white shadow-sm transition-colors duration-300 dark:bg-slate-800"
              >
                <div className="h-64 animate-pulse bg-gray-200 dark:bg-slate-700" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm transition-colors duration-300 dark:bg-slate-800">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm transition-colors duration-300 dark:bg-slate-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              No featured properties yet
            </h3>

            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Verified properties will appear here once they are approved by the
              administrator.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        )}

        {/* Properties */}
        {!loading && !error && properties.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-10 text-center md:hidden">
          <Link
            to="/properties"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProperties;
