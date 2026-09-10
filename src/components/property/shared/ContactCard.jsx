import { motion } from "framer-motion";
import { FaUser, FaCheckCircle } from "react-icons/fa";

function ContactCard({ property = {}, contact = {} }) {
  // ==========================================
  // PROPERTY MANAGER
  // ==========================================

  const name = property?.managerName || contact?.name || "Property Manager";

  const role = property?.managerRole || contact?.role || "Property Manager";

  const formattedRole =
    role === "landlord" ? "Landlord" : role === "agent" ? "Agent" : role;

  return (
    <section className="bg-white py-12 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* ========================================
              TITLE
          ======================================== */}

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Property Manager
          </h2>

          {/* ========================================
              MANAGER INFORMATION
          ======================================== */}

          <div className="mt-6 flex items-center gap-4">
            {/* Profile Icon */}

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FaUser className="text-xl" />
            </div>

            {/* Manager Details */}

            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 dark:text-white">
                  {name}
                </p>

                <FaCheckCircle
                  className="text-blue-600 dark:text-blue-400"
                  title="Verified property manager"
                />
              </div>

              <p className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">
                {formattedRole}
              </p>
            </div>
          </div>

          {/* ========================================
              PLATFORM COMMUNICATION
          ======================================== */}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <p className="text-sm leading-6 text-blue-700 dark:text-blue-300">
              For your safety, direct contact details are kept private.
              Inspection requests and other communication are handled securely
              through RentEase.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactCard;
