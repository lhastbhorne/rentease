import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaClipboardList,
  FaEnvelope,
  FaPlusCircle,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const firstName =
    user?.fullName?.split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    "Agent";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, {firstName} 👋
            </h1>

            <p className="mt-2 text-slate-500">
              Manage properties, landlords, tenants and rental applications.
            </p>
          </div>

          {/* Add Property */}
          <Link
            to="/agent/add-property"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FaPlusCircle />
            Add Property
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          {/* Properties */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Managed Properties
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  0
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FaBuilding />
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Applications
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  0
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <FaClipboardList />
              </div>
            </div>
          </div>

          {/* Clients */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Clients
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  0
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <FaUsers />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Messages
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  0
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <FaEnvelope />
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <h2 className="mb-5 text-xl font-bold text-slate-800">
            Quick Actions
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* Add Property */}
            <Link
              to="/agent/add-property"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaPlusCircle className="text-2xl text-blue-600" />

              <h2 className="mt-4 text-xl font-bold text-slate-800">
                Add Property
              </h2>

              <p className="mt-2 text-slate-500">
                List a property on behalf of a landlord.
              </p>
            </Link>

            {/* Properties */}
            <Link
              to="/agent/properties"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaBuilding className="text-2xl text-blue-600" />

              <h2 className="mt-4 text-xl font-bold text-slate-800">
                Managed Properties
              </h2>

              <p className="mt-2 text-slate-500">
                View and manage your listed properties.
              </p>
            </Link>

            {/* Clients */}
            <Link
              to="/agent/clients"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaUsers className="text-2xl text-purple-600" />

              <h2 className="mt-4 text-xl font-bold text-slate-800">
                Clients
              </h2>

              <p className="mt-2 text-slate-500">
                View landlords and tenants you manage.
              </p>
            </Link>

            {/* Applications */}
            <Link
              to="/agent/applications"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <FaClipboardList className="text-2xl text-green-600" />

              <h2 className="mt-4 text-xl font-bold text-slate-800">
                Applications
              </h2>

              <p className="mt-2 text-slate-500">
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