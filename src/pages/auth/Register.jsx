import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaUser, FaBuilding, FaHome } from "react-icons/fa";

import AuthLayout from "../../components/auth/AuthLayout";

function Register() {
  const accountTypes = [
    {
      title: "Tenant",
      description: "Find verified rental properties and manage your rentals.",
      icon: <FaUser className="text-3xl text-blue-600 dark:text-blue-400" />,
      link: "/register/tenant",
      button: "Continue as Tenant",
    },
    {
      title: "Landlord",
      description: "List your properties and manage tenants securely.",
      icon: <FaHome className="text-3xl text-green-600 dark:text-green-400" />,
      link: "/register/landlord",
      button: "Continue as Landlord",
    },
    {
      title: "Agent",
      description: "Manage clients and property listings professionally.",
      icon: (
        <FaBuilding className="text-3xl text-purple-600 dark:text-purple-400" />
      ),
      link: "/register/agent",
      button: "Continue as Agent",
    },
  ];

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Choose the type of account you want to create."
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        className="space-y-5"
      >
        {accountTypes.map((account) => (
          <motion.div
            key={account.title}
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
              },
              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            whileHover={{
              y: -4,
            }}
            transition={{
              duration: 0.25,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-blue-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}

              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: 3,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                }}
              >
                {account.icon}
              </motion.div>

              {/* Content */}

              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 transition-colors duration-300 dark:text-white">
                  {account.title}
                </h3>

                <p className="mt-2 text-slate-600 transition-colors duration-300 dark:text-slate-400">
                  {account.description}
                </p>

                <motion.div
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="inline-block"
                >
                  <Link
                    to={account.link}
                    className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    {account.button}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Login */}

        <motion.p
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.5,
            duration: 0.4,
          }}
          className="pt-4 text-center text-slate-600 transition-colors duration-300 dark:text-slate-400"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Login
          </Link>
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
}

export default Register;
