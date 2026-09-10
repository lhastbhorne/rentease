import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaEdit,
  FaEye,
  FaTrash,
  FaBed,
  FaToilet,
  FaBath,
  FaCar,
} from "react-icons/fa";

import PropertyStatusBadge from "./PropertyStatusBadge";

function LandlordPropertyCard({ property, onDelete }) {
  const bedrooms = property.bedrooms ?? 0;
  const toilets = property.toilets ?? property.guestToilet ?? 0;
  const bathrooms = property.bathrooms ?? 0;
  const parking = property.parking ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Property Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <img
          src={
            property.images?.length
              ? property.images[0]
              : "https://placehold.co/600x400?text=No+Image"
          }
          alt={property.title || "Property"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Status */}
        <div className="absolute right-4 top-4">
          <PropertyStatusBadge status={property.approvalStatus} />
        </div>
      </div>

      {/* Property Content */}
      <div className="p-5">
        {/* Title */}
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">
            {property.title || "Untitled Property"}
          </h2>

          {/* Location */}
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <FaMapMarkerAlt className="shrink-0 text-blue-600 dark:text-blue-400" />

            <span className="truncate">
              {property.areaName ? `${property.areaName}, ` : ""}
              {property.city || "Unknown City"}
              {property.state ? `, ${property.state}` : ""}
            </span>
          </p>
        </div>

        {/* Price */}
        <div className="mt-5">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₦{Number(property.price || 0).toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rental price
          </p>
        </div>

        {/* Property Stats */}
        <div className="mt-5 grid grid-cols-4 gap-2 border-y border-slate-100 py-4 dark:border-slate-800">
          <div className="flex min-w-0 flex-col items-center text-center">
            <FaBed className="text-slate-500 dark:text-slate-400" />

            <span className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {bedrooms}
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Beds
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <FaToilet className="text-slate-500 dark:text-slate-400" />

            <span className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {toilets}
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Toilets
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <FaBath className="text-slate-500 dark:text-slate-400" />

            <span className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {bathrooms}
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Baths
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <FaCar className="text-slate-500 dark:text-slate-400" />

            <span className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {parking}
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Parking
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Link
            to={`/landlord/property/${property.id}`}
            className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-2 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FaEye className="shrink-0" />
            <span>View</span>
          </Link>

          <Link
            to={`/landlord/edit-property/${property.id}`}
            className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FaEdit className="shrink-0" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={() => onDelete(property.id)}
            className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-2 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <FaTrash className="shrink-0" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default LandlordPropertyCard;
