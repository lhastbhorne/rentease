import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";
import { logoutUser } from "../../firebase/services";

function UserMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  // ==========================================
  // ROLE-BASED ROUTES
  // ==========================================

  const role = user?.role?.toLowerCase();

  const profileRoutes = {
    tenant: "/tenant/profile",
    landlord: "/landlord/profile",
    agent: "/agent/profile",
    admin: "/admin/profile",
  };

  const settingsRoutes = {
    tenant: "/tenant/settings",
    landlord: "/landlord/settings",
    agent: "/agent/settings",
    admin: "/admin/settings",
  };

  const profilePath = profileRoutes[role] || "/profile";
  const settingsPath = settingsRoutes[role] || "/settings";

  // ==========================================
  // CLOSE MENU
  // ==========================================

  function closeMenu() {
    setOpen(false);
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    try {
      await logoutUser();

      setOpen(false);

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <div className="relative">
      {/* User Button */}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {/* Avatar */}

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>

        {/* User Information */}

        <div className="hidden text-left md:block">
          <p className="font-semibold text-slate-800 dark:text-white">
            {user?.fullName || "User"}
          </p>

          <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
            {user?.role || "User"}
          </p>
        </div>

        {/* Arrow */}

        <FaChevronDown
          className={`text-slate-500 transition-transform dark:text-slate-400 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}

      {open && (
        <>
          {/* Outside Click Layer */}

          <div className="fixed inset-0 z-40" onClick={closeMenu} />

          {/* Menu */}

          <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
            {/* User Information */}

            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="truncate font-semibold text-slate-800 dark:text-white">
                {user?.fullName || "User"}
              </p>

              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {user?.email || ""}
              </p>
            </div>

            {/* Profile */}

            <button
              type="button"
              onClick={() => {
                navigate(profilePath);
                closeMenu();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FaUser className="text-slate-500 dark:text-slate-400" />

              <span>Profile</span>
            </button>

            {/* Settings */}

            <button
              type="button"
              onClick={() => {
                navigate(settingsPath);
                closeMenu();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FaCog className="text-slate-500 dark:text-slate-400" />

              <span>Settings</span>
            </button>

            {/* Divider */}

            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <FaSignOutAlt />

              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserMenu;
