import { motion } from "framer-motion";
import PropertyCard from "./PropertyCard";

function PropertyGrid({ properties = [], tenantView = false }) {
  if (properties.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-50 py-16 transition-colors duration-300 dark:bg-slate-950"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              No Properties Found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
              There are currently no rental properties available.
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <section className="bg-slate-50 py-8 transition-colors duration-300 dark:bg-slate-950 md:py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Available Properties
            </h2>

            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Browse our collection of rental properties.
            </p>
          </div>

          {/* Property Count */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors duration-300 dark:bg-blue-500/10 dark:text-blue-400"
          >
            {properties.length}{" "}
            {properties.length === 1 ? "Property" : "Properties"} Found
          </motion.span>
        </motion.div>

        {/* Property Cards */}
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
          className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
        >
          {properties.map((property) => (
            <motion.div
              key={property.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.45,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <PropertyCard property={property} tenantView={tenantView} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default PropertyGrid;
