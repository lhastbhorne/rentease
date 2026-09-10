import { motion } from "framer-motion";
import {
  FaTint,
  FaBolt,
  FaCar,
  FaShieldAlt,
  FaSnowflake,
  FaHome,
  FaSwimmingPool,
  FaWifi,
  FaCheckCircle,
} from "react-icons/fa";

function Amenities({ amenities = [] }) {
  if (!Array.isArray(amenities) || amenities.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 md:p-8"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Property Amenities
      </h2>

      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Features and facilities available on this property.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {amenities.map((amenity, index) => (
          <AmenityCard key={`${amenity}-${index}`} name={amenity} />
        ))}
      </div>
    </motion.section>
  );
}

// ==========================================
// AMENITY CARD
// ==========================================

function AmenityCard({ name }) {
  const iconMap = {
    "Running Water": FaTint,
    Borehole: FaTint,
    "Public Water": FaTint,

    "Prepaid Meter": FaBolt,
    "24/7 Electricity": FaBolt,
    Generator: FaBolt,
    "Solar Power": FaBolt,

    "Air Conditioning": FaSnowflake,

    "Parking Space": FaCar,

    Security: FaShieldAlt,
    CCTV: FaShieldAlt,
    "Fenced Compound": FaShieldAlt,
    Gate: FaShieldAlt,

    "Swimming Pool": FaSwimmingPool,

    "POP Ceiling": FaHome,
    Wardrobe: FaHome,
    "Kitchen Cabinets": FaHome,
    "Tiled Floor": FaHome,
    Balcony: FaHome,
    "Dining Area": FaHome,
    "Store Room": FaHome,
    "Laundry Area": FaHome,
    "Servant Quarter": FaHome,
    "Water Heater": FaTint,

    Gym: FaHome,
  };

  const Icon = iconMap[name] || FaCheckCircle;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 transition dark:bg-slate-800"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/40">
        <Icon className="text-blue-600 dark:text-blue-400" />
      </div>

      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {name}
      </span>
    </motion.div>
  );
}

export default Amenities;
