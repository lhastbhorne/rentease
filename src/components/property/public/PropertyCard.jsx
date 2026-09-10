import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaBed, FaBath, FaMapMarkerAlt, FaHeart } from "react-icons/fa";

import { useAuth } from "../../../contexts/AuthContext";

import {
  saveProperty,
  removeSavedProperty,
  isPropertySaved,
} from "../../../firebase/savedPropertyService";

function PropertyCard({ property, tenantView = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // PROPERTY DETAILS ROUTE
  // =====================================================

  const propertyDetailsPath = tenantView
    ? `/tenant/properties/${property.id}`
    : `/properties/${property.id}`;

  // =====================================================
  // PROPERTY IMAGE
  // =====================================================

  const image =
    Array.isArray(property?.images) && property.images.length > 0
      ? property.images[0]
      : "https://placehold.co/600x400?text=No+Image";

  // =====================================================
  // PROPERTY PRICE
  // =====================================================

  const price = Number(property?.price || 0);

  // =====================================================
  // CHECK IF PROPERTY IS SAVED
  // =====================================================

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
  }, [user?.uid, property?.id]);

  // =====================================================
  // SAVE / REMOVE PROPERTY
  // =====================================================

  async function handleSaveProperty() {
    if (!user) {
      navigate("/login", {
        state: {
          from: propertyDetailsPath,
          action: "save",
          propertyId: property.id,
        },
      });

      return;
    }

    try {
      setSaving(true);

      if (saved) {
        await removeSavedProperty(user.uid, property.id);

        setSaved(false);

        return;
      }

      await saveProperty(user.uid, property);

      setSaved(true);
    } catch (error) {
      console.error("Error saving property:", error);

      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:shadow-blue-500/10">
      {/* =================================================
          PROPERTY IMAGE
      ================================================= */}

      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={property?.title || "Rental property"}
          className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/600x400?text=No+Image";
          }}
        />

        {/* Image Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleSaveProperty}
          disabled={saving}
          aria-label={saved ? "Remove from saved properties" : "Save property"}
          className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:scale-110 dark:bg-slate-900 ${
            saved
              ? "text-red-500"
              : "text-slate-500 hover:text-red-500 dark:text-slate-300"
          } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <FaHeart className={saved ? "text-xl" : "text-lg"} />
        </button>
      </div>

      {/* =================================================
          PROPERTY CONTENT
      ================================================= */}

      <div className="p-6">
        {/* =================================================
            TITLE
        ================================================= */}

        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {property?.title || "Untitled Property"}
        </h3>

        {/* =================================================
            LOCATION
        ================================================= */}

        <p className="mt-2 flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <FaMapMarkerAlt className="shrink-0" />

          <span>
            {property?.city || "Location unavailable"}

            {property?.state ? `, ${property.state}` : ""}
          </span>
        </p>

        {/* =================================================
            PRICE
        ================================================= */}

        <p className="mt-4 text-2xl font-bold text-blue-600 dark:text-blue-400">
          ₦{price.toLocaleString()}
        </p>

        {/* =================================================
            PROPERTY FEATURES
        ================================================= */}

        <div className="mt-5 flex gap-6 text-gray-600 dark:text-slate-400">
          {/* Bedrooms */}

          <span className="flex items-center gap-2">
            <FaBed />

            <span>{property?.bedrooms || 0}</span>

            <span className="text-sm">Beds</span>
          </span>

          {/* Bathrooms */}

          <span className="flex items-center gap-2">
            <FaBath />

            <span>{property?.bathrooms || 0}</span>

            <span className="text-sm">Baths</span>
          </span>
        </div>

        {/* =================================================
            VIEW DETAILS
        ================================================= */}

        <Link
          to={propertyDetailsPath}
          className="mt-6 block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default PropertyCard;
