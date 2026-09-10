import { motion } from "framer-motion";

function MissionVisionCard({ item }) {
  const Icon = item.icon;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group h-full"
    >
      <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-8 shadow-lg transition-all duration-300 hover:border-blue-200 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900 sm:p-10">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.25 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white"
        >
          <Icon />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
          {item.title}
        </h3>

        {/* Description */}
        <p className="mt-5 flex-1 leading-8 text-slate-600 transition-colors duration-300 dark:text-slate-300">
          {item.description}
        </p>

        {/* Bottom Accent */}
        <div className="mt-7 h-1 w-10 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-16" />
      </div>
    </motion.div>
  );
}

export default MissionVisionCard;
