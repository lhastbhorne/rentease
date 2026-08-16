import { useNavigate } from "react-router-dom";
import { FaHome, FaHeart, FaClipboardList, FaEnvelope } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../contexts/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome back, {user?.fullName?.split(" ")[0]} 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Here's a quick overview of your rental activities.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Saved Properties"
          value="12"
          icon={<FaHeart />}
          color="bg-red-500"
          change="+2 this week"
        />

        <StatCard
          title="Applications"
          value="5"
          icon={<FaClipboardList />}
          color="bg-blue-600"
        />

        <StatCard
          title="Messages"
          value="8"
          icon={<FaEnvelope />}
          color="bg-green-600"
        />

        <StatCard
          title="Available Listings"
          value="145"
          icon={<FaHome />}
          color="bg-purple-600"
        />
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Applications */}
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Recent Applications</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">2 Bedroom Apartment</h3>
                <p className="text-sm text-slate-500">Lekki, Lagos</p>
              </div>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Self Contained Apartment</h3>
                <p className="text-sm text-slate-500">Ikeja, Lagos</p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                Approved
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/tenant/properties")}
              className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
            >
              Browse Properties
            </button>

            <button
              type="button"
              onClick={() => navigate("/tenant/saved")}
              className="w-full rounded-lg border py-3 hover:bg-slate-50"
            >
              View Saved
            </button>

            <button
              type="button"
              onClick={() => navigate("/tenant/messages")}
              className="w-full rounded-lg border py-3 hover:bg-slate-50"
            >
              View Messages
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
