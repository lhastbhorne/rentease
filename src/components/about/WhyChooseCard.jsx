import { motion } from "framer-motion";

function WhyChooseCard({ feature }) {
  const Icon = feature.icon;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900"
    >
      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ duration: 0.25 }}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white"
      >
        <Icon />
      </motion.div>

      {/* Content */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 transition-colors duration-300 dark:text-white">
          {feature.title}
        </h3>

        <p className="mt-2 leading-7 text-slate-600 transition-colors duration-300 dark:text-slate-300">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default WhyChooseCard;
