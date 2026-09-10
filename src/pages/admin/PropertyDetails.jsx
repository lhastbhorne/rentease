import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaToilet,
  FaCar,
  FaRulerCombined,
  FaHome,
  FaUser,
  FaFileAlt,
  FaImage,
  FaExclamationCircle,
  FaSpinner,
  FaCalendarAlt,
  FaBuilding,
  FaShieldAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout"

import {
  getPropertyById,
  updateProperty,
} from "../../firebase/propertyService";

import { db } from "../../firebase/firestore";

import { doc, getDoc, serverTimestamp } from "firebase/firestore";

/* =====================================================
   HELPERS
===================================================== */

const formatPrice = (price) => {
  if (price === undefined || price === null || price === "") {
    return "N/A";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "N/A";
  }

  return `₦${numericPrice.toLocaleString()}`;
};

const getRentFrequencyLabel = (frequency) => {
  switch (frequency) {
    case "monthly":
      return "per month";

    case "annual":
      return "per annum";

    case "quarterly":
      return "per quarter";

    case "half_yearly":
      return "per 6 months";

    default:
      return "";
  }
};

const formatDate = (date) => {
  if (!date) {
    return "N/A";
  }

  try {
    const value =
      typeof date?.toDate === "function" ? date.toDate() : new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "N/A";
    }

    return value.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

    case "occupied":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

    case "reserved":
      return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";

    case "maintenance":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";

    case "available":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300";
  }
};

/* =====================================================
   REUSABLE INFO ITEM
===================================================== */

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
      <Icon size={17} />

      <span className="text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>

    <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">
      {value !== undefined && value !== null && value !== "" ? value : "N/A"}
    </p>
  </div>
);

/* =====================================================
   REUSABLE SECTION
===================================================== */

