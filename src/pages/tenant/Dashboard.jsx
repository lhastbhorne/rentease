import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaHome,
  FaHeart,
  FaClipboardList,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

import { useAuth } from "../../contexts/AuthContext";

import { getSavedProperties } from "../../firebase/savedPropertyService";
import { getAllProperties } from "../../firebase/propertyService";
import { getMyApplications } from "../../firebase/applicationService";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedProperties, setSavedProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.uid) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [savedPropertiesData, applicationsData, availablePropertiesData] =
          await Promise.all([
            getSavedProperties(user.uid),
            getMyApplications(user.uid),
            getAllProperties(),
          ]);

        setSavedProperties(savedPropertiesData);
        setApplications(applicationsData);
        setAvailableProperties(availablePropertiesData);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user?.uid]);

  const recentApplications = applications.slice(0, 3);

  return (
    <DashboardLayout>
      {/* ==========================================
          WELCOME
      ========================================== */}

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Welcome back, {user?.fullName?.split(" ")[0] || "Tenant"} 👋
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Here's a quick overview of your rental activities.
        </p>
      </motion.div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* ==========================================
          STATS
      ========================================== */}

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
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Saved Properties"
          value={loading ? "..." : savedProperties.length}
          icon={<FaHeart />}
          color="bg-red-500"
        />

        <StatCard
          title="Applications"
          value={loading ? "..." : applications.length}
          icon={<FaClipboardList />}
          color="bg-blue-600"
        />

        <StatCard
          title="Messages"
          value="0"
          icon={<FaEnvelope />}
          color="bg-green-600"
        />

        <StatCard
          title="Available Listings"
          value={loading ? "..." : availableProperties.length}
          icon={<FaHome />}
          color="bg-purple-600"
        />
      </motion.div>

      {/* ==========================================
          MAIN GRID
      ========================================== */}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* ==========================================
            RECENT APPLICATIONS
        ========================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.2,
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:col-span-2"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                Recent Applications
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Your latest property applications
              </p>
            </div>

            {applications.length > 0 && (
              <motion.button
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/tenant/applications")}
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span className="hidden sm:inline">View All</span>

                <FaArrowRight className="text-xs" />
              </motion.button>
            )}
          </div>

          {/* Loading */}

          {loading ? (
            <div className="space-y-4">
              <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

              <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

              <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : recentApplications.length === 0 ? (
            /* Empty State */

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <FaClipboardList className="text-2xl text-slate-400 dark:text-slate-500" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
                No applications yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                When you apply for a property, your applications will appear
                here.
              </p>

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => navigate("/tenant/properties")}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Browse Properties
              </motion.button>
            </motion.div>
          ) : (
            /* Applications */

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
              className="space-y-3"
            >
              {recentApplications.map((application) => (
                <motion.div
                  key={application.id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: -10,
                    },
                    visible: {
                      opacity: 1,
                      x: 0,
                    },
                  }}
                  whileHover={{
                    y: -2,
                  }}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 sm:flex">
                      <FaHome />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-800 dark:text-slate-100">
                        {application.propertyTitle || "Property Application"}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {[application.propertyCity, application.propertyState]
                          .filter(Boolean)
                          .join(", ") || "Location unavailable"}
                      </p>
                    </div>
                  </div>

                  <ApplicationStatus status={application.status} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ==========================================
            QUICK ACTIONS
        ========================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.3,
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Quickly access important areas
            </p>
          </div>

          <div className="space-y-3">
            {/* Browse */}

            <QuickAction
              onClick={() => navigate("/tenant/properties")}
              icon={<FaHome />}
              label="Browse Properties"
              primary
            />

            {/* Saved */}

            <QuickAction
              onClick={() => navigate("/tenant/saved")}
              icon={<FaHeart />}
              label="View Saved"
            />

            {/* Messages */}

            <QuickAction
              onClick={() => navigate("/tenant/messages")}
              icon={<FaEnvelope />}
              label="View Messages"
            />
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

// ==========================================
// APPLICATION STATUS
// ==========================================

function ApplicationStatus({ status }) {
  const styles = {
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",

    approved:
      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",

    rejected: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",

    "under review":
      "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  };

  const statusKey = status?.toLowerCase() || "pending";

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold capitalize sm:text-sm ${
        styles[statusKey] ||
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

// ==========================================
// QUICK ACTION
// ==========================================

function QuickAction({ onClick, icon, label, primary = false }) {
  return (
    <motion.button
      type="button"
      whileHover={{
        scale: 1.01,
        x: 2,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
        primary
          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            primary
              ? "bg-white/15"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {icon}
        </span>

        {label}
      </span>

      <FaArrowRight className="text-xs opacity-60" />
    </motion.button>
  );
}

export default Dashboard;
