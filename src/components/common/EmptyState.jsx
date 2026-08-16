import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

function EmptyState({
  title = "No Properties Found",
  description = "There are currently no properties available. Please check back later.",
  buttonText = "Go Home",
  buttonLink = "/",
}) {
  return (
    <section className="flex min-h-[450px] items-center justify-center bg-slate-50 px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-5xl text-blue-600">
          <FaHome />
        </div>

        <h2 className="mt-8 text-3xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-4 leading-8 text-slate-600">
          {description}
        </p>

        <Link
          to={buttonLink}
          className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

export default EmptyState;