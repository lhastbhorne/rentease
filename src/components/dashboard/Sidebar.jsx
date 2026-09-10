import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
  FaSearch,
  FaKey,
  FaMoneyBillWave,
  FaBell,
  FaHeadset,
  FaUser,
  FaFlag,
  FaClipboardList,
} from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();

  const location = useLocation();

  const navRef = useRef(null);

  const role = user?.role?.toLowerCase() || "tenant";

  // =====================================================
  // MENUS
  // =====================================================

  const menus = {
    tenant: [
      {
        section: "Overview",
        items: [
          {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            path: "/tenant/dashboard",
          },
        ],
      },

      {
        section: "Properties",
        items: [
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
        ],
      },

      {
        section: "Renting",
        items: [
          {
            name: "Applications",
            icon: <FaFileAlt />,
            path: "/tenant/applications",
          },
          {
            name: "Inspections",
            icon: <FaSearch />,
            path: "/tenant/inspections",
          },
          {
            name: "My Tenancy",
            icon: <FaKey />,
            path: "/tenant/tenancy",
          },
          {
            name: "My Rental",
            icon: <FaHome />,
            path: "/tenant/my-rental",
          },
          {
            name: "Rent Payments",
            icon: <FaMoneyBillWave />,
            path: "/tenant/payments",
          },
        ],
      },

      {
        section: "Communication",
        items: [
          {
            name: "Messages",
            icon: <FaEnvelope />,
            path: "/tenant/messages",
          },
          {
            name: "Notifications",
            icon: <FaBell />,
            path: "/tenant/notifications",
          },
        ],
      },

      {
        section: "Support",
        items: [
          {
            name: "Complaints",
            icon: <FaFlag />,
            path: "/tenant/complaints",
          },
          {
            name: "Admin Support",
            icon: <FaHeadset />,
            path: "/tenant/support",
          },
        ],
      },

      {
        section: "Account",
        items: [
          {
            name: "Profile",
            icon: <FaUser />,
            path: "/tenant/profile",
          },
          {
            name: "Settings",
            icon: <FaCog />,
            path: "/tenant/settings",
          },
        ],
      },
    ],

    landlord: [
      {
        section: "Overview",
        items: [
          {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            path: "/landlord/dashboard",
          },
        ],
      },

      {
        section: "Properties",
        items: [
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
        ],
      },

      {
        section: "Management",
        items: [
          {
            name: "Applications",
            icon: <FaFileAlt />,
            path: "/landlord/applications",
          },
          {
            name: "Inspections",
            icon: <FaSearch />,
            path: "/landlord/inspections",
          },
          {
            name: "Tenancies",
            icon: <FaKey />,
            path: "/landlord/tenancies",
          },
          {
            name: "Payments",
            icon: <FaMoneyBillWave />,
            path: "/landlord/payments",
          },
        ],
      },

      {
        section: "Communication",
        items: [
          {
            name: "Notifications",
            icon: <FaBell />,
            path: "/landlord/notifications",
          },
        ],
      },

      {
        section: "Support",
        items: [
          {
            name: "Admin Support",
            icon: <FaHeadset />,
            path: "/landlord/support",
          },
        ],
      },

      {
        section: "Account",
        items: [
          {
            name: "Profile",
            icon: <FaUser />,
            path: "/landlord/profile",
          },
          {
            name: "Settings",
            icon: <FaCog />,
            path: "/landlord/settings",
          },
        ],
      },
    ],

    agent: [
      {
        section: "Overview",
        items: [
          {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            path: "/agent/dashboard",
          },
        ],
      },

      {
        section: "Properties",
        items: [
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
        ],
      },

      {
        section: "Management",
        items: [
          {
            name: "Applications",
            icon: <FaFileAlt />,
            path: "/agent/applications",
          },
          {
            name: "Inspections",
            icon: <FaSearch />,
            path: "/agent/inspections",
          },
          {
            name: "Clients",
            icon: <FaUsers />,
            path: "/agent/clients",
          },
          {
            name: "Payments",
            icon: <FaMoneyBillWave />,
            path: "/agent/payments",
          },
        ],
      },

      {
        section: "Communication",
        items: [
          {
            name: "Notifications",
            icon: <FaBell />,
            path: "/agent/notifications",
          },
        ],
      },

      {
        section: "Support",
        items: [
          {
            name: "Admin Support",
            icon: <FaHeadset />,
            path: "/agent/support",
          },
        ],
      },

      {
        section: "Account",
        items: [
          {
            name: "Profile",
            icon: <FaUser />,
            path: "/agent/profile",
          },
          {
            name: "Settings",
            icon: <FaCog />,
            path: "/agent/settings",
          },
        ],
      },
    ],

    admin: [
      {
        section: "Overview",
        items: [
          {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            path: "/admin/dashboard",
          },
        ],
      },

      {
        section: "Management",
        items: [
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
            name: "Earnings",
            icon: <FaMoneyBillWave />,
            path: "/admin/earnings",
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
            name: "Reports",
            icon: <FaFlag />,
            path: "/admin/reports",
          },
        ],
      },

      {
        section: "Communication",
        items: [
          {
            name: "Notifications",
            icon: <FaBell />,
            path: "/admin/notifications",
          },
        ],
      },

      {
        section: "Account",
        items: [
          {
            name: "Profile",
            icon: <FaUser />,
            path: "/admin/profile",
          },
          {
            name: "Settings",
            icon: <FaCog />,
            path: "/admin/settings",
          },
        ],
      },
    ],
  };

  const roleMenu = menus[role] || menus.tenant;

  // =====================================================
  // RESTORE SIDEBAR SCROLL POSITION
  // =====================================================

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(
      `rentease-sidebar-scroll-${role}`,
    );

    if (!navRef.current || savedPosition === null) {
      return;
    }

    requestAnimationFrame(() => {
      if (navRef.current) {
        navRef.current.scrollTop = Number(savedPosition);
      }
    });
  }, [location.pathname, role]);

  // =====================================================
  // SAVE SIDEBAR SCROLL POSITION
  // =====================================================

  function saveScrollPosition() {
    if (!navRef.current) {
      return;
    }

    sessionStorage.setItem(
      `rentease-sidebar-scroll-${role}`,
      navRef.current.scrollTop.toString(),
    );
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  function handleNavigation() {
    saveScrollPosition();

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    try {
      await logout();

      sessionStorage.removeItem(`rentease-sidebar-scroll-${role}`);

      setSidebarOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <>
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-72 flex-col
          border-r border-slate-200
          bg-white shadow-lg
          transition-colors duration-300
          dark:border-slate-800
          dark:bg-slate-950
          dark:shadow-black/20
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* HEADER */}

        <div
          className="
            flex shrink-0 items-center justify-between
            border-b border-slate-200
            bg-white px-6 py-5
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-950
          "
        >
          <div>
            <h1 className="text-2xl font-bold text-blue-600">RentEase</h1>

            <p className="mt-1 text-xs capitalize text-slate-400 dark:text-slate-500">
              {role} Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="
              rounded-lg p-2
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-700
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-slate-200
              lg:hidden
            "
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* SCROLLABLE MENU */}

        <nav
          ref={navRef}
          onScroll={saveScrollPosition}
          className="
            min-h-0 flex-1
            overflow-y-auto
            px-4 py-6
            scrollbar-thin
            scrollbar-thumb-slate-300
            dark:scrollbar-thumb-slate-700
          "
        >
          <div className="space-y-6 pb-6">
            {roleMenu.map((section) => (
              <div key={section.section}>
                <p
                  className="
                    mb-2 px-4
                    text-xs font-semibold uppercase tracking-wider
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  {section.section}
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={handleNavigation}
                      className={({ isActive }) =>
                        `
                          flex items-center gap-3
                          rounded-xl px-4 py-3
                          text-sm font-medium
                          transition-colors duration-200

                          ${
                            isActive
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                          }
                        `
                      }
                    >
                      <span className="flex w-5 shrink-0 items-center justify-center text-lg">
                        {item.icon}
                      </span>

                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* LOGOUT */}

        <div
          className="
            shrink-0
            border-t border-slate-200
            bg-white p-4
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-950
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3
              rounded-xl px-4 py-3
              text-sm font-medium
              text-red-600
              transition
              hover:bg-red-50
              dark:text-red-400
              dark:hover:bg-red-950/40
            "
          >
            <FaSignOutAlt />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
