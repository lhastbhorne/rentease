import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  FaHeart,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaTrash,
  FaArrowRight,
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
  const [removingId, setRemovingId] = useState(null);

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

  // ==========================================
  // REMOVE SAVED PROPERTY
  // ==========================================

  async function handleRemove(propertyId) {
    const confirmed = window.confirm(
      "Remove this property from your saved properties?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingId(propertyId);

      await removeSavedProperty(user.uid, propertyId);

      setProperties((prev) =>
        prev.filter((property) => property.propertyId !== propertyId),
      );
    } catch (error) {
      console.error("Error removing property:", error);

      alert("Failed to remove property.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* ==========================================
            HEADER
        ========================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{
                scale: 0.8,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                duration: 0.35,
                delay: 0.1,
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500 dark:bg-red-950/40 dark:text-red-400"
            >
              <FaHeart />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Saved Properties
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                Properties you saved for later.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading saved properties...
            </p>
          </motion.div>
        )}

        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {!loading && properties.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12"
          >
            <motion.div
              initial={{
                scale: 0.8,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                duration: 0.4,
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30"
            >
              <FaHeart size={36} className="text-red-300 dark:text-red-500" />
            </motion.div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              No Saved Properties
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              You haven't saved any properties yet. Browse available properties
              and save the ones you like.
            </p>

            <motion.div
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <Link
                to="/properties"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Browse Properties
                <FaArrowRight className="text-xs" />
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ==========================================
            PROPERTIES
        ========================================== */}

        {!loading && properties.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {properties.map((property) => (
              <motion.div
                key={property.id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={{
                  y: -5,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {/* ==========================================
                    IMAGE
                ========================================== */}

                <div className="relative overflow-hidden">
                  <img
                    src={
                      property.images?.length
                        ? property.images[0]
                        : "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={property.title || "Property"}
                    className="h-56 w-full object-cover transition duration-500 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=No+Image";
                    }}
                  />

                  {/* Image Overlay */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />

                  {/* Remove Button */}

                  <motion.button
                    type="button"
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.92,
                    }}
                    onClick={() => handleRemove(property.propertyId)}
                    disabled={removingId === property.propertyId}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-red-500 shadow-lg transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/50"
                    title="Remove saved property"
                  >
                    {removingId === property.propertyId ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                    ) : (
                      <FaTrash className="text-sm" />
                    )}
                  </motion.button>

                  {/* Saved Badge */}

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-500 shadow-sm backdrop-blur dark:bg-slate-900/95 dark:text-red-400">
                    <FaHeart />
                    Saved
                  </div>
                </div>

                {/* ==========================================
                    CONTENT
                ========================================== */}

                <div className="p-5">
                  <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                    {property.title || "Untitled Property"}
                  </h2>

                  {/* Location */}

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <FaMapMarkerAlt className="shrink-0 text-red-400 dark:text-red-500" />

                    <span className="truncate">
                      {property.city || "Location unavailable"}

                      {property.state ? `, ${property.state}` : ""}
                    </span>
                  </p>

                  {/* Price */}

                  <p className="mt-4 text-xl font-bold text-blue-600 dark:text-blue-400">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>

                  {/* Property Stats */}

                  <div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <FaBed className="text-slate-400 dark:text-slate-500" />

                      <span>{property.bedrooms || 0}</span>

                      <span className="hidden sm:inline">Beds</span>
                    </span>

                    <span className="flex items-center gap-2">
                      <FaBath className="text-slate-400 dark:text-slate-500" />

                      <span>{property.bathrooms || 0}</span>

                      <span className="hidden sm:inline">Baths</span>
                    </span>
                  </div>

                  {/* View Property */}

                  <motion.div
                    whileHover={{
                      scale: 1.01,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    <Link
                      to={`/properties/${property.propertyId}`}
                      className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      View Property
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SavedProperties;
