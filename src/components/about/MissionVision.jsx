import { motion } from "framer-motion";
import missionVision from "../../data/missionVision";
import MissionVisionCard from "./MissionVisionCard";

function MissionVision() {
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
            Our Purpose
          </motion.span>

          {/* Heading */}
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-4xl md:text-5xl">
            Mission & Vision
          </h2>

          {/* Description */}
          <p className="mt-5 text-base leading-8 text-slate-600 transition-colors duration-300 dark:text-slate-300 sm:text-lg">
            Everything we build at RentEase is guided by a clear mission and a
            long-term vision to improve the rental experience for everyone.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="grid gap-8 md:grid-cols-2"
        >
          {missionVision.map((item) => (
            <motion.div
              key={item.id}
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
              <MissionVisionCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default MissionVision;
