import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaFileContract,
  FaHome,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUser,
} from "react-icons/fa";

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
        month: "long",
        year: "numeric",
      });
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Not specified";
    }

    return parsed.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Not specified";
  }
};

const formatStatus = (value) => {
  if (!value) return "Not specified";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getPaymentStatus = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "successful" || normalized === "paid") {
    return {
      label: "Paid",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    };
  }

  if (normalized === "pending" || normalized === "awaiting_payment") {
    return {
      label: "Payment Pending",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    };
  }

  return {
    label: formatStatus(status),
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
};

function TenancyDetails({
  tenancy,
  onBack,
  onTerminate,
  showTerminateButton = true,
}) {
  if (!tenancy) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <FaHome className="mx-auto mb-4 text-4xl text-slate-300 dark:text-slate-600" />

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Tenancy not found
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The tenancy information could not be found.
        </p>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <FaArrowLeft />
            Go Back
          </button>
        )}
      </div>
    );
  }

  const payment = getPaymentStatus(tenancy.paymentStatus);

  const location = [
    tenancy.propertyAreaName,
    tenancy.propertyCity,
    tenancy.propertyState,
  ]
    .filter(Boolean)
    .join(", ");

  const propertyImage =
    tenancy.propertyImage ||
    tenancy.images?.[0] ||
    "https://via.placeholder.com/1200x700?text=Property";

  const isActive = tenancy.status === "active";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 transition-colors dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <FaArrowLeft />
            Back to Tenancies
          </motion.button>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {formatStatus(tenancy.status)}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {tenancy.propertyTitle || "Unnamed Property"}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <FaMapMarkerAlt className="text-indigo-500" />
                {location || "Location not specified"}
              </p>
            </div>

            {showTerminateButton && isActive && onTerminate && (
              <button
                type="button"
                onClick={onTerminate}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Terminate Tenancy
              </button>
            )}
          </div>
        </motion.div>

        {/* Property */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <img
            src={propertyImage}
            alt={tenancy.propertyTitle || "Property"}
            className="h-64 w-full object-cover sm:h-80"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/1200x700?text=Property";
            }}
          />

          <div className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FaHome />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Property Information
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Details of the rented property
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Property" value={tenancy.propertyTitle} />

              <DetailItem
                label="Area / Neighborhood"
                value={tenancy.propertyAreaName}
              />

              <DetailItem label="City" value={tenancy.propertyCity} />

              <DetailItem label="State" value={tenancy.propertyState} />

              <DetailItem
                label="Exact Address"
                value={tenancy.propertyAddress}
              />

              <DetailItem label="Property ID" value={tenancy.propertyId} />
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Private tenancy information
              </p>

              <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                The exact property address is available here because this is an
                internal landlord/agent tenancy management page.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tenant + Manager */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tenant */}
          <motion.section
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <SectionHeading
              icon={<FaUser />}
              title="Tenant Information"
              subtitle="Current tenant details"
            />

            <div className="space-y-4">
              <DetailItem label="Full Name" value={tenancy.tenantName} />

              <DetailItem label="Email" value={tenancy.tenantEmail} />

              <DetailItem label="Phone" value={tenancy.tenantPhone} />

              <DetailItem label="Tenant ID" value={tenancy.tenantId} />
            </div>
          </motion.section>

          {/* Manager */}
          <motion.section
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <SectionHeading
              icon={<FaUser />}
              title="Management Information"
              subtitle="Property management details"
            />

            <div className="space-y-4">
              <DetailItem label="Manager" value={tenancy.managerName} />

              <DetailItem
                label="Manager Role"
                value={formatStatus(tenancy.managerRole)}
              />

              <DetailItem label="Manager ID" value={tenancy.managerId} />

              <DetailItem label="Owner ID" value={tenancy.ownerId} />
            </div>
          </motion.section>
        </div>

        {/* Financial */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <SectionHeading
            icon={<FaMoneyBillWave />}
            title="Rental & Payment Information"
            subtitle="Financial details for this tenancy"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Rent Amount"
              value={formatMoney(tenancy.rentAmount)}
              highlight
            />

            <DetailItem
              label="Rent Frequency"
              value={formatStatus(tenancy.rentFrequency)}
            />

            <DetailItem
              label="Payment Status"
              value={payment.label}
              badgeClass={payment.className}
            />

            <DetailItem label="Currency" value={tenancy.currency || "NGN"} />

            <DetailItem
              label="Payment Reference"
              value={tenancy.paymentReference}
            />

            <DetailItem
              label="Next Rent Due"
              value={formatDate(tenancy.nextRentDueDate)}
            />
          </div>
        </motion.section>

        {/* Contract */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <SectionHeading
            icon={<FaFileContract />}
            title="Tenancy & Contract"
            subtitle="Current rental agreement information"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Lease Duration" value={tenancy.leaseDuration} />

            <DetailItem
              label="Move-in Date"
              value={formatDate(tenancy.moveInDate)}
            />

            <DetailItem
              label="Contract Start"
              value={formatDate(tenancy.contractStartDate)}
            />

            <DetailItem
              label="Contract End"
              value={formatDate(tenancy.contractEndDate)}
            />
          </div>
        </motion.section>

        {/* Status Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <SectionHeading
            icon={<FaCheckCircle />}
            title="Tenancy Status"
            subtitle="Current tenancy lifecycle information"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Tenancy Status"
              value={formatStatus(tenancy.status)}
            />

            <DetailItem
              label="Termination Status"
              value={formatStatus(tenancy.terminationStatus)}
            />

            <DetailItem
              label="Handover Status"
              value={formatStatus(tenancy.handoverStatus)}
            />

            <DetailItem
              label="Refund Status"
              value={formatStatus(tenancy.refundStatus)}
            />
          </div>
        </motion.section>

        {/* Termination Foundation */}
        {(tenancy.terminationStatus &&
          tenancy.terminationStatus !== "not_requested") ||
        tenancy.terminationReason ||
        tenancy.terminationEffectiveDate ? (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-500/20 dark:bg-slate-900 sm:p-6"
          >
            <h2 className="font-bold text-slate-900 dark:text-white">
              Termination Information
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Termination Status"
                value={formatStatus(tenancy.terminationStatus)}
              />

              <DetailItem label="Reason" value={tenancy.terminationReason} />

              <DetailItem
                label="Requested By"
                value={formatStatus(tenancy.terminationRequestedBy)}
              />

              <DetailItem
                label="Requested At"
                value={formatDate(tenancy.terminationRequestedAt)}
              />

              <DetailItem
                label="Effective Date"
                value={formatDate(tenancy.terminationEffectiveDate)}
              />

              <DetailItem
                label="Completed At"
                value={formatDate(tenancy.terminationCompletedAt)}
              />
            </div>
          </motion.section>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-900 dark:text-white">{title}</h2>

        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight = false, badgeClass = "" }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      {badgeClass ? (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {value || "Not specified"}
        </span>
      ) : (
        <p
          className={`break-words text-sm ${
            highlight
              ? "text-lg font-bold text-indigo-600 dark:text-indigo-400"
              : "font-semibold text-slate-900 dark:text-white"
          }`}
        >
          {value || "Not specified"}
        </p>
      )}
    </div>
  );
}

export default TenancyDetails;
