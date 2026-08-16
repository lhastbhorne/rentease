import { useEffect, useState } from "react";

import {
  FaHeart,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaTrash,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import { useAuth } from "../../contexts/AuthContext";

import {
  getSavedProperties,
  removeSavedProperty,
} from "../../firebase/savedPropertyService";

function SavedProperties() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);

  async function loadSavedProperties() {
    if (!user?.uid) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getSavedProperties(user.uid);

      setProperties(data);
    } catch (error) {
      console.error("Error loading saved properties:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSavedProperties();
  }, [user]);

  async function handleRemove(propertyId) {
    const confirmed = window.confirm(
      "Remove this property from your saved properties?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeSavedProperty(user.uid, propertyId);

      setProperties((prev) =>
        prev.filter((property) => property.propertyId !== propertyId),
      );
    } catch (error) {
      console.error("Error removing property:", error);

      alert("Failed to remove property.");
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <FaHeart />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Saved Properties
              </h1>

              <p className="mt-1 text-slate-500">
                Properties you saved for later.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Loading saved properties...</p>
          </div>
        )}

        {/* Empty */}

        {!loading && properties.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <FaHeart size={50} className="mx-auto text-slate-300" />

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              No Saved Properties
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              You haven't saved any properties yet. Browse available properties
              and save the ones you like.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        )}

        {/* Properties */}

        {!loading && properties.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* Image */}

                <div className="relative">
                  <img
                    src={
                      property.images?.length
                        ? property.images[0]
                        : "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={property.title || "Property"}
                    className="h-56 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=No+Image";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemove(property.propertyId)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-md hover:bg-red-50"
                    title="Remove saved property"
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Content */}

                <div className="p-5">
                  <h2 className="text-xl font-bold text-slate-800">
                    {property.title || "Untitled Property"}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-slate-500">
                    <FaMapMarkerAlt />

                    {property.city || "Location unavailable"}

                    {property.state ? `, ${property.state}` : ""}
                  </p>

                  <p className="mt-4 text-xl font-bold text-blue-600">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>

                  <div className="mt-4 flex gap-5 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <FaBed />
                      {property.bedrooms || 0}
                    </span>

                    <span className="flex items-center gap-2">
                      <FaBath />
                      {property.bathrooms || 0}
                    </span>
                  </div>

                  <Link
                    to={`/properties/${property.propertyId}`}
                    className="mt-5 block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    View Property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SavedProperties;
