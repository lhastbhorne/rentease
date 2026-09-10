import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function AboutCTA() {
  return (
    <section className="relative overflow-hidden bg-blue-600 py-20 transition-colors duration-300 dark:bg-blue-700 md:py-24">
      {/* Decorative Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.2, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-5xl px-5 text-center text-white sm:px-6 lg:px-8"
      >
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
        >
          Join the RentEase Community
        </motion.span>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
        >
          Ready to Experience RentEase?
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-6 max-w-3xl text-base leading-8 text-blue-100 sm:text-lg"
        >
          Whether you're searching for your next home, listing a property, or
          managing rentals, RentEase provides the tools you need to make the
          process simple, secure, and efficient.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/properties"
              className="block rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl"
            >
              Browse Properties
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/register"
              className="block rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-white hover:text-blue-600"
            >
              Create Account
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default AboutCTA;
