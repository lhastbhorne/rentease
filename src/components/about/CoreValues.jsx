import { motion } from "framer-motion";
import coreValues from "../../data/coreValues";
import ValueCard from "./ValueCard";

function CoreValues() {
  return (
    <section className="bg-white py-20 transition-colors duration-300 dark:bg-slate-950 md:py-24">
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
            What We Believe
          </motion.span>

          {/* Heading */}
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-4xl md:text-5xl">
            Our Core Values
          </h2>

          {/* Description */}
          <p className="mt-5 text-base leading-8 text-slate-600 transition-colors duration-300 dark:text-slate-300 sm:text-lg">
            These principles shape every decision we make and every experience
            we create for our users.
          </p>
        </motion.div>

        {/* Values Grid */}
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
          {coreValues.map((value) => (
            <motion.div
              key={value.id}
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
              <ValueCard value={value} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CoreValues;
