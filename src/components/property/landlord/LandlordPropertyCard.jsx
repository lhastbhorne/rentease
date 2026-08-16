import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaEdit,
  FaEye,
  FaTrash,
} from "react-icons/fa";

import PropertyStatusBadge from "./PropertyStatusBadge";

function LandlordPropertyCard({ property, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <img
        src={
          property.images?.length
            ? property.images[0]
            : "https://placehold.co/600x400?text=No+Image"
        }
        alt={property.title}
        className="h-56 w-full object-cover"
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            {property.title}
          </h2>

          <PropertyStatusBadge
            status={property.approvalStatus}
          />
        </div>

        <p className="mt-3 flex items-center gap-2 text-slate-500">
          <FaMapMarkerAlt />
          {property.city}, {property.state}
        </p>

        <p className="mt-4 text-3xl font-bold text-blue-600">
          ₦{Number(property.price).toLocaleString()}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Link
            to={`/landlord/property/${property.id}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            <FaEye />
            View
          </Link>

          <Link
            to={`/landlord/edit-property/${property.id}`}
            className="flex items-center justify-center gap-2 rounded-lg border py-2 hover:bg-slate-100"
          >
            <FaEdit />
            Edit
          </Link>

          <button
            type="button"
            onClick={() => onDelete(property.id)}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandlordPropertyCard;