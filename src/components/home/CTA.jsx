import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-4xl font-bold text-white">
          Ready to Find Your Perfect Home?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
          Whether you're looking for a rental property, listing your house, or
          managing properties as an agent, RentEase provides everything you need
          in one secure and easy-to-use platform.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="rounded-xl bg-white px-8 py-3 font-semibold text-blue-600 transition hover:bg-slate-100"
          >
            Get Started
          </Link>

          <Link
            to="/properties"
            className="rounded-xl border border-white px-8 py-3 font-semibold text-white transition hover:bg-white hover:text-blue-600"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTA;
