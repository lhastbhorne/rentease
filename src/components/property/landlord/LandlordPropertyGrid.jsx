import { motion } from "framer-motion";
import LandlordPropertyCard from "./LandlordPropertyCard";

function LandlordPropertyGrid({ properties, onDelete }) {
  if (!properties || properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            No Properties Found
          </h2>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            You haven't uploaded any properties yet.
          </p>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Click{" "}
            <strong className="text-slate-700 dark:text-slate-200">
              Add Property
            </strong>{" "}
            to create your first listing.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {properties.map((property) => (
        <motion.div
          key={property.id}
          variants={{
            hidden: {
              opacity: 0,
              y: 20,
            },
            visible: {
              opacity: 1,
              y: 0,
            },
          }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
          whileHover={{
            y: -4,
          }}
        >
          <LandlordPropertyCard property={property} onDelete={onDelete} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default LandlordPropertyGrid;
