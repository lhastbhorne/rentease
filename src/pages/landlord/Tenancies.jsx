import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBed,
  FaCalendarAlt,
  FaCheckCircle,
  FaEye,
  FaHome,
  FaMoneyBillWave,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getLandlordTenancies } from "../../firebase/tenancyService";
import { useAuth } from "../../contexts/AuthContext";

const formatMoney = (amount) => {
  const value = Number(amount || 0);

  return `₦${value.toLocaleString("en-NG")}`;
};

const formatDate = (date) => {
  if (!date) return "Not specified";

  try {
    if (typeof date?.toDate === "function") {
      return date.toDate().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not specified";
  }
};

const getPaymentStatus = (tenancy) => {
  const status = String(tenancy?.paymentStatus || "").toLowerCase();

  if (status === "successful" || status === "paid") {
    return {
      label: "Paid",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    };
  }

  if (status === "pending" || status === "awaiting_payment") {
    return {
      label: "Payment Pending",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    };
  }

  return {
    label: status
      ? status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      : "Unknown",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  };
};

function Tenancies() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadTenancies = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError("");

        const data = await getLandlordTenancies(user.uid);

        setTenancies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load landlord tenancies:", err);
        setError(
          err?.message || "Unable to load your tenancies. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTenancies();
  }, [user?.uid]);

  const filteredTenancies = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return tenancies.filter((tenancy) => {
      const matchesSearch =
        !searchValue ||
        String(tenancy?.tenantName || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(tenancy?.tenantEmail || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(tenancy?.propertyTitle || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(tenancy?.propertyCity || "")
          .toLowerCase()
          .includes(searchValue);

      const tenancyStatus = String(tenancy?.status || "").toLowerCase();

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && tenancyStatus === "active") ||
        (filter === "expired" && tenancyStatus === "expired") ||
        (filter === "terminated" && tenancyStatus === "terminated");

      return matchesSearch && matchesFilter;
    });
  }, [tenancies, search, filter]);

  const activeTenancies = tenancies.filter(
    (tenancy) => tenancy?.status === "active",
  );

  const totalRent = activeTenancies.reduce(
    (total, tenancy) => total + Number(tenancy?.rentAmount || 0),
    0,
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-6 transition-colors dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Tenancies
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage your rented properties and active tenants.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FaHome />}
              title="Total Tenancies"
              value={tenancies.length}
            />

            <StatCard
              icon={<FaCheckCircle />}
              title="Active Tenants"
              value={activeTenancies.length}
            />

            <StatCard
              icon={<FaBed />}
              title="Occupied Properties"
              value={activeTenancies.length}
            />

            <StatCard
              icon={<FaMoneyBillWave />}
              title="Active Rent"
              value={formatMoney(totalRent)}
            />
          </div>

          {/* Search + Filters */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenant, property or city..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["expired", "Expired"],
                ["terminated", "Terminated"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredTenancies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <FaHome className="mx-auto mb-4 text-4xl text-slate-300 dark:text-slate-600" />

              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                No tenancies found
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {search
                  ? "Try a different search term."
                  : "Your rented properties and tenants will appear here."}
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.06,
                  },
                },
              }}
              className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            >
              {filteredTenancies.map((tenancy) => (
                <TenancyCard
                  key={tenancy.id}
                  tenancy={tenancy}
                  onView={() => navigate(`/landlord/tenancies/${tenancy.id}`)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        {icon}
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </motion.div>
  );
}

function TenancyCard({ tenancy, onView }) {
  const payment = getPaymentStatus(tenancy);

  const propertyImage =
    tenancy?.propertyImage ||
    tenancy?.images?.[0] ||
    "https://via.placeholder.com/800x500?text=Property";

  const location = [
    tenancy?.propertyAreaName,
    tenancy?.propertyCity,
    tenancy?.propertyState,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Property Image */}
      <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={propertyImage}
          alt={tenancy?.propertyTitle || "Property"}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/800x500?text=Property";
          }}
        />

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">
            Active Tenancy
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4">
          <h2 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
            {tenancy?.propertyTitle || "Unnamed Property"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {location || "Location not specified"}
          </p>
        </div>

        {/* Tenant */}
        <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FaUser />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tenant
              </p>

              <p className="truncate font-semibold text-slate-900 dark:text-white">
                {tenancy?.tenantName || "Tenant"}
              </p>

              {tenancy?.tenantEmail && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {tenancy.tenantEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoItem label="Rent" value={formatMoney(tenancy?.rentAmount)} />

          <InfoItem
            label="Payment"
            value={payment.label}
            valueClass={payment.className}
          />

          <InfoItem label="Start" value={formatDate(tenancy?.startDate)} />

          <InfoItem label="End" value={formatDate(tenancy?.endDate)} />
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FaCalendarAlt />
            <span>
              {tenancy?.rentFrequency
                ? String(tenancy.rentFrequency)
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())
                : "Rental"}
            </span>
          </div>

          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FaEye />
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ label, value, valueClass = "" }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p
        className={`mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white ${
          valueClass ? `inline-block rounded-md px-2 py-1 ${valueClass}` : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default Tenancies;
