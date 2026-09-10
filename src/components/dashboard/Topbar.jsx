import { FaBars, FaBell, FaSearch, FaSun, FaMoon } from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

import UserMenu from "./UserMenu";

import { useNavigate } from "react-router-dom";

function Topbar({ setSidebarOpen }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      {/* Left */}

      <div className="flex items-center gap-4">
        {/* Mobile Sidebar */}

        <button
          type="button"
          className="text-slate-700 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaBars size={22} />
        </button>

        {/* Search */}

        <div className="relative hidden md:block">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-72 rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right */}

      <div className="flex items-center gap-5">
        {/* Notification */}

        <button
          type="button"
          onClick={() => navigate(notificationPath)}
          className="relative text-xl text-slate-700 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
          title="Notifications"
          aria-label="Notifications"
        >
          <FaBell />
        </button>

        {/* Theme Toggle */}

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-all duration-300 hover:bg-slate-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <FaSun size={17} /> : <FaMoon size={17} />}
        </button>

        {/* User */}

        <UserMenu />
      </div>
    </header>
  );
}

export default Topbar;
