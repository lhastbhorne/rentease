import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-12 px-6 py-20 md:flex-row">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Trusted Rental Platform
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Find Your Perfect Home with Confidence.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            RentEase connects tenants, landlords, and agents on one secure
            platform, making property search, applications, and rental
            management simple and stress-free.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to="/properties"
              className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>

            <Link
              to="/register"
              className="rounded-lg border border-blue-600 px-6 py-3 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1">
          <img
            src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900"
            alt="Modern House"
            className="w-full rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
