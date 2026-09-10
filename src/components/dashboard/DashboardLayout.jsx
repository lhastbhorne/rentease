import { useState } from "react";
import { motion } from "framer-motion";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Application */}
      <div className="min-h-screen transition-colors duration-300 lg:ml-72">
        {/* Topbar */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-[calc(100vh-73px)] bg-slate-100 p-4 transition-colors duration-300 dark:bg-slate-950 sm:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export default DashboardLayout;
