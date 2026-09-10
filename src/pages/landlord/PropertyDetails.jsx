import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaBed,
  FaBath,
  FaToilet,
  FaCar,
  FaMapMarkerAlt,
  FaHome,
  FaRulerCombined,
  FaCheckCircle,
  FaBuilding,
  FaEdit,
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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Loading property...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // PROPERTY NOT FOUND
  // ==========================================

  if (!property) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <FaHome className="text-2xl text-slate-400" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            Property not found
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            The property you're looking for could not be found.
          </p>

          <button
            onClick={() => navigate("/landlord/my-properties")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to My Properties
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const amenities = Array.isArray(property.amenities) ? property.amenities : [];

  const nearbyFacilities = Array.isArray(property.nearbyFacilities)
    ? property.nearbyFacilities
    : [];

  const images = Array.isArray(property.images) ? property.images : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ========================================
            BACK BUTTON
        ======================================== */}

        <div>
          <button
            onClick={() => navigate("/landlord/my-properties")}
            className="flex items-center gap-2 text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <FaArrowLeft />

            <span>Back to My Properties</span>
          </button>
        </div>

        {/* ========================================
            PROPERTY HEADER
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {property.category && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                  {property.category}
                </span>
              )}

              {property.approvalStatus && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    property.approvalStatus === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      : property.approvalStatus === "rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                  }`}
                >
                  {property.approvalStatus.charAt(0).toUpperCase() +
                    property.approvalStatus.slice(1)}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              {property.title}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <FaMapMarkerAlt className="text-blue-600" />

              <span>
                {property.areaName ? `${property.areaName}, ` : ""}
                {property.city || ""}
                {property.state ? `, ${property.state}` : ""}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Property Price
            </p>

            <p className="text-3xl font-bold text-blue-600">
              ₦{Number(property.price || 0).toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* ========================================
            IMAGES
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900"
        >
          {images.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="relative overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="h-72 w-full object-cover transition duration-500 hover:scale-105 md:h-96"
                  />

                  {index === 0 && (
                    <span className="absolute bottom-4 left-4 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Main Image
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center bg-slate-100 dark:bg-slate-800">
              <div className="text-center">
                <FaHome className="mx-auto text-4xl text-slate-400" />

                <p className="mt-3 font-semibold text-slate-500 dark:text-slate-400">
                  No Images
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ========================================
            PROPERTY STATS
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {/* TYPE */}

          <PropertyStat
            icon={<FaHome />}
            label="Property Type"
            value={property.type || "N/A"}
          />

          {/* BEDROOMS */}

          <PropertyStat
            icon={<FaBed />}
            label="Bedrooms"
            value={property.bedrooms ?? 0}
          />

          {/* TOILETS */}

          <PropertyStat
            icon={<FaToilet />}
            label="Toilets"
            value={property.toilets ?? 0}
          />

          {/* BATHROOMS */}

          <PropertyStat
            icon={<FaBath />}
            label="Bathrooms"
            value={property.bathrooms ?? 0}
          />

          {/* PARKING */}

          <PropertyStat
            icon={<FaCar />}
            label="Parking"
            value={property.parking ?? 0}
          />

          {/* SIZE */}

          <PropertyStat
            icon={<FaRulerCombined />}
            label="Property Size"
            value={
              property.area
                ? `${Number(property.area).toLocaleString()} sqft`
                : "N/A"
            }
          />
        </motion.div>

        {/* ========================================
            DESCRIPTION + INFORMATION
        ======================================== */}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* DESCRIPTION */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white p-8 shadow-sm lg:col-span-2 dark:bg-slate-900"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Description
            </h2>

            <p className="mt-4 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">
              {property.description || "No description provided."}
            </p>
          </motion.div>

          {/* BASIC INFORMATION */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Property Information
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Category" value={property.category} />

              <InfoRow label="Property Type" value={property.type} />

              <InfoRow label="Furnished" value={property.furnished} />

              <InfoRow label="Status" value={property.status} />

              <InfoRow label="Approval" value={property.approvalStatus} />

              <InfoRow
                label="Management"
                value={
                  property.managementType === "agent"
                    ? "Agent Managed"
                    : "Owner Managed"
                }
              />
            </div>
          </motion.div>
        </div>

        {/* ========================================
            LOCATION
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
              <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Property Location
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Internal property address
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Area / Neighborhood
              </p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {property.areaName || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">City</p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {property.city || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                State
              </p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {property.state || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Exact Address
              </p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {property.address || "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              🔒 The exact address is private and should only be used for
              internal property management, verification and inspection
              purposes.
            </p>
          </div>
        </motion.div>

        {/* ========================================
            PROPERTY AMENITIES
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Property Amenities
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Features and facilities available on the property.
          </p>

          {amenities.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
                >
                  <FaCheckCircle className="shrink-0 text-green-500" />

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyFeatureMessage message="No amenities selected." />
          )}
        </motion.div>

        {/* ========================================
            NEARBY FACILITIES
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
              <FaBuilding className="text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Nearby Facilities
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Facilities located around the property.
              </p>
            </div>
          </div>

          {nearbyFacilities.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {nearbyFacilities.map((facility) => (
                <div
                  key={facility}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
                >
                  <FaCheckCircle className="shrink-0 text-blue-500" />

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {facility}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyFeatureMessage message="No nearby facilities selected." />
          )}
        </motion.div>

        {/* ========================================
            MANAGER
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Property Manager
          </h2>

          <div className="mt-5 flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center dark:bg-slate-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              {(property.managerName || "P").charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {property.managerName || "Property Manager"}
              </p>

              <p className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">
                {property.managerRole || "Manager"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ========================================
            EDIT PROPERTY
        ======================================== */}

        <div className="flex justify-end pb-4">
          <motion.button
            type="button"
            onClick={() => navigate(`/landlord/edit-property/${property.id}`)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 dark:hover:bg-blue-500"
          >
            <FaEdit />
            Edit Property
          </motion.button>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ==========================================
// PROPERTY STAT COMPONENT
// ==========================================

function PropertyStat({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900"
    >
      <div className="text-xl text-blue-600 dark:text-blue-400">{icon}</div>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </motion.div>
  );
}

// ==========================================
// INFO ROW COMPONENT
// ==========================================

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-semibold capitalize text-slate-900 dark:text-white">
        {value || "N/A"}
      </span>
    </div>
  );
}

// ==========================================
// EMPTY FEATURE MESSAGE
// ==========================================

function EmptyFeatureMessage({ message }) {
  return (
    <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center dark:bg-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export default PropertyDetails;
