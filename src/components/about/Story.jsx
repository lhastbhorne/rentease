import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

function Story() {
  const highlights = [
    "Verified property listings",
    "Trusted landlords and agents",
    "Simple and transparent rental process",
    "Modern technology for better property management",
  ];

  return (
    <section className="bg-white py-20 transition-colors duration-300 dark:bg-slate-950 md:py-24">
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
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900"
            alt="Modern building"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-[420px] w-full object-cover shadow-lg transition-shadow duration-300 group-hover:shadow-2xl sm:h-[500px]"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-md dark:bg-slate-900/90"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Making rentals easier
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              For everyone
            </p>
          </motion.div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Section Label */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          >
            Our Story
          </motion.span>

          {/* Heading */}
          <h2 className="mt-6 text-3xl font-bold leading-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-4xl lg:text-5xl">
            Simplifying Property Rentals for Everyone
          </h2>

          {/* Paragraphs */}
          <p className="mt-6 text-base leading-8 text-slate-600 dark:text-slate-300">
            RentEase was created to eliminate the stress, uncertainty, and
            inefficiencies often experienced in the rental process. Finding a
            verified property, communicating with trusted landlords, and
            managing rental applications should be straightforward—not
            frustrating.
          </p>

          <p className="mt-6 text-base leading-8 text-slate-600 dark:text-slate-300">
            Our platform brings tenants, landlords, and property agents together
            in one secure ecosystem where listings are organized, communication
            is transparent, and rental management is easier for everyone
            involved.
          </p>

          {/* Highlights */}
          <div className="mt-8 space-y-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.1,
                }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
              >
                <FaCheckCircle className="shrink-0 text-xl text-blue-600 dark:text-blue-400" />

                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:text-base">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Story;
