import { useEffect, useState } from "react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PropertyGrid from "../../components/property/public/PropertyGrid";
import { getAllProperties } from "../../firebase/propertyService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllProperties();

        setProperties(data);
      } catch (err) {
        console.error("Error loading properties:", err);
        setError("Unable to load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Browse Properties
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Find a property that suits your needs and submit an application.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-slate-500">
              Loading available properties...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-red-600">
              Something went wrong
            </h2>

            <p className="mt-3 text-slate-500">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Properties */}
        {!loading && !error && <PropertyGrid properties={properties} />}
      </div>
    </DashboardLayout>
  );
}

export default Properties;
