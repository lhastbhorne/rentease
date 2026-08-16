import {
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaClipboardCheck,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome back, {user?.fullName?.split(" ")[0]} 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Here's an overview of your properties and rental business.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Properties"
          value="8"
          icon={<FaBuilding />}
          color="bg-blue-600"
        />

        <StatCard
          title="Occupied Units"
          value="6"
          icon={<FaUsers />}
          color="bg-green-600"
        />

        <StatCard
          title="Monthly Revenue"
          value="₦2,450,000"
          icon={<FaMoneyBillWave />}
          color="bg-yellow-500"
        />

        <StatCard
          title="Pending Applications"
          value="4"
          icon={<FaClipboardCheck />}
          color="bg-purple-600"
        />
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Property Summary */}
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Property Summary</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">3 Bedroom Duplex</h3>
                <p className="text-sm text-slate-500">Lekki, Lagos</p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                Occupied
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Self Contained Apartment</h3>

                <p className="text-sm text-slate-500">Akure, Ondo</p>
              </div>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
                Vacant
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>

          <div className="space-y-3">
            <button className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">
              <Link to="/landlord/add-property">Add Property</Link>
            </button>

            <button className="w-full rounded-lg border py-3 hover:bg-slate-50">
              View Applications
            </button>

            <button className="w-full rounded-lg border py-3 hover:bg-slate-50">
              Upload Documents
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
