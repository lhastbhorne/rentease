import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { FaUser, FaEnvelope, FaPhone, FaShieldAlt } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile } from "../../firebase/services";

function AdminProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserProfile(user.uid);

        setProfile(data);
      } catch (error) {
        console.error("Error loading admin profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.uid]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="
            flex min-h-[400px]
            items-center
            justify-center
          "
        >
          <div className="text-center">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                mx-auto h-10 w-10
                rounded-full
                border-4
                border-slate-200
                border-t-blue-600
                dark:border-slate-700
                dark:border-t-blue-400
              "
            />

            <p
              className="
              mt-4
              text-slate-500
              dark:text-slate-400
            "
            >
              Loading profile...
            </p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  const adminName = profile?.fullName || user?.displayName || "Administrator";

  const adminEmail = profile?.email || user?.email || "No email available";

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
            Admin Profile
          </h1>

          <p
            className="
            mt-2
            text-slate-500
            dark:text-slate-400
          "
          >
            View your administrator account information.
          </p>
        </motion.div>

        {/* =====================================================
            PROFILE CARD
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
            duration: 0.5,
            delay: 0.05,
          }}
          className="
            overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* PROFILE HEADER */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.6,
            }}
            className="
              bg-blue-600
              px-8 py-10
              text-white
              dark:bg-blue-700
            "
          >
            <div
              className="
              flex flex-col
              items-center
              gap-5
              sm:flex-row
            "
            >
              {/* AVATAR */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 15,
                  delay: 0.15,
                }}
                whileHover={{
                  scale: 1.06,
                  rotate: 3,
                }}
                className="
                  flex h-24 w-24
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-3xl font-bold
                  text-blue-600
                  shadow-lg
                "
              >
                {adminName.charAt(0).toUpperCase()}
              </motion.div>

              {/* NAME */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.2,
                }}
                className="
                  text-center
                  sm:text-left
                "
              >
                <h2
                  className="
                  text-3xl font-bold
                "
                >
                  {adminName}
                </h2>

                <p
                  className="
                  mt-2
                  text-blue-100
                "
                >
                  {adminEmail}
                </p>

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.3,
                  }}
                  className="
                    mt-3
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-blue-500
                    px-4 py-2
                    text-sm font-semibold
                  "
                >
                  <FaShieldAlt />
                  Administrator
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <div className="p-8">
            <motion.h3
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="
                text-xl font-bold
                text-slate-800
                dark:text-white
              "
            >
              Account Information
            </motion.h3>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="
                mt-6
                grid gap-6
                md:grid-cols-2
              "
            >
              <ProfileItem
                icon={<FaUser />}
                label="Full Name"
                value={adminName}
              />

              <ProfileItem
                icon={<FaEnvelope />}
                label="Email Address"
                value={adminEmail}
              />

              <ProfileItem
                icon={<FaPhone />}
                label="Phone Number"
                value={profile?.phone || "Not provided"}
              />

              <ProfileItem
                icon={<FaShieldAlt />}
                label="Account Role"
                value="Administrator"
              />
            </motion.div>

            {/* =================================================
                SECURITY NOTICE
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.65,
              }}
              whileHover={{
                y: -2,
              }}
              className="
                mt-8
                rounded-xl
                border border-blue-100
                bg-blue-50
                p-5
                dark:border-blue-900/50
                dark:bg-blue-950/30
              "
            >
              <div className="flex gap-4">
                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.08,
                  }}
                  className="
                    mt-1
                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  <FaShieldAlt />
                </motion.div>

                <div>
                  <h4
                    className="
                    font-semibold
                    text-slate-800
                    dark:text-white
                  "
                  >
                    Administrator Account
                  </h4>

                  <p
                    className="
                    mt-1
                    text-sm leading-6
                    text-slate-600
                    dark:text-slate-300
                  "
                  >
                    This account has administrator privileges and can manage
                    users, properties, verifications and other RentEase
                    administrative functions.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

// =====================================================
// PROFILE ITEM
// =====================================================

function ProfileItem({ icon, label, value }) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 15,
        },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        rounded-xl
        border border-slate-200
        p-5
        transition-colors duration-300
        dark:border-slate-700
        dark:bg-slate-800/50
      "
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{
            scale: 1.08,
            rotate: 5,
          }}
          className="
            flex h-10 w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-blue-100
            text-blue-600
            dark:bg-blue-950/50
            dark:text-blue-400
          "
        >
          {icon}
        </motion.div>

        <div className="min-w-0">
          <p
            className="
            text-sm
            text-slate-400
            dark:text-slate-500
          "
          >
            {label}
          </p>

          <p
            className="
            mt-1
            break-words
            font-semibold
            text-slate-800
            dark:text-white
          "
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default AdminProfile;
