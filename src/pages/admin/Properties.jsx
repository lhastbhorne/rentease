import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaCheck,
  FaClock,
  FaTimes,
  FaEye,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getAllAdminProperties } from "../../firebase/adminService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function loadProperties() {
    try {
      setLoading(true);

      const data = await getAllAdminProperties();

      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error(
        "Error loading admin properties:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredProperties(properties);
      return;
    }

    if (
      filter === "pending" ||
      filter === "approved" ||
      filter === "rejected"
    ) {
      setFilteredProperties(
        properties.filter(
          (property) =>
            property.approvalStatus === filter
        )
      );

      return;
    }

    if (
      filter === "available" ||
      filter === "occupied"
    ) {
      setFilteredProperties(
        properties.filter(
          (property) =>
            property.status === filter
        )
      );
    }
  }, [filter, properties]);

  function formatDate(timestamp) {
    if (!timestamp) {
      return "N/A";
    }

    if (
      typeof timestamp.toDate === "function"
    ) {
      return timestamp
        .toDate()
        .toLocaleDateString();
    }

    return "N/A";
  }

  function getApprovalBadge(status) {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <FaCheck />
            Approved
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <FaTimes />
            Rejected
          </span>
        );

      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            <FaClock />
            Pending
          </span>
        );
    }
  }

  function getStatusBadge(status) {
    if (status === "occupied") {
      return (
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          Occupied
        </span>
      );
    }

    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        Available
      </span>
    );
  }

  const total = properties.length;

  const pending = properties.filter(
    (property) =>
      property.approvalStatus === "pending"
  ).length;

  const approved = properties.filter(
    (property) =>
      property.approvalStatus === "approved"
  ).length;

  const rejected = properties.filter(
    (property) =>
      property.approvalStatus === "rejected"
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Property Management
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor all properties registered on
            RentEase.
          </p>
        </div>

        {/* Statistics */}

        <div className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Properties
            </p>

            <div className="mt-2 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800">
                {total}
              </h2>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FaBuilding />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Verification
            </p>

            <div className="mt-2 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800">
                {pending}
              </h2>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                <FaClock />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Approved
            </p>

            <div className="mt-2 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800">
                {approved}
              </h2>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <FaCheck />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Rejected
            </p>

            <div className="mt-2 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800">
                {rejected}
              </h2>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <FaTimes />
              </div>
            </div>
          </div>

        </div>

        {/* Filter */}

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                All Properties
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredProperties.length} properties
                displayed
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-600"
            >
              <option value="all">
                All Properties
              </option>

              <option value="pending">
                Pending Verification
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="available">
                Available
              </option>

              <option value="occupied">
                Occupied
              </option>
            </select>

          </div>

        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">
              Loading properties...
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          filteredProperties.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <FaBuilding className="mx-auto text-5xl text-slate-300" />

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No Properties Found
              </h2>

              <p className="mt-2 text-slate-500">
                There are no properties matching
                this filter.
              </p>

            </div>
          )}

        {/* Property List */}

        {!loading &&
          filteredProperties.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {filteredProperties.map(
                (property) => (
                  <div
                    key={property.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                  >

                    {/* Image */}

                    <div className="relative">

                      <img
                        src={
                          property.images?.[0] ||
                          "https://placehold.co/600x400?text=No+Image"
                        }
                        alt={
                          property.title ||
                          "Property"
                        }
                        className="h-56 w-full object-cover"
                      />

                      <div className="absolute right-3 top-3">
                        {getApprovalBadge(
                          property.approvalStatus
                        )}
                      </div>

                    </div>

                    {/* Content */}

                    <div className="p-5">

                      <h3 className="truncate text-xl font-bold text-slate-800">
                        {property.title ||
                          "Untitled Property"}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {property.city ||
                          "Unknown location"}

                        {property.state
                          ? `, ${property.state}`
                          : ""}
                      </p>

                      <p className="mt-4 text-xl font-bold text-blue-600">
                        ₦
                        {Number(
                          property.price || 0
                        ).toLocaleString()}
                      </p>

                      <div className="mt-4 flex items-center justify-between">

                        <span className="text-sm text-slate-500">
                          {property.bedrooms ||
                            0}{" "}
                          beds
                        </span>

                        <span className="text-sm text-slate-500">
                          {property.bathrooms ||
                            0}{" "}
                          baths
                        </span>

                        {getStatusBadge(
                          property.status
                        )}

                      </div>

                      <div className="mt-5 border-t pt-4">

                        <div className="flex justify-between text-xs text-slate-400">

                          <span>
                            Submitted:
                          </span>

                          <span>
                            {formatDate(
                              property.createdAt
                            )}
                          </span>

                        </div>

                        <div className="mt-2 flex justify-between text-xs text-slate-400">

                          <span>
                            Managed by:
                          </span>

                          <span className="capitalize">
                            {property.submittedByRole ||
                              property.role ||
                              "Landlord"}
                          </span>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "Property details page will be connected next."
                          )
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        <FaEye />
                        View Property
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

      </div>
    </DashboardLayout>
  );
}

export default Properties;