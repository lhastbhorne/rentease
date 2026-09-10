import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaUsers,
  FaSearch,
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaUserTie,
  FaHome,
  FaSync,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getAllUsers } from "../../firebase/adminService";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // =====================================================
  // LOAD USERS
  // =====================================================

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUsers();

      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);

      setError(error.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // PLATFORM USERS
  // =====================================================

  const platformUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.role === "tenant" ||
        user.role === "landlord" ||
        user.role === "agent",
    );
  }, [users]);

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return platformUsers.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.fullName?.toLowerCase().includes(searchValue) ||
        user.displayName?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [platformUsers, search, roleFilter]);

  // =====================================================
  // ROLE
  // =====================================================

  function getRoleInfo(role) {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          className:
            "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
          icon: <FaUserShield />,
        };

      case "landlord":
        return {
          label: "Landlord",
          className:
            "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
          icon: <FaHome />,
        };

      case "agent":
        return {
          label: "Agent",
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
          icon: <FaUserTie />,
        };

      case "tenant":
        return {
          label: "Tenant",
          className:
            "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
          icon: <FaUser />,
        };

      default:
        return {
          label: "User",
          className:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          icon: <FaUser />,
        };
    }
  }

  // =====================================================
  // USER NAME
  // =====================================================

  function getUserName(user) {
    return user.fullName || user.displayName || user.name || "Unnamed User";
  }

  // =====================================================
  // COUNTS
  // =====================================================

  const tenantCount = users.filter((user) => user.role === "tenant").length;

  const landlordCount = users.filter((user) => user.role === "landlord").length;

  const agentCount = users.filter((user) => user.role === "agent").length;

  const totalUserCount = tenantCount + landlordCount + agentCount;

  // =====================================================
  // ANIMATION VARIANTS
  // =====================================================

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <DashboardLayout>
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"
        >
          <div>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-xl
                  bg-blue-100 text-blue-600
                  dark:bg-blue-950/50 dark:text-blue-400
                "
              >
                <FaUsers className="text-xl" />
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Users
                </h1>

                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  View and manage RentEase users.
                </p>
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              flex items-center justify-center gap-2
              rounded-xl
              border border-slate-300
              bg-white
              px-5 py-3
              font-semibold text-slate-700
              transition-colors
              hover:bg-slate-50
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </motion.div>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="
                mb-6 rounded-xl
                border border-red-200
                bg-red-50
                p-4 text-red-700
                dark:border-red-900/50
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <motion.div
          variants={containerVariants}
          className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* TOTAL */}

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-6
              shadow-sm
              transition-colors
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {totalUserCount}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <FaUsers />
              </div>
            </div>
          </motion.div>

          {/* TENANTS */}

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-6
              shadow-sm
              transition-colors
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tenants
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {tenantCount}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                <FaUser />
              </div>
            </div>
          </motion.div>

          {/* LANDLORDS */}

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-6
              shadow-sm
              transition-colors
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Landlords
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {landlordCount}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <FaHome />
              </div>
            </div>
          </motion.div>

          {/* AGENTS */}

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-6
              shadow-sm
              transition-colors
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Agents
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {agentCount}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                <FaUserTie />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="
            mb-6 rounded-2xl
            border border-slate-200
            bg-white
            p-5 shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            {/* SEARCH */}

            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="
                  w-full rounded-xl
                  border border-slate-300
                  bg-white
                  py-3 pl-11 pr-4
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  dark:placeholder:text-slate-500
                  dark:focus:ring-blue-950
                "
              />
            </div>

            {/* ROLE */}

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="
                rounded-xl
                border border-slate-300
                bg-white
                px-4 py-3
                text-slate-900
                outline-none
                focus:border-blue-500
                dark:border-slate-700
                dark:bg-slate-950
                dark:text-white
              "
            >
              <option value="all">All Users</option>
              <option value="tenant">Tenants</option>
              <option value="landlord">Landlords</option>
              <option value="agent">Agents</option>
            </select>
          </div>
        </motion.div>

        {/* =================================================
            LOADING
        ================================================= */}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-12
                text-center
                shadow-sm
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

              <p className="text-slate-500 dark:text-slate-400">
                Loading users...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            EMPTY
        ================================================= */}

        <AnimatePresence mode="wait">
          {!loading && filteredUsers.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-12
                text-center
                shadow-sm
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <FaUsers className="text-2xl text-slate-400 dark:text-slate-500" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
                No Users Found
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Try changing your search or role filter.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            USERS TABLE
        ================================================= */}

        {!loading && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-sm
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-800/60">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      User
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Role
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      User ID
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => {
                    const role = getRoleInfo(user.role);

                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.04,
                        }}
                        className="
                          border-b
                          border-slate-100
                          last:border-b-0
                          hover:bg-slate-50
                          dark:border-slate-800
                          dark:hover:bg-slate-800/50
                        "
                      >
                        {/* USER */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              <FaUser />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white">
                                {getUserName(user)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <FaEnvelope className="text-slate-400 dark:text-slate-500" />

                            <span>{user.email || "No email"}</span>
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${role.className}`}
                          >
                            {role.icon}
                            {role.label}
                          </span>
                        </td>

                        {/* ID */}

                        <td className="px-6 py-5">
                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                            {user.id}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {platformUsers.length}
                </span>{" "}
                users
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default Users;
