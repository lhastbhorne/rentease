import { motion } from "framer-motion";
import companyStats from "../../data/companyStats";
import StatCard from "./StatCard";

function CompanyStats() {
  return (
    <section className="bg-slate-50 py-20 transition-colors duration-300 dark:bg-slate-900 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          {/* Label */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          >
            Our Impact
          </motion.span>

          {/* Heading */}
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-4xl md:text-5xl">
            RentEase in Numbers
          </h2>

          {/* Description */}
          <p className="mt-5 text-base leading-8 text-slate-600 transition-colors duration-300 dark:text-slate-300 sm:text-lg">
            These milestones reflect our commitment to connecting tenants,
            landlords, and property professionals through one trusted platform.
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {companyStats.map((stat) => (
            <motion.div
              key={stat.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 40,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <StatCard stat={stat} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CompanyStats;
