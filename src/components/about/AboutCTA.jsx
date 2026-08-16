import { Link } from "react-router-dom";

function AboutCTA() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="mx-auto max-w-5xl px-6 text-center text-white">
        <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
          Join the RentEase Community
        </span>

        <h2 className="mt-8 text-4xl font-bold md:text-5xl">
          Ready to Experience RentEase?
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
          Whether you're searching for your next home, listing a property, or
          managing rentals, RentEase provides the tools you need to make the
          process simple, secure, and efficient.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/properties"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 transition hover:bg-slate-100"
          >
            Browse Properties
          </Link>

          <Link
            to="/register"
            className="rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-blue-600"
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AboutCTA;