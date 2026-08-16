function Pagination({
  currentPage = 1,
  totalPages = 5,
  onPageChange = () => {},
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <section className="bg-slate-50 pb-20">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 flex-wrap">
        {/* Previous */}

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-300 px-5 py-3 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {/* Page Numbers */}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded-lg px-5 py-3 font-semibold transition ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "border border-slate-300 hover:bg-slate-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-300 px-5 py-3 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default Pagination;
