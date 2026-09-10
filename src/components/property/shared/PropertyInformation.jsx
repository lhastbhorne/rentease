import { motion } from "framer-motion";
import {
  FaBed,
  FaBath,
  FaToilet,
  FaCar,
  FaRulerCombined,
  FaHome,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";

function PropertyInformation({ property }) {
  // =====================================================
  // RENT FREQUENCY
  // =====================================================

  function getRentFrequencyLabel(frequency) {
    switch (frequency) {
      case "monthly":
        return "month";

      case "annual":
        return "annum";

      case "quarterly":
        return "quarter";

      case "half_yearly":
        return "6 months";

      default:
        return "";
    }
  }

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  function formatPrice(price) {
    const numericPrice = Number(price);

    if (!numericPrice || Number.isNaN(numericPrice)) {
      return "N/A";
    }

    return `₦${numericPrice.toLocaleString("en-NG")}`;
  }

  const rentFrequency = getRentFrequencyLabel(property.rentFrequency);

  return (
    <section className="bg-slate-50 py-10 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* =================================================
              PROPERTY DESCRIPTION
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-8 lg:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FaHome />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 transition-colors duration-300 dark:text-white sm:text-3xl">
                Property Description
              </h2>
            </div>

            <p className="mt-5 leading-7 text-slate-600 transition-colors duration-300 dark:text-slate-300">
              {property.description ||
                "No description available for this property."}
            </p>
          </motion.div>

          {/* =================================================
              PROPERTY DETAILS
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
              Property Details
            </h2>

            <div className="mt-5">
              {/* Rental Price */}

              <DetailRow
                icon={FaMoneyBillWave}
                label="Rental Price"
                value={
                  rentFrequency ? (
                    <span>
                      {formatPrice(property.price)}
                      <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        / {rentFrequency}
                      </span>
                    </span>
                  ) : (
                    formatPrice(property.price)
                  )
                }
                highlight
              />

              {/* Property Type */}

              <DetailRow
                icon={FaHome}
                label="Property Type"
                value={property.type || "N/A"}
              />

              {/* Status */}

              <DetailRow
                label="Status"
                value={property.status || "Available"}
              />

              {/* Bedrooms */}

              <DetailRow
                icon={FaBed}
                label="Bedrooms"
                value={property.bedrooms ?? 0}
              />

              {/* Toilets */}

              <DetailRow
                icon={FaToilet}
                label="Toilets"
                value={property.toilets ?? 0}
              />

              {/* Bathrooms */}

              <DetailRow
                icon={FaBath}
                label="Bathrooms"
                value={property.bathrooms ?? 0}
              />

              {/* Area */}

              <DetailRow
                icon={FaRulerCombined}
                label="Area"
                value={
                  property.area
                    ? `${Number(property.area).toLocaleString("en-NG")} sqft`
                    : "N/A"
                }
              />

              {/* Parking */}

              <DetailRow
                icon={FaCar}
                label="Parking"
                value={property.parking ?? 0}
              />

              {/* Furnished */}

              <DetailRow
                icon={FaChair}
                label="Furnished"
                value={property.furnished || "N/A"}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({ icon: Icon, label, value, highlight = false }) {
  return (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0 dark:border-slate-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Icon />
          </span>
        )}

        <span className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          {label}
        </span>
      </div>

      <span
        className={`text-right font-semibold ${
          highlight
            ? "text-lg text-blue-600 dark:text-blue-400"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </span>
    </motion.div>
  );
}

export default PropertyInformation;
