import { motion } from "framer-motion";

function StatCard({ title, value, icon, color = "bg-blue-600", change }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {value}
          </h2>

          {change && (
            <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
              {change}
            </p>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.08, rotate: 2 }}
          transition={{ duration: 0.2 }}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl text-white shadow-sm ${color} sm:h-16 sm:w-16 sm:text-3xl`}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default StatCard;
