import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange(page);
  }

  return (
    <section className="bg-slate-50 pb-20 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-5 sm:gap-3 sm:px-6 lg:px-8">
        {/* Previous */}
        <motion.button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          whileHover={currentPage !== 1 ? { y: -2 } : {}}
          whileTap={currentPage !== 1 ? { scale: 0.96 } : {}}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 sm:px-5"
        >
          <FaChevronLeft className="text-xs" />

          <span>Previous</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {pages.map((page) => {
            const isActive = currentPage === page;

            return (
              <motion.button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`min-w-11 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </motion.button>
            );
          })}
        </div>

        {/* Next */}
        <motion.button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          whileHover={currentPage !== totalPages ? { y: -2 } : {}}
          whileTap={currentPage !== totalPages ? { scale: 0.96 } : {}}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 sm:px-5"
        >
          <span>Next</span>

          <FaChevronRight className="text-xs" />
        </motion.button>
      </div>
    </section>
  );
}

export default Pagination;
