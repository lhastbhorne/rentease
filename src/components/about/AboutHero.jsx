import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function AboutHero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600')",
        }}
      />

      {/* Dark Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-black/65 dark:bg-black/75"
      />

      {/* Subtle Blue Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-slate-950/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-24 text-center sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-7 flex items-center justify-center text-sm font-medium"
        >
          <Link
            to="/"
            className="text-gray-300 transition-colors duration-200 hover:text-blue-300"
          >
            Home
          </Link>

          <span className="mx-3 text-gray-400">/</span>

          <span className="text-blue-300">About</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.35,
            ease: "easeOut",
          }}
          className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          About <span className="text-blue-400">RentEase</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.5,
            ease: "easeOut",
          }}
          className="mx-auto mt-7 max-w-3xl text-base leading-7 text-gray-200 sm:text-lg sm:leading-8 md:text-xl"
        >
          RentEase is a modern rental management platform designed to connect
          tenants, landlords, and property agents through a secure, transparent,
          and user-friendly experience.
        </motion.p>

        {/* Bottom Accent */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.75,
            ease: "easeOut",
          }}
          className="mx-auto mt-9 h-1 w-16 origin-center rounded-full bg-blue-500"
        />
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950/50 to-transparent" />
    </section>
  );
}

export default AboutHero;
