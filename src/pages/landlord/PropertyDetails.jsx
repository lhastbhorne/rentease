import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBed,
  FaBath,
  FaCar,
  FaMapMarkerAlt,
  FaHome,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getPropertyById } from "../../firebase/propertyService";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (error) {
        console.error("Error loading property:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-xl bg-white p-8 text-center">
          Loading property...
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="rounded-xl bg-white p-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Property not found
          </h1>

          <button
            onClick={() => navigate("/landlord/my-properties")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            Back to My Properties
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate("/landlord/my-properties")}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
        >
          <FaArrowLeft />
          Back to My Properties
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {/* Images */}
        {property.images?.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {property.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} ${index + 1}`}
                className="h-80 w-full object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center bg-slate-200 text-2xl font-semibold text-slate-500">
            No Images
          </div>
        )}

        {/* Information */}
        <div className="p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {property.title}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-slate-500">
                <FaMapMarkerAlt />
                {property.address}, {property.city}, {property.state}
              </p>
            </div>

            <div className="text-3xl font-bold text-blue-600">
              ₦{Number(property.price || 0).toLocaleString()}
            </div>
          </div>

          {/* Property stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-5">
              <FaHome className="text-blue-600" />
              <p className="mt-2 text-sm text-slate-500">Property Type</p>
              <p className="font-semibold">{property.type || "N/A"}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <FaBed className="text-blue-600" />
              <p className="mt-2 text-sm text-slate-500">Bedrooms</p>
              <p className="font-semibold">{property.bedrooms || 0}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <FaBath className="text-blue-600" />
              <p className="mt-2 text-sm text-slate-500">Bathrooms</p>
              <p className="font-semibold">{property.bathrooms || 0}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <FaCar className="text-blue-600" />
              <p className="mt-2 text-sm text-slate-500">Parking</p>
              <p className="font-semibold">{property.parking || 0}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold">Description</h2>

            <p className="mt-3 leading-7 text-slate-600">
              {property.description || "No description provided."}
            </p>
          </div>

          {/* Additional information */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold">Property Information</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <p>
                <strong>Category:</strong> {property.category || "N/A"}
              </p>

              <p>
                <strong>Furnished:</strong> {property.furnished || "N/A"}
              </p>

              <p>
                <strong>Area:</strong> {property.area || "N/A"} sqft
              </p>

              <p>
                <strong>Status:</strong> {property.status || "N/A"}
              </p>

              <p>
                <strong>Approval:</strong> {property.approvalStatus || "N/A"}
              </p>
            </div>
          </div>

          {/* Edit button */}
          <div className="mt-10">
            <button
              onClick={() => navigate(`/landlord/edit-property/${property.id}`)}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Edit Property
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PropertyDetails;
