import { motion } from "framer-motion";

function AuthButton({ children }) {
  return (
    <motion.button
      type="submit"
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700 dark:hover:bg-blue-500"
    >
      {children}
    </motion.button>
  );
}

export default AuthButton;
