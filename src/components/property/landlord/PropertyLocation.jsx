import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";

function PropertyLocation({ city = "", state = "" }) {
  const location = [city, state].filter(Boolean).join(", ");

  return (
    <section className="bg-white py-12 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FaMapMarkerAlt className="text-xl" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Property Location
              </h2>

              <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">
                {location || "Location not provided"}
              </p>
            </div>
          </div>

          {/* Location Area */}

          <div className="mt-8 flex min-h-[280px] items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800">
            <div className="max-w-md px-6 text-center">
              <FaMapMarkerAlt className="mx-auto text-5xl text-blue-600 dark:text-blue-400" />

              <h3 className="mt-5 text-xl font-semibold text-slate-800 dark:text-white">
                {location || "Property Location"}
              </h3>

              <p className="mt-2 leading-6 text-slate-500 dark:text-slate-400">
                This property is located in the area shown above.
              </p>
            </div>
          </div>

          {/* Privacy Notice */}

          <div className="mt-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <FaShieldAlt className="mt-1 shrink-0 text-blue-600 dark:text-blue-400" />

            <p className="text-sm leading-6 text-blue-700 dark:text-blue-300">
              For your safety, the exact property address is kept private. Full
              location details can be provided through the RentEase platform
              when necessary.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PropertyLocation;
