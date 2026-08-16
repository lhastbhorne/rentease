import { NavLink } from "react-router-dom";
import {
  FaTimes,
  FaTachometerAlt,
  FaHome,
  FaPlusCircle,
  FaBuilding,
  FaUsers,
  FaFileAlt,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaHeart,
  FaClipboardList,
  FaKey,
  FaMoneyBillWave,
  FaBell,
} from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();

  const role = user?.role || "tenant";

  const menus = {
    tenant: [
      {
        name: "Dashboard",
        icon: <FaTachometerAlt />,
        path: "/tenant/dashboard",
      },

      {
        name: "Browse Properties",
        icon: <FaHome />,
        path: "/tenant/properties",
      },

      {
        name: "Saved Properties",
        icon: <FaHeart />,
        path: "/tenant/saved",
      },

      {
        name: "Applications",
        icon: <FaClipboardList />,
        path: "/tenant/applications",
      },

      {
        name: "My Tenancy",
        icon: <FaHome />,
        path: "/tenant/tenancy",
      },

      {
        name: "My Rental",
        icon: <FaKey />,
        path: "/tenant/my-rental",
      },

      {
        name: "Rent Payments",
        icon: <FaMoneyBillWave />,
        path: "/tenant/payments",
      },

      {
        name: "Complaints",
        icon: <FaClipboardList />,
        path: "/tenant/complaints",
      },

      {
        name: "Notifications",
        icon: <FaBell />,
        path: "/tenant/notifications",
      },

      {
        name: "Messages",
        icon: <FaEnvelope />,
        path: "/tenant/messages",
      },

      {
        name: "Settings",
        icon: <FaCog />,
        path: "/tenant/settings",
      },
    ],

    landlord: [
      {
        name: "Dashboard",
        icon: <FaTachometerAlt />,
        path: "/landlord/dashboard",
      },
      {
        name: "My Properties",
        icon: <FaBuilding />,
        path: "/landlord/my-properties",
      },
      {
        name: "Add Property",
        icon: <FaPlusCircle />,
        path: "/landlord/add-property",
      },
      {
        name: "Applications",
        icon: <FaClipboardList />,
        path: "/landlord/applications",
      },
      {
        name: "Notifications",
        icon: <FaBell />,
        path: "/landlord/notifications",
      },
      { name: "Messages", icon: <FaEnvelope />, path: "/landlord/messages" },
      { name: "Settings", icon: <FaCog />, path: "/landlord/settings" },
    ],

    agent: [
      {
        name: "Dashboard",
        icon: <FaTachometerAlt />,
        path: "/agent/dashboard",
      },

      {
        name: "Managed Properties",
        icon: <FaBuilding />,
        path: "/agent/properties",
      },

      {
        name: "Add Property",
        icon: <FaPlusCircle />,
        path: "/agent/add-property",
      },

      {
        name: "Applications",
        icon: <FaClipboardList />,
        path: "/agent/applications",
      },

      {
        name: "Clients",
        icon: <FaUsers />,
        path: "/agent/clients",
      },

      {
        name: "Notifications",
        icon: <FaBell />,
        path: "/agent/notifications",
      },

      {
        name: "Messages",
        icon: <FaEnvelope />,
        path: "/agent/messages",
      },

      {
        name: "Settings",
        icon: <FaCog />,
        path: "/agent/settings",
      },
    ],

    admin: [
      {
        name: "Dashboard",
        icon: <FaTachometerAlt />,
        path: "/admin/dashboard",
      },

      {
        name: "Users",
        icon: <FaUsers />,
        path: "/admin/users",
      },

      {
        name: "Properties",
        icon: <FaBuilding />,
        path: "/admin/properties",
      },

      {
        name: "Verification",
        icon: <FaFileAlt />,
        path: "/admin/verification",
      },
      {
        name: "Complaints",
        icon: <FaClipboardList />,
        path: "/admin/complaints",
      },

        {
        name: "Notifications",
        icon: <FaBell />,
        path: "/admin/notifications",
      },

      {
        name: "Settings",
        icon: <FaCog />,
        path: "/admin/settings",
      },
    ],
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-72 bg-white shadow-lg transition-transform duration-300
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-600">RentEase</h1>

          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <FaTimes size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 px-4 space-y-2">
          {menus[role]?.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={async () => {
              try {
                await logout();
              } catch (error) {
                console.error("Logout failed:", error);
              }
            }}
            className="mt-8 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
