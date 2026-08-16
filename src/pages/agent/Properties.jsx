import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getAgentProperties } from "../../firebase/propertyService";

function Properties() {
  const { user } = useAuth();

  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProperties() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const data =
          await getAgentProperties(
            user.uid,
          );

        setProperties(data);
      } catch (error) {
        console.error(
          "Error loading agent properties:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [user?.uid]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Managed Properties
          </h1>

          <p className="mt-2 text-slate-500">
            Properties assigned to you for management.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading properties...
            </p>
          </div>
        )}

        {!loading &&
          properties.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FaBuilding className="text-2xl" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-800">
                No Managed Properties
              </h2>

              <p className="mt-2 text-slate-500">
                Properties assigned to you will
                appear here.
              </p>

            </div>
          )}

        {!loading &&
          properties.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {properties.map(
                (property) => (
                  <div
                    key={property.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >

                    <img
                      src={
                        property.images?.[0] ||
                        "https://placehold.co/600x400?text=Property"
                      }
                      alt={
                        property.title ||
                        "Property"
                      }
                      className="h-56 w-full object-cover"
                    />

                    <div className="p-6">

                      <h2 className="text-xl font-bold text-slate-800">
                        {property.title ||
                          "Untitled Property"}
                      </h2>

                      <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                        <FaMapMarkerAlt className="mt-1 shrink-0" />

                        <span>
                          {property.city ||
                            "Location unavailable"}

                          {property.state
                            ? `, ${property.state}`
                            : ""}
                        </span>
                      </p>

                      <p className="mt-4 text-xl font-bold text-blue-600">
                        ₦
                        {Number(
                          property.price || 0,
                        ).toLocaleString()}
                      </p>

                      <div className="mt-4 flex justify-between text-sm text-slate-500">
                        <span>
                          {property.bedrooms ||
                            0}{" "}
                          Bedrooms
                        </span>

                        <span>
                          {property.bathrooms ||
                            0}{" "}
                          Bathrooms
                        </span>
                      </div>

                    </div>
                  </div>
                ),
              )}

            </div>
          )}

      </div>
    </DashboardLayout>
  );
}

export default Properties;