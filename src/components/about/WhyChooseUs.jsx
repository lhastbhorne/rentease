import { motion } from "framer-motion";
import whyChooseUs from "../../data/whyChooseUs";
import WhyChooseCard from "./WhyChooseCard";

function WhyChooseUs() {
  return (
    <section className="bg-slate-50 py-20 transition-colors duration-300 dark:bg-slate-900 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="group relative overflow-hidden rounded-3xl"
        >
          <motion.img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900"
            alt="Modern apartment"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-[420px] w-full object-cover shadow-xl sm:h-[500px]"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Label */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          >
            Why RentEase
          </motion.span>

          {/* Heading */}
          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-4xl md:text-5xl">
            Why Choose RentEase?
          </h2>

          {/* Description */}
          <p className="mb-10 mt-5 text-base leading-8 text-slate-600 transition-colors duration-300 dark:text-slate-300 sm:text-lg">
            We combine technology, transparency, and trusted property management
            tools to create a better rental experience for everyone.
          </p>

          {/* Features */}
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
            className="space-y-6"
          >
            {whyChooseUs.map((feature) => (
              <motion.div
                key={feature.id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 25,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                <WhyChooseCard feature={feature} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
