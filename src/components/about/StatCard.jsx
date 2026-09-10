import { motion } from "framer-motion";

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group h-full"
    >
      <div className="flex h-full flex-col items-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:border-blue-200 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.25 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white"
        >
          <Icon />
        </motion.div>

        {/* Number */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-bold text-blue-600 dark:text-blue-400"
        >
          {stat.number}
        </motion.h3>

        {/* Title */}
        <p className="mt-4 text-lg font-medium text-slate-700 transition-colors duration-300 dark:text-slate-300">
          {stat.title}
        </p>

        {/* Accent */}
        <div className="mt-6 h-1 w-10 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-16" />
      </div>
    </motion.div>
  );
}

export default StatCard;
