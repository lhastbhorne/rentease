import { motion } from "framer-motion";
import SavePropertyButton from "../../common/InfoRow";

function PropertyDetailsHero({ property }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900 py-20 text-white transition-colors duration-300 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Status */}
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-blue-600/20"
        >
          {property.status}
        </motion.span>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-4xl font-bold tracking-tight md:text-5xl"
        >
          {property.title}
        </motion.h1>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-lg text-slate-300 dark:text-slate-400"
        >
          📍 {property.location}
        </motion.p>

        {/* Property Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-8"
        >
          {/* Bedrooms */}
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-slate-400">Bedrooms</p>
            <p className="text-xl font-bold text-white">{property.bedrooms}</p>
          </motion.div>

          {/* Bathrooms */}
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-slate-400">Bathrooms</p>
            <p className="text-xl font-bold text-white">{property.bathrooms}</p>
          </motion.div>

          {/* Area */}
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-slate-400">Area</p>
            <p className="text-xl font-bold text-white">{property.area}</p>
          </motion.div>
        </motion.div>

        {/* Price + Save */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10"
        >
          <motion.h2
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="text-4xl font-bold text-blue-400"
          >
            {property.price}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.5 }}
            className="mt-6"
          >
            <SavePropertyButton />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default PropertyDetailsHero;
