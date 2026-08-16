import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";
import { logoutUser } from "../../firebase/services";

function UserMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-slate-100"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="hidden text-left md:block">
          <p className="font-semibold">{user?.fullName || "User"}</p>

          <p className="text-sm capitalize text-slate-500">{user?.role}</p>
        </div>

        <FaChevronDown className="text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-xl border bg-white shadow-xl">
          <button
            onClick={() => navigate("/profile")}
            className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-100"
          >
            <FaUser />
            Profile
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-100"
          >
            <FaCog />
            Settings
          </button>

          <hr />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
