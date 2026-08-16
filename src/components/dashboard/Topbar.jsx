import {
  FaBars,
  FaBell,
  FaSearch,
} from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";

import UserMenu from "./UserMenu";

import { useNavigate } from "react-router-dom";

function Topbar({ setSidebarOpen }) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const notificationPath =
    user?.role === "admin"
      ? "/admin/notifications"
      : user?.role === "landlord"
        ? "/landlord/notifications"
        : user?.role === "agent"
          ? "/agent/notifications"
          : "/tenant/notifications";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-white px-6 shadow-sm">

      {/* Left */}

      <div className="flex items-center gap-4">

        <button
          type="button"
          className="lg:hidden"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          <FaBars size={22} />
        </button>

        <div className="relative hidden md:block">

          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-72 rounded-lg border border-slate-300 py-2 pl-10 pr-4 outline-none focus:border-blue-500"
          />

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-6">

        {/* Notification */}

        <button
          type="button"
          onClick={() =>
            navigate(notificationPath)
          }
          className="relative text-xl text-slate-800 transition hover:text-blue-600"
          title="Notifications"
        >
          <FaBell />
        </button>

        {/* User */}

        <UserMenu />

      </div>

    </header>
  );
}

export default Topbar;