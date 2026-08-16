import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaBed, FaBath, FaMapMarkerAlt, FaHeart } from "react-icons/fa";

import { useAuth } from "../../../contexts/AuthContext";

import {
  saveProperty,
  removeSavedProperty,
  isPropertySaved,
} from "../../../firebase/savedPropertyService";

function PropertyCard({ property }) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);

  const [saving, setSaving] = useState(false);

  const image =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images[0]
      : "https://placehold.co/600x400?text=No+Image";

  const price = Number(property.price || 0);

  /*
  |--------------------------------------------------------------------------
  | Check Saved Status
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function checkSavedStatus() {
      if (!user?.uid || !property?.id) {
        if (mounted) {
          setSaved(false);
        }

        return;
      }

      try {
        const result = await isPropertySaved(user.uid, property.id);

        if (mounted) {
          setSaved(result);
        }
      } catch (error) {
        console.error("Error checking saved property:", error);
      }
    }

    checkSavedStatus();

    return () => {
      mounted = false;
    };
  }, [user, property?.id]);

  /*
  |--------------------------------------------------------------------------
  | Save / Remove Property
  |--------------------------------------------------------------------------
  */

  async function handleSaveProperty() {
    // Visitor is not logged in
    if (!user) {
      navigate("/login", {
        state: {
          from: `/properties/${property.id}`,
          action: "save",
          property,
        },
      });

      return;
    }

    try {
      setSaving(true);

      if (saved) {
        await removeSavedProperty(user.uid, property.id);

        setSaved(false);
      } else {
        await saveProperty(user.uid, property);

        setSaved(true);
      }
    } catch (error) {
      console.error("Error saving property:", error);

      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-2 hover:shadow-xl">
      {/* Image */}

      <div className="relative">
        <img
          src={image}
          alt={property.title || "Rental property"}
          className="h-60 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
          }}
        />

        {/* Save Button */}

        <button
          type="button"
          onClick={handleSaveProperty}
          disabled={saving}
          aria-label={saved ? "Remove from saved properties" : "Save property"}
          className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 ${
            saved ? "text-red-500" : "text-slate-500 hover:text-red-500"
          } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <FaHeart className={saved ? "text-xl" : "text-lg"} />
        </button>
      </div>

      {/* Content */}

      <div className="p-6">
        {/* Title */}

        <h3 className="text-2xl font-semibold text-slate-900">
          {property.title || "Untitled Property"}
        </h3>

        {/* Location */}

        <p className="mt-2 flex items-center gap-2 text-gray-500">
          <FaMapMarkerAlt />

          {property.city || "Location unavailable"}

          {property.state ? `, ${property.state}` : ""}
        </p>

        {/* Price */}

        <p className="mt-4 text-2xl font-bold text-blue-600">
          ₦{price.toLocaleString()}
        </p>

        {/* Property Features */}

        <div className="mt-5 flex gap-6 text-gray-600">
          <span className="flex items-center gap-2">
            <FaBed />
            {property.bedrooms || 0}
          </span>

          <span className="flex items-center gap-2">
            <FaBath />
            {property.bathrooms || 0}
          </span>
        </div>

        {/* Details */}

        <Link
          to={`/properties/${property.id}`}
          className="mt-6 block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default PropertyCard;