const Section = ({ title, icon: Icon, children }) => (
  <motion.section
    initial={{
      opacity: 0,
      y: 15,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    transition={{
      duration: 0.35,
    }}
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6"
  >
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Icon size={20} />
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
    </div>

    {children}
  </motion.section>
);

/* =====================================================
   PAGE
===================================================== */

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);

  /* =====================================================
     LOAD PROPERTY
  ===================================================== */

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setError("Property ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const propertyData = await getPropertyById(id);

        if (!propertyData) {
          setError("Property not found.");
          setLoading(false);
          return;
        }

        setProperty(propertyData);

        /*
         * Load owner / manager profile.
         *
         * Landlord:
         * ownerId = landlord UID
         *
         * Agent:
         * ownerId = agent UID
         * agentId = agent UID
         */

        const profileId =
          propertyData.ownerId ||
          propertyData.managerId ||
          propertyData.agentId;

        if (profileId) {
          try {
            const userSnap = await getDoc(doc(db, "users", profileId));

            if (userSnap.exists()) {
              setOwner({
                id: userSnap.id,
                ...userSnap.data(),
              });
            }
          } catch (profileError) {
            console.error("Unable to load property owner:", profileError);
          }
        }
      } catch (err) {
        console.error("Failed to load property:", err);

        setError(err?.message || "Unable to load property details.");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  /* =====================================================
     APPROVE PROPERTY
  ===================================================== */

  const handleApprove = async () => {
    if (!property?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to approve this property?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await updateProperty(property.id, {
        approvalStatus: "approved",
        approvedAt: serverTimestamp(),
        rejectionReason: "",
      });

      setProperty((prev) => ({
        ...prev,
        approvalStatus: "approved",
        rejectionReason: "",
      }));
    } catch (err) {
      console.error("Failed to approve property:", err);

      setError(err?.message || "Failed to approve this property.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     REJECT PROPERTY
  ===================================================== */

  const handleReject = async () => {
    if (!property?.id) {
      return;
    }

    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejecting this property.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await updateProperty(property.id, {
        approvalStatus: "rejected",
        rejectionReason: rejectReason.trim(),
        rejectedAt: serverTimestamp(),
      });

      setProperty((prev) => ({
        ...prev,
        approvalStatus: "rejected",
        rejectionReason: rejectReason.trim(),
      }));

      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      console.error("Failed to reject property:", err);

      setError(err?.message || "Failed to reject this property.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     PROPERTY DATA
  ===================================================== */

  const images = Array.isArray(property?.images) ? property.images : [];

  const currentImage = images[selectedImage] || images[0] || null;

  const amenities = Array.isArray(property?.amenities)
    ? property.amenities
    : [];

  const nearbyFacilities = Array.isArray(property?.nearbyFacilities)
    ? property.nearbyFacilities
    : [];

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <FaSpinner
              size={36}
              className="animate-spin text-indigo-600 dark:text-indigo-400"
            />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading property details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error && !property) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <button
            type="button"
            onClick={() => navigate("/admin/properties")}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            <FaArrowLeft size={18} />
            Back to Properties
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <FaExclamationCircle
              className="mx-auto mb-3 text-red-500"
              size={40}
            />

            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
              Unable to Load Property
            </h2>

            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-6"
        >
          <button
            type="button"
            onClick={() => navigate("/admin/properties")}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            <FaArrowLeft size={18} />
            Back to Properties
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                    property.approvalStatus || property.status,
                  )}`}
                >
                  {property.approvalStatus || property.status || "Unknown"}
                </span>

                {property.status && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                      property.status,
                    )}`}
                  >
                    Property: {property.status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {property.title || "Untitled Property"}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <FaMapMarkerAlt size={16} />

                <span>
                  {property.areaName ? `${property.areaName}, ` : ""}
                  {property.city || "Unknown City"},{" "}
                  {property.state || "Unknown State"}
                </span>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-3">
              {property.approvalStatus !== "approved" && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <FaSpinner size={17} className="animate-spin" />
                  ) : (
                    <FaCheckCircle size={18} />
                  )}
                  Approve Property
                </button>
              )}

              {property.approvalStatus !== "rejected" && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setShowRejectModal(true);
                  }}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaTimesCircle size={18} />
                  Reject Property
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
            <FaExclamationCircle
              className="mt-0.5 shrink-0 text-red-500"
              size={19}
            />

            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* =================================================
            IMAGE GALLERY
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          {currentImage ? (
            <div className="grid lg:grid-cols-[1fr_180px]">
              {/* MAIN IMAGE */}

              <div className="relative h-[300px] bg-slate-100 dark:bg-slate-900 sm:h-[420px] lg:h-[520px]">
                <img
                  src={currentImage}
                  alt={property.title || "Property"}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  <FaImage size={14} />
                  {selectedImage + 1} / {images.length}
                </div>
              </div>

              {/* THUMBNAILS */}

              <div className="flex gap-3 overflow-x-auto bg-slate-50 p-3 dark:bg-slate-900 lg:flex-col lg:overflow-y-auto">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition lg:h-28 lg:w-full ${
                      selectedImage === index
                        ? "border-indigo-600 dark:border-indigo-400"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center text-slate-400">
              <FaImage size={45} />

              <p className="mt-3 text-sm">No property images available</p>
            </div>
          )}
        </motion.section>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="space-y-6 lg:col-span-2">
            {/* RENTAL INFORMATION */}

            <Section title="Rental Information" icon={FaHome}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-indigo-50 p-5 dark:bg-indigo-500/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                    Rental Price
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {formatPrice(property.price)}
                  </p>

                  {property.rentFrequency && (
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {getRentFrequencyLabel(property.rentFrequency)}
                    </p>
                  )}
                </div>

                <InfoItem
                  icon={FaHome}
                  label="Property Type"
                  value={property.type || property.category}
                />

                <InfoItem
                  icon={FaBuilding}
                  label="Category"
                  value={property.category}
                />

                <InfoItem
                  icon={FaCalendarAlt}
                  label="Date Listed"
                  value={formatDate(property.createdAt)}
                />
              </div>
            </Section>

            {/* PROPERTY FEATURES */}

            <Section title="Property Features" icon={FaHome}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  icon={FaBed}
                  label="Bedrooms"
                  value={property.bedrooms}
                />

                <InfoItem
                  icon={FaToilet}
                  label="Toilets"
                  value={property.toilets}
                />

                <InfoItem
                  icon={FaBath}
                  label="Bathrooms"
                  value={property.bathrooms}
                />

                <InfoItem
                  icon={FaCar}
                  label="Parking"
                  value={property.parking}
                />

                <InfoItem
                  icon={FaRulerCombined}
                  label="Property Size"
                  value={property.area ? property.area : "N/A"}
                />

                <InfoItem
                  icon={FaHome}
                  label="Furnished"
                  value={property.furnished}
                />
              </div>
            </Section>

            {/* DESCRIPTION */}

            <Section title="Property Description" icon={FaFileAlt}>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {property.description || "No description provided."}
              </p>
            </Section>

            {/* LOCATION */}

            <Section title="Property Location" icon={FaMapMarkerAlt}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={FaMapMarkerAlt}
                  label="Area / Neighborhood"
                  value={property.areaName}
                />

                <InfoItem
                  icon={FaMapMarkerAlt}
                  label="City"
                  value={property.city}
                />

                <InfoItem
                  icon={FaMapMarkerAlt}
                  label="State"
                  value={property.state}
                />

                {/* EXACT ADDRESS */}

                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10 sm:col-span-2">
                  <div className="mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <FaMapMarkerAlt size={17} />

                    <span className="text-xs font-bold uppercase tracking-wide">
                      Exact Address
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {property.address || "No exact address provided."}
                  </p>
                </div>
              </div>
            </Section>

            {/* AMENITIES */}

            <Section title="Amenities" icon={FaShieldAlt}>
              {amenities.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FaCheckCircle
                        size={16}
                        className="shrink-0 text-emerald-500"
                      />

                      {amenity}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No amenities listed.
                </p>
              )}
            </Section>

            {/* NEARBY FACILITIES */}

            <Section title="Nearby Facilities" icon={FaMapMarkerAlt}>
              {nearbyFacilities.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {nearbyFacilities.map((facility, index) => (
                    <div
                      key={`${facility}-${index}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FaMapMarkerAlt
                        size={16}
                        className="shrink-0 text-indigo-500"
                      />

                      {facility}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No nearby facilities listed.
                </p>
              )}
            </Section>

            {/* OWNERSHIP / VERIFICATION */}

            <Section title="Ownership & Verification" icon={FaFileAlt}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={FaUser}
                  label="Owner Role"
                  value={property.ownerRole || property.managementType || "N/A"}
                />

                <InfoItem
                  icon={FaUser}
                  label="Owner ID"
                  value={property.ownerId}
                />

                <InfoItem
                  icon={FaUser}
                  label="Agent ID"
                  value={property.agentId}
                />

                <InfoItem
                  icon={FaShieldAlt}
                  label="Approval Status"
                  value={property.approvalStatus || "N/A"}
                />
              </div>

              {/* OWNERSHIP DOCUMENT */}

              {property.ownershipProof && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-2">
                    <FaFileAlt size={18} className="text-indigo-500" />

                    <span className="font-bold text-slate-900 dark:text-white">
                      Ownership Proof
                    </span>
                  </div>

                  <a
                    href={property.ownershipProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    View Ownership Document
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              )}

              {/* REJECTION REASON */}

              {property.rejectionReason && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                  <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <FaExclamationCircle size={18} />

                    <span className="font-bold">Rejection Reason</span>
                  </div>

                  <p className="text-sm leading-6 text-red-700 dark:text-red-300">
                    {property.rejectionReason}
                  </p>
                </div>
              )}
            </Section>
          </div>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-6">
            {/* OWNER / MANAGER */}

            <Section title="Property Owner / Manager" icon={FaUser}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <FaUser size={23} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 dark:text-white">
                      {owner?.fullName ||
                        property.ownerName ||
                        property.managerName ||
                        "Not available"}
                    </p>

                    <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                      {owner?.role ||
                        property.ownerRole ||
                        property.managementType ||
                        "Property Manager"}
                    </p>
                  </div>
                </div>

                {(owner?.email || property.ownerEmail) && (
                  <InfoItem
                    icon={FaFileAlt}
                    label="Email"
                    value={owner?.email || property.ownerEmail}
                  />
                )}

                {(owner?.phone || property.ownerPhone) && (
                  <InfoItem
                    icon={FaUser}
                    label="Phone"
                    value={owner?.phone || property.ownerPhone}
                  />
                )}
              </div>
            </Section>

            {/* MANAGEMENT */}

            <Section title="Management" icon={FaBuilding}>
              <div className="space-y-3">
                <InfoItem
                  icon={FaBuilding}
                  label="Management Type"
                  value={property.managementType}
                />

                <InfoItem
                  icon={FaUser}
                  label="Owner Role"
                  value={property.ownerRole}
                />

                <InfoItem
                  icon={FaUser}
                  label="Manager ID"
                  value={property.agentId || property.ownerId}
                />
              </div>
            </Section>

            {/* PROPERTY RECORD */}

            <Section title="Property Record" icon={FaFileAlt}>
              <div className="space-y-3">
                <InfoItem
                  icon={FaFileAlt}
                  label="Property ID"
                  value={property.id}
                />

                <InfoItem
                  icon={FaCalendarAlt}
                  label="Created"
                  value={formatDate(property.createdAt)}
                />

                <InfoItem
                  icon={FaCalendarAlt}
                  label="Last Updated"
                  value={formatDate(property.updatedAt)}
                />
              </div>
            </Section>
          </aside>
        </div>
      </div>

      {/* =================================================
          REJECT MODAL
      ================================================= */}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <FaTimesCircle size={23} />
                </div>

                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Reject Property
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Provide a clear reason for rejecting this property.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Ownership document is invalid or property information is incomplete..."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading && (
                  <FaSpinner size={17} className="animate-spin" />
                )}
                Reject Property
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default PropertyDetails;
