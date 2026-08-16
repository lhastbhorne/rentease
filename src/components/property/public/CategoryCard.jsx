import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  const Icon = category.icon;

  return (
    <Link
      to="/properties"
      className="group rounded-2xl bg-white p-8 text-center shadow-md transition duration-300 hover:-translate-y-2 hover:bg-blue-600 hover:shadow-xl"
    >
      <div className="mb-5 flex justify-center text-5xl text-blue-600 transition group-hover:text-white">
        <Icon />
      </div>

      <h3 className="text-2xl font-semibold text-slate-900 transition group-hover:text-white">
        {category.name}
      </h3>

      <p className="mt-3 text-slate-500 transition group-hover:text-blue-100">
        {category.count}
      </p>
    </Link>
  );
}

export default CategoryCard;