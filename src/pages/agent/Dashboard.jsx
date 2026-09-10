import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBuilding,
  FaUsers,
  FaClipboardList,
  FaEnvelope,
  FaPlusCircle,
  FaCheckCircle,
  FaHome,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getAgentProperties } from "../../firebase/propertyService";
import { getAgentApplications } from "../../firebase/applicationService";
import { getAgentTenancies } from "../../firebase/tenancyService";

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    properties: 0,
    applications: 0,
    activeTenants: 0,
    occupiedProperties: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName =
    user?.fullName?.split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    "Agent";

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [properties, applications, tenancies] = await Promise.all([
          getAgentProperties(user.uid),
          getAgentApplications(user.uid),
          getAgentTenancies(user.uid),
        ]);

        const agentProperties = Array.isArray(properties) ? properties : [];

        const agentApplications = Array.isArray(applications)
          ? applications
          : [];

        const agentTenancies = Array.isArray(tenancies) ? tenancies : [];

        const activeTenancies = agentTenancies.filter(
          (tenancy) =>
            tenancy?.status === "active" &&
            (tenancy?.paymentStatus === "successful" ||
              tenancy?.paymentStatus === "paid"),
        );

        const occupiedProperties = agentProperties.filter(
          (property) => property?.status === "occupied",
        );

        setStats({
          properties: agentProperties.length,
          applications: agentApplications.length,
          activeTenants: activeTenancies.length,
          occupiedProperties: occupiedProperties.length,
        });
      } catch (err) {
        console.error("Error loading agent dashboard:", err);
        setError("Unable to load dashboard information.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user?.uid]);

  const statCards = [
    {
      title: "Managed Properties",
      value: stats.properties,
      icon: FaBuilding,
      iconStyle:
        "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Applications",
      value: stats.applications,
      icon: FaClipboardList,
      iconStyle:
        "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400",
    },
    {
      title: "Active Tenants",
      value: stats.activeTenants,
      icon: FaUsers,
      iconStyle:
        "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      title: "Occupied Properties",
      value: stats.occupiedProperties,
      icon: FaHome,
      iconStyle:
        "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Welcome back, {firstName} 👋
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage your properties, tenants and rental applications.
            </p>
          </div>

          <Link
            to="/agent/add-property"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FaPlusCircle />
            Add Property
          </Link>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {card.title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                      {loading ? "..." : card.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconStyle}`}
                  >
                    <Icon />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dashboard Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Rental Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                A quick overview of your current rental activity.
              </p>
            </div>

            <FaCheckCircle className="text-2xl text-green-500" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Properties
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? "..." : stats.properties}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Occupied
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? "..." : stats.occupiedProperties}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Active Tenants
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? "..." : stats.activeTenants}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-5 text-xl font-bold text-slate-800 dark:text-white">
            Quick Actions
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Add Property */}
            <Link
              to="/agent/add-property"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-900"
            >
              <FaPlusCircle className="text-2xl text-blue-600 dark:text-blue-400" />

              <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                Add Property
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Add a property you manage to RentEase.
              </p>
            </Link>

            {/* Properties */}
            <Link
              to="/agent/properties"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-900"
            >
              <FaBuilding className="text-2xl text-blue-600 dark:text-blue-400" />

              <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                My Properties
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                View and manage your listed properties.
              </p>
            </Link>

            {/* Tenants */}
            <Link
              to="/agent/tenants"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-900"
            >
              <FaUsers className="text-2xl text-purple-600 dark:text-purple-400" />

              <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                Tenants
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                View tenants currently renting your properties.
              </p>
            </Link>

            {/* Applications */}
            <Link
              to="/agent/applications"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-900"
            >
              <FaClipboardList className="text-2xl text-green-600 dark:text-green-400" />

              <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                Applications
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Review and manage rental applications.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
