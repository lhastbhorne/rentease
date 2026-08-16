import { useEffect, useState } from "react";
import {
  FaUsers,
  FaBuilding,
  FaClipboardCheck,
  FaHome,
  FaClock,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getAllUsers,
  getAllAdminProperties,
} from "../../firebase/adminService";

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    tenants: 0,
    landlords: 0,
    agents: 0,
    properties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    occupiedProperties: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [users, properties] =
          await Promise.all([
            getAllUsers(),
            getAllAdminProperties(),
          ]);

        const tenants = users.filter(
          (item) => item.role === "tenant",
        ).length;

        const landlords = users.filter(
          (item) => item.role === "landlord",
        ).length;

        const agents = users.filter(
          (item) => item.role === "agent",
        ).length;

        const pendingProperties =
          properties.filter(
            (item) =>
              item.approvalStatus ===
              "pending",
          ).length;

        const approvedProperties =
          properties.filter(
            (item) =>
              item.approvalStatus ===
              "approved",
          ).length;

        const occupiedProperties =
          properties.filter(
            (item) =>
              item.status === "occupied",
          ).length;

        setStats({
          users: users.length,
          tenants,
          landlords,
          agents,
          properties: properties.length,
          pendingProperties,
          approvedProperties,
          occupiedProperties,
        });
      } catch (error) {
        console.error(
          "Error loading admin dashboard:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: <FaUsers />,
      bg: "bg-blue-100",
      text: "text-blue-600",
    },

    {
      title: "Total Properties",
      value: stats.properties,
      icon: <FaBuilding />,
      bg: "bg-purple-100",
      text: "text-purple-600",
    },

    {
      title: "Pending Verification",
      value: stats.pendingProperties,
      icon: <FaClipboardCheck />,
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },

    {
      title: "Occupied Properties",
      value: stats.occupiedProperties,
      icon: <FaHome />,
      bg: "bg-green-100",
      text: "text-green-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Welcome back,{" "}
            {user?.fullName ||
              user?.displayName ||
              "Administrator"}
            . Manage the RentEase platform
            from here.
          </p>
        </div>

        {/* Main Statistics */}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {loading
                      ? "..."
                      : card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.text}`}
                >
                  {card.icon}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* User Breakdown */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-800">
              User Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Breakdown of registered platform users.
            </p>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-medium text-slate-700">
                  Tenants
                </span>

                <span className="font-bold text-blue-600">
                  {loading
                    ? "..."
                    : stats.tenants}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-medium text-slate-700">
                  Landlords
                </span>

                <span className="font-bold text-purple-600">
                  {loading
                    ? "..."
                    : stats.landlords}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-medium text-slate-700">
                  Agents
                </span>

                <span className="font-bold text-green-600">
                  {loading
                    ? "..."
                    : stats.agents}
                </span>
              </div>

            </div>
          </div>

          {/* Property Overview */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-800">
              Property Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current property verification and
              occupancy status.
            </p>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between rounded-xl bg-yellow-50 p-4">
                <div className="flex items-center gap-3">
                  <FaClock className="text-yellow-600" />

                  <span className="font-medium text-slate-700">
                    Awaiting Verification
                  </span>
                </div>

                <span className="font-bold text-yellow-600">
                  {loading
                    ? "..."
                    : stats.pendingProperties}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <FaClipboardCheck className="text-green-600" />

                  <span className="font-medium text-slate-700">
                    Approved
                  </span>
                </div>

                <span className="font-bold text-green-600">
                  {loading
                    ? "..."
                    : stats.approvedProperties}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <FaHome className="text-blue-600" />

                  <span className="font-medium text-slate-700">
                    Occupied
                  </span>
                </div>

                <span className="font-bold text-blue-600">
                  {loading
                    ? "..."
                    : stats.occupiedProperties}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Admin Actions */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-800">
            Administration
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage the most important parts of the
            RentEase platform.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <a
              href="/admin/users"
              className="rounded-xl border p-5 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <FaUsers className="text-2xl text-blue-600" />

              <h3 className="mt-3 font-bold text-slate-800">
                Manage Users
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View registered tenants, landlords
                and agents.
              </p>
            </a>

            <a
              href="/admin/properties"
              className="rounded-xl border p-5 transition hover:border-purple-300 hover:bg-purple-50"
            >
              <FaBuilding className="text-2xl text-purple-600" />

              <h3 className="mt-3 font-bold text-slate-800">
                Manage Properties
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View and manage all properties.
              </p>
            </a>

            <a
              href="/admin/verification"
              className="rounded-xl border p-5 transition hover:border-green-300 hover:bg-green-50"
            >
              <FaClipboardCheck className="text-2xl text-green-600" />

              <h3 className="mt-3 font-bold text-slate-800">
                Property Verification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review pending property submissions.
              </p>
            </a>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;