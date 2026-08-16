import { FaSearch } from "react-icons/fa";

function NoResults({
  title = "No Matching Properties",
  description = "Try adjusting your search keywords or filters to find more properties.",
  buttonText = "Clear Filters",
  onClearFilters = () => {},
}) {
  return (
    <section className="flex min-h-[450px] items-center justify-center bg-slate-50 px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-orange-100 text-5xl text-orange-500">
          <FaSearch />
        </div>

        <h2 className="mt-8 text-3xl font-bold text-slate-900">{title}</h2>

        <p className="mt-4 leading-8 text-slate-600">{description}</p>

        <button
          onClick={onClearFilters}
          className="mt-8 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}

export default NoResults;
