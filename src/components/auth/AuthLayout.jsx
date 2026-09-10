import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen transition-colors duration-300 lg:grid-cols-2">
      {/* Left Panel */}

      <div className="hidden flex-col justify-center bg-blue-700 px-16 text-white lg:flex">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link
            to="/"
            className="mb-10 inline-block text-4xl font-bold transition-opacity hover:opacity-90"
          >
            RentEase
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl font-bold leading-tight"
          >
            Find Your Perfect Home With Confidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 text-lg leading-8 text-blue-100"
          >
            Rent apartments, houses, duplexes and commercial properties from
            verified landlords and trusted agents across Nigeria.
          </motion.p>

          <div className="mt-16 grid grid-cols-2 gap-8">
            {[
              ["10K+", "Verified Properties"],
              ["5K+", "Happy Tenants"],
              ["2K+", "Trusted Landlords"],
              ["500+", "Verified Agents"],
            ].map(([number, label], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  duration: 0.4,
                }}
                whileHover={{ y: -3 }}
              >
                <h2 className="text-4xl font-bold">{number}</h2>

                <p className="mt-2 text-blue-100">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12 transition-colors duration-300 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.4,
            }}
            className="mb-10"
          >
            <h2 className="text-4xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
              {title}
            </h2>

            <p className="mt-3 text-slate-600 transition-colors duration-300 dark:text-slate-400">
              {subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.4,
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;
