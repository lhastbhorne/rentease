import { motion } from "framer-motion";

function ValueCard({ value }) {
  const Icon = value.icon;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group h-full"
    >
      <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-lg transition-all duration-300 hover:border-blue-500 hover:bg-blue-600 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-blue-600">
        {/* Icon */}
        <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-600 transition-all duration-300 group-hover:bg-white group-hover:text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-white">
          <Icon />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-white dark:text-white">
          {value.title}
        </h3>

        {/* Description */}
        <p className="mt-5 flex-1 leading-8 text-slate-600 transition-colors duration-300 group-hover:text-blue-100 dark:text-slate-300">
          {value.description}
        </p>

        {/* Bottom Accent */}
        <div className="mt-6 h-1 w-10 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-16 group-hover:bg-white" />
      </div>
    </motion.div>
  );
}

export default ValueCard;
