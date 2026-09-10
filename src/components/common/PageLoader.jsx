import { motion } from "framer-motion";

function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-950"
    >
      <div className="flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
              R
            </div>

            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              RentEase
            </span>
          </div>
        </motion.div>

        {/* Loading line */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 rounded-full bg-blue-600"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-4 text-sm text-slate-500 dark:text-slate-400"
        >
          Making renting easier...
        </motion.p>
      </div>
    </motion.div>
  );
}

export default PageLoader;
