import { useEffect, useMemo, useState } from "react";
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

      setError(
        error.message ||
          "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.fullName
          ?.toLowerCase()
          .includes(searchValue) ||
        user.displayName
          ?.toLowerCase()
          .includes(searchValue) ||
        user.email
          ?.toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [users, search, roleFilter]);

  // =====================================================
  // ROLE
  // =====================================================

  function getRoleInfo(role) {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          className:
            "bg-red-100 text-red-700",
          icon: <FaUserShield />,
        };

      case "landlord":
        return {
          label: "Landlord",
          className:
            "bg-purple-100 text-purple-700",
          icon: <FaHome />,
        };

      case "agent":
        return {
          label: "Agent",
          className:
            "bg-blue-100 text-blue-700",
          icon: <FaUserTie />,
        };

      case "tenant":
        return {
          label: "Tenant",
          className:
            "bg-green-100 text-green-700",
          icon: <FaUser />,
        };

      default:
        return {
          label: "User",
          className:
            "bg-slate-100 text-slate-700",
          icon: <FaUser />,
        };
    }
  }

  // =====================================================
  // USER NAME
  // =====================================================

  function getUserName(user) {
    return (
      user.fullName ||
      user.displayName ||
      user.name ||
      "Unnamed User"
    );
  }

  // =====================================================
  // COUNTS
  // =====================================================

  const tenantCount = users.filter(
    (user) => user.role === "tenant",
  ).length;

  const landlordCount = users.filter(
    (user) => user.role === "landlord",
  ).length;

  const agentCount = users.filter(
    (user) => user.role === "agent",
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "admin",
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FaUsers className="text-xl" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Users
                </h1>

                <p className="mt-1 text-slate-500">
                  View and manage RentEase users.
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <FaSync
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {users.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FaUsers />
              </div>

            </div>
          </div>

          {/* TENANTS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Tenants
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {tenantCount}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <FaUser />
              </div>

            </div>
          </div>

          {/* LANDLORDS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Landlords
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {landlordCount}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <FaHome />
              </div>

            </div>
          </div>

          {/* AGENTS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Agents
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {agentCount}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <FaUserTie />
              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">

            {/* SEARCH */}

            <div className="relative">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* ROLE */}

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value,
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="all">
                All Users
              </option>

              <option value="tenant">
                Tenants
              </option>

              <option value="landlord">
                Landlords
              </option>

              <option value="agent">
                Agents
              </option>

              <option value="admin">
                Admins
              </option>
            </select>

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">
              Loading users...
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredUsers.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FaUsers className="text-2xl text-slate-400" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No Users Found
              </h2>

              <p className="mt-2 text-slate-500">
                Try changing your search or
                role filter.
              </p>

            </div>
          )}

        {/* =================================================
            USERS TABLE
        ================================================= */}

        {!loading &&
          filteredUsers.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px]">

                  <thead>
                    <tr className="border-b bg-slate-50 text-left">

                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        User
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        Email
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        Role
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        User ID
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredUsers.map(
                      (user) => {
                        const role =
                          getRoleInfo(
                            user.role,
                          );

                        return (
                          <tr
                            key={
                              user.id
                            }
                            className="border-b last:border-b-0 hover:bg-slate-50"
                          >

                            {/* USER */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                  <FaUser />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {getUserName(
                                      user,
                                    )}
                                  </p>
                                </div>

                              </div>

                            </td>

                            {/* EMAIL */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-2 text-slate-600">

                                <FaEnvelope className="text-slate-400" />

                                <span>
                                  {user.email ||
                                    "No email"}
                                </span>

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

                              <span className="font-mono text-xs text-slate-400">
                                {user.id}
                              </span>

                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>

                </table>

              </div>

              {/* FOOTER */}

              <div className="border-t bg-slate-50 px-6 py-4">

                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredUsers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {users.length}
                  </span>{" "}
                  users
                </p>

              </div>

            </div>
          )}

      </div>
    </DashboardLayout>
  );
}

export default Users;