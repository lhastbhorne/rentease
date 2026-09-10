import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  const Icon = category.icon;

  return (
    <Link
      to="/properties"
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-blue-600"
    >
      {/* Hover Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-400/0 blur-3xl transition-all duration-500 group-hover:bg-blue-300/30" />

      {/* Icon */}
      <div className="relative mb-5 flex justify-center text-5xl text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:text-white dark:text-blue-400">
        <Icon />
      </div>

      {/* Title */}
      <h3 className="relative text-2xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-white dark:text-white">
        {category.name}
      </h3>

      {/* Count */}
      <p className="relative mt-3 text-slate-500 transition-colors duration-300 group-hover:text-blue-100 dark:text-slate-400">
        {category.count}
      </p>
    </Link>
  );
}

export default CategoryCard;
