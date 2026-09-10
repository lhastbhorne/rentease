import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBuilding, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import LandlordPropertyGrid from "../../components/property/landlord/LandlordPropertyGrid";

import {
  getMyProperties,
  deleteProperty,
} from "../../firebase/propertyService";

import { useAuth } from "../../contexts/AuthContext";

function MyProperties() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PROPERTIES
  // =====================================================

  useEffect(() => {
    async function loadProperties() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError("");

        const data = await getMyProperties(user.uid);

        setProperties(data);
      } catch (error) {
        console.error("Error loading properties:", error);

        setError("Unable to load your properties. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProperties();
    }
  }, [user]);

  // =====================================================
  // DELETE PROPERTY
  // =====================================================

  async function handleDelete(propertyId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?\n\nThis action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProperty(propertyId);

      setProperties((prev) =>
        prev.filter((property) => property.id !== propertyId),
      );
    } catch (error) {
      console.error("Error deleting property:", error);

      setError("Failed to delete property. Please try again.");
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="text-center"
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading your properties...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>
      <motion.div
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
        className="mx-auto max-w-7xl"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: -15,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:flex">
                <FaBuilding />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  My Properties
                </h1>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                  Manage your uploaded properties.
                </p>
              </div>
            </div>

            {/* ADD PROPERTY */}

            <motion.button
              type="button"
              onClick={() => navigate("/landlord/add-property")}
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              <FaPlus />
              Add Property
            </motion.button>
          </div>
        </motion.div>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <FaExclamationTriangle className="mt-0.5 shrink-0" />

              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            PROPERTY COUNT
        ================================================= */}

        {properties.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
            }}
            className="mb-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
          >
            <FaBuilding className="text-blue-600 dark:text-blue-400" />

            <span>
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} in your
              portfolio
            </span>
          </motion.div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {properties.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-12"
          >
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 180,
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            >
              <FaBuilding size={26} />
            </motion.div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              No Properties Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              You haven't uploaded any properties yet. Add your first property
              to start building your rental portfolio.
            </p>

            <motion.button
              type="button"
              onClick={() => navigate("/landlord/add-property")}
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FaPlus />
              Add Your First Property
            </motion.button>
          </motion.div>
        ) : (
          /* =================================================
             PROPERTY GRID
          ================================================= */

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
          >
            <LandlordPropertyGrid
              properties={properties}
              onDelete={handleDelete}
            />
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default MyProperties;
