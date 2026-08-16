import CategoryCard from "../property/public/CategoryCard";
import categories from "../../data/categories";

function Categories() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            Browse by Category
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Explore different property types to find the perfect space that
            suits your needs.
          </p>
        </div>

        {/* Categories */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;