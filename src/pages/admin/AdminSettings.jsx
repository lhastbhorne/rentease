import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { FaBell, FaLock, FaShieldAlt, FaSave } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

function AdminSettings() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [success, setSuccess] = useState("");

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  function handleSave() {
    // We will connect these settings to Firestore later.
    setSuccess("Settings saved successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  return (
    <DashboardLayout>
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.4,
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-8"
        >
          <h1
            className="
            text-3xl font-bold
            text-slate-800
            dark:text-white
          "
          >
            Admin Settings
          </h1>

          <p
            className="
            mt-2
            text-slate-500
            dark:text-slate-400
          "
          >
            Manage your administrator preferences and account settings.
          </p>
        </motion.div>

        {/* =====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -15,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -10,
                height: 0,
              }}
              className="
                mb-6
                overflow-hidden
                rounded-xl
                border border-green-200
                bg-green-50
                p-4
                text-green-700
                dark:border-green-900/50
                dark:bg-green-950/30
                dark:text-green-400
              "
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 15,
                  }}
                >
                  <FaSave />
                </motion.div>

                <p>{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================================================
            NOTIFICATION SETTINGS
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.05,
          }}
          whileHover={{
            y: -3,
          }}
          className="
            mb-6
            rounded-2xl
            border border-slate-200
            bg-white
            p-8
            shadow-sm
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* SECTION HEADER */}

          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{
                rotate: 8,
                scale: 1.08,
              }}
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
                dark:bg-blue-950/50
                dark:text-blue-400
              "
            >
              <FaBell />
            </motion.div>

            <div>
              <h2
                className="
                text-xl font-bold
                text-slate-800
                dark:text-white
              "
              >
                Notifications
              </h2>

              <p
                className="
                mt-1 text-sm
                text-slate-500
                dark:text-slate-400
              "
              >
                Control how RentEase sends administrative notifications.
              </p>
            </div>
          </div>

          {/* SETTINGS */}

          <div className="mt-8 space-y-6">
            <SettingToggle
              title="In-App Notifications"
              description="Receive notifications about new accounts, properties and applications."
              enabled={notifications}
              onChange={() => setNotifications(!notifications)}
            />

            <SettingToggle
              title="Email Notifications"
              description="Receive important administrative updates through email."
              enabled={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
            />
          </div>
        </motion.div>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.12,
          }}
          whileHover={{
            y: -3,
          }}
          className="
            mb-6
            rounded-2xl
            border border-slate-200
            bg-white
            p-8
            shadow-sm
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{
                rotate: -8,
                scale: 1.08,
              }}
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-red-100
                text-red-600
                dark:bg-red-950/50
                dark:text-red-400
              "
            >
              <FaLock />
            </motion.div>

            <div>
              <h2
                className="
                text-xl font-bold
                text-slate-800
                dark:text-white
              "
              >
                Security
              </h2>

              <p
                className="
                mt-1 text-sm
                text-slate-500
                dark:text-slate-400
              "
              >
                Manage your administrator account security.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <motion.button
              type="button"
              onClick={() => {
                window.location.href = "/forgot-password";
              }}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="
                rounded-lg
                border border-slate-300
                px-5 py-3
                font-semibold
                text-slate-700
                transition-colors
                hover:bg-slate-50
                dark:border-slate-700
                dark:text-slate-200
                dark:hover:bg-slate-800
              "
            >
              Change Password
            </motion.button>
          </div>
        </motion.div>

        {/* =====================================================
            ADMIN PRIVILEGES
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.19,
          }}
          whileHover={{
            y: -3,
          }}
          className="
            mb-6
            rounded-2xl
            border border-slate-200
            bg-white
            p-8
            shadow-sm
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{
                rotate: 8,
                scale: 1.08,
              }}
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-purple-100
                text-purple-600
                dark:bg-purple-950/50
                dark:text-purple-400
              "
            >
              <FaShieldAlt />
            </motion.div>

            <div>
              <h2
                className="
                text-xl font-bold
                text-slate-800
                dark:text-white
              "
              >
                Administrator Access
              </h2>

              <p
                className="
                mt-1 text-sm
                text-slate-500
                dark:text-slate-400
              "
              >
                Information about your administrative privileges.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{
              x: 3,
            }}
            className="
              mt-6
              rounded-xl
              bg-slate-50
              p-5
              dark:bg-slate-800
            "
          >
            <p
              className="
              text-sm leading-6
              text-slate-600
              dark:text-slate-300
            "
            >
              As a RentEase administrator, you can review landlord and agent
              accounts, approve or reject properties, manage users and oversee
              platform activities.
            </p>
          </motion.div>
        </motion.div>

        {/* =====================================================
            SAVE
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.25,
          }}
          className="flex justify-end"
        >
          <motion.button
            type="button"
            onClick={handleSave}
            whileHover={{
              scale: 1.03,
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="
              flex items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-6 py-3
              font-semibold
              text-white
              transition-colors
              hover:bg-blue-700
            "
          >
            <FaSave />
            Save Settings
          </motion.button>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

// =====================================================
// TOGGLE COMPONENT
// =====================================================

function SettingToggle({ title, description, enabled, onChange }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -10,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="
        flex items-center
        justify-between
        gap-6
        border-b
        border-slate-100
        pb-6
        last:border-0
        last:pb-0
        dark:border-slate-800
      "
    >
      <div>
        <h3
          className="
          font-semibold
          text-slate-800
          dark:text-white
        "
        >
          {title}
        </h3>

        <p
          className="
          mt-1 max-w-xl
          text-sm leading-6
          text-slate-500
          dark:text-slate-400
        "
        >
          {description}
        </p>
      </div>

      <motion.button
        type="button"
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        whileTap={{
          scale: 0.9,
        }}
        className={`
          relative h-7 w-12
          shrink-0 rounded-full
          transition-colors duration-300
          ${enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}
        `}
      >
        <motion.span
          animate={{
            x: enabled ? 20 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="
            absolute
            left-1 top-1
            h-5 w-5
            rounded-full
            bg-white
            shadow
          "
        />
      </motion.button>
    </motion.div>
  );
}

export default AdminSettings;
