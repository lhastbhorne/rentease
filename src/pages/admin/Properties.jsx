import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { FaBuilding, FaCheck, FaClock, FaTimes, FaEye } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getAllAdminProperties } from "../../firebase/adminService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // ==========================================
  // LOAD PROPERTIES
  // ==========================================

  async function loadProperties() {
    try {
      setLoading(true);

      const data = await getAllAdminProperties();

      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error("Error loading admin properties:", error);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadProperties();
  }, []);

  // ==========================================
  // FILTER PROPERTIES
  // ==========================================

  useEffect(() => {
    if (filter === "all") {
      setFilteredProperties(properties);
      return;
    }

    if (
      filter === "pending" ||
      filter === "approved" ||
      filter === "rejected"
    ) {
      setFilteredProperties(
        properties.filter((property) => property.approvalStatus === filter),
      );

      return;
    }

    if (filter === "available" || filter === "occupied") {
      setFilteredProperties(
        properties.filter((property) => property.status === filter),
      );
    }
  }, [filter, properties]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(timestamp) {
    if (!timestamp) {
      return "N/A";
    }

    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }

    return "N/A";
  }

  // ==========================================
  // APPROVAL BADGE
  // ==========================================

  function getApprovalBadge(status) {
    switch (status) {
      case "approved":
        return (
          <motion.span
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              inline-flex items-center gap-1
              rounded-full
              bg-green-100
              px-3 py-1
              text-xs font-semibold
              text-green-700
              dark:bg-green-950/50
              dark:text-green-400
            "
          >
            <FaCheck />
            Approved
          </motion.span>
        );

      case "rejected":
        return (
          <motion.span
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              inline-flex items-center gap-1
              rounded-full
              bg-red-100
              px-3 py-1
              text-xs font-semibold
              text-red-700
              dark:bg-red-950/50
              dark:text-red-400
            "
          >
            <FaTimes />
            Rejected
          </motion.span>
        );

      case "pending":
      default:
        return (
          <motion.span
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              inline-flex items-center gap-1
              rounded-full
              bg-yellow-100
              px-3 py-1
              text-xs font-semibold
              text-yellow-700
              dark:bg-yellow-950/50
              dark:text-yellow-400
            "
          >
            <FaClock />
            Pending
          </motion.span>
        );
    }
  }

  // ==========================================
  // PROPERTY STATUS BADGE
  // ==========================================

  function getStatusBadge(status) {
    if (status === "occupied") {
      return (
        <motion.span
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            rounded-full
            bg-orange-100
            px-3 py-1
            text-xs font-semibold
            text-orange-700
            dark:bg-orange-950/50
            dark:text-orange-400
          "
        >
          Occupied
        </motion.span>
      );
    }

    return (
      <motion.span
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="
          rounded-full
          bg-blue-100
          px-3 py-1
          text-xs font-semibold
          text-blue-700
          dark:bg-blue-950/50
          dark:text-blue-400
        "
      >
        Available
      </motion.span>
    );
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  const total = properties.length;

  const pending = properties.filter(
    (property) => property.approvalStatus === "pending",
  ).length;

  const approved = properties.filter(
    (property) => property.approvalStatus === "approved",
  ).length;

  const rejected = properties.filter(
    (property) => property.approvalStatus === "rejected",
  ).length;

  // ==========================================
  // STAT CARD
  // ==========================================

  function StatCard({ label, value, icon, iconClass, delay = 0 }) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay,
        }}
        whileHover={{
          y: -5,
        }}
        className="
          rounded-2xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
          transition-colors duration-300
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>

        <div className="mt-2 flex items-center justify-between">
          <motion.h2
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
              delay: delay + 0.1,
            }}
            className="
              text-3xl font-bold
              text-slate-800
              dark:text-white
            "
          >
            {value}
          </motion.h2>

          <motion.div
            whileHover={{
              rotate: 8,
              scale: 1.08,
            }}
            transition={{
              duration: 0.2,
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.4,
        }}
      >
        {/* ======================================
            HEADER
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Property Management
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Monitor all properties registered on RentEase.
          </p>
        </motion.div>

        {/* ======================================
            STATISTICS
        ====================================== */}

        <div className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Properties"
            value={total}
            icon={<FaBuilding />}
            iconClass="
              bg-blue-100
              text-blue-600
              dark:bg-blue-950/50
              dark:text-blue-400
            "
            delay={0}
          />

          <StatCard
            label="Pending Verification"
            value={pending}
            icon={<FaClock />}
            iconClass="
              bg-yellow-100
              text-yellow-600
              dark:bg-yellow-950/50
              dark:text-yellow-400
            "
            delay={0.08}
          />

          <StatCard
            label="Approved"
            value={approved}
            icon={<FaCheck />}
            iconClass="
              bg-green-100
              text-green-600
              dark:bg-green-950/50
              dark:text-green-400
            "
            delay={0.16}
          />

          <StatCard
            label="Rejected"
            value={rejected}
            icon={<FaTimes />}
            iconClass="
              bg-red-100
              text-red-600
              dark:bg-red-950/50
              dark:text-red-400
            "
            delay={0.24}
          />
        </div>

        {/* ======================================
            FILTER
        ====================================== */}

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
            duration: 0.45,
            delay: 0.25,
          }}
          className="
            mb-6
            rounded-2xl
            border border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                All Properties
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {filteredProperties.length} properties displayed
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                rounded-lg
                border border-slate-300
                bg-white
                px-4 py-2
                text-slate-700
                outline-none
                transition-colors
                focus:border-blue-600
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-200
                dark:focus:border-blue-400
              "
            >
              <option value="all">All Properties</option>

              <option value="pending">Pending Verification</option>

              <option value="approved">Approved</option>

              <option value="rejected">Rejected</option>

              <option value="available">Available</option>

              <option value="occupied">Occupied</option>
            </select>
          </div>
        </motion.div>

        {/* ======================================
            LOADING
        ====================================== */}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
              }}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-12
                text-center
                shadow-sm
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  mx-auto h-10 w-10
                  rounded-full
                  border-4
                  border-slate-200
                  border-t-blue-600
                  dark:border-slate-700
                  dark:border-t-blue-400
                "
              />

              <p className="mt-4 text-slate-500 dark:text-slate-400">
                Loading properties...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================
            EMPTY STATE
        ====================================== */}

        <AnimatePresence mode="wait">
          {!loading && filteredProperties.length === 0 && (
            <motion.div
              key="empty"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              transition={{
                duration: 0.4,
              }}
              className="
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  p-12
                  text-center
                  shadow-sm
                  dark:border-slate-800
                  dark:bg-slate-900
                "
            >
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 15,
                }}
              >
                <FaBuilding
                  className="
                    mx-auto text-5xl
                    text-slate-300
                    dark:text-slate-700
                  "
                />
              </motion.div>

              <h2
                className="
                  mt-5 text-xl font-bold
                  text-slate-800
                  dark:text-white
                "
              >
                No Properties Found
              </h2>

              <p
                className="
                  mt-2
                  text-slate-500
                  dark:text-slate-400
                "
              >
                There are no properties matching this filter.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================
            PROPERTY LIST
        ====================================== */}

        <AnimatePresence mode="wait">
          {!loading && filteredProperties.length > 0 && (
            <motion.div
              key={`properties-${filter}`}
              initial="hidden"
              animate="visible"
              exit={{
                opacity: 0,
              }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.07,
                  },
                },
              }}
              className="
                  grid gap-6
                  md:grid-cols-2
                  xl:grid-cols-3
                "
            >
              {filteredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 25,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  whileHover={{
                    y: -6,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                        overflow-hidden
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        shadow-sm
                        transition-colors duration-300
                        dark:border-slate-800
                        dark:bg-slate-900
                      "
                >
                  {/* ==================================
                          IMAGE
                      ================================== */}

                  <div className="relative overflow-hidden">
                    <motion.img
                      whileHover={{
                        scale: 1.05,
                      }}
                      transition={{
                        duration: 0.4,
                      }}
                      src={
                        property.images?.[0] ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={property.title || "Property"}
                      className="
                            h-56 w-full
                            object-cover
                          "
                    />

                    <div
                      className="
                          absolute right-3 top-3
                        "
                    >
                      {getApprovalBadge(property.approvalStatus)}
                    </div>
                  </div>

                  {/* ==================================
                          CONTENT
                      ================================== */}

                  <div className="p-5">
                    <h3
                      className="
                          truncate
                          text-xl font-bold
                          text-slate-800
                          dark:text-white
                        "
                    >
                      {property.title || "Untitled Property"}
                    </h3>

                    <p
                      className="
                          mt-2 text-sm
                          text-slate-500
                          dark:text-slate-400
                        "
                    >
                      {property.city || "Unknown location"}

                      {property.state ? `, ${property.state}` : ""}
                    </p>

                    {/* PRICE */}

                    <motion.p
                      whileHover={{
                        x: 3,
                      }}
                      className="
                            mt-4
                            text-xl font-bold
                            text-blue-600
                            dark:text-blue-400
                          "
                    >
                      ₦{Number(property.price || 0).toLocaleString()}
                    </motion.p>

                    {/* PROPERTY INFO */}

                    <div
                      className="
                          mt-4
                          flex items-center
                          justify-between
                          gap-2
                        "
                    >
                      <span
                        className="
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                          "
                      >
                        {property.bedrooms || 0} beds
                      </span>

                      <span
                        className="
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                          "
                      >
                        {property.bathrooms || 0} baths
                      </span>

                      {getStatusBadge(property.status)}
                    </div>

                    {/* META */}

                    <div
                      className="
                          mt-5
                          border-t
                          border-slate-200
                          pt-4
                          dark:border-slate-700
                        "
                    >
                      <div
                        className="
                            flex
                            justify-between
                            text-xs
                            text-slate-400
                            dark:text-slate-500
                          "
                      >
                        <span>Submitted:</span>

                        <span>{formatDate(property.createdAt)}</span>
                      </div>

                      <div
                        className="
                            mt-2
                            flex
                            justify-between
                            text-xs
                            text-slate-400
                            dark:text-slate-500
                          "
                      >
                        <span>Managed by:</span>

                        <span className="capitalize">
                          {property.submittedByRole ||
                            property.role ||
                            "Landlord"}
                        </span>
                      </div>
                    </div>

                    {/* VIEW PROPERTY */}

                    <motion.button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/properties/${property.id}`)
                      }
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      className="
                            mt-5
                            flex w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-blue-600
                            px-4 py-3
                            font-semibold
                            text-blue-600
                            transition-colors
                            hover:bg-blue-50
                            dark:border-blue-400
                            dark:text-blue-400
                            dark:hover:bg-blue-950/40
                          "
                    >
                      <FaEye />
                      View Property
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}

export default Properties;
