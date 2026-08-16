import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel */}

      <div className="hidden bg-blue-700 text-white lg:flex flex-col justify-center px-16">
        <Link
          to="/"
          className="mb-10 text-4xl font-bold"
        >
          RentEase
        </Link>

        <h1 className="text-5xl font-bold leading-tight">
          Find Your Perfect Home With Confidence
        </h1>

        <p className="mt-8 text-lg text-blue-100 leading-8">
          Rent apartments, houses, duplexes and commercial
          properties from verified landlords and trusted
          agents across Nigeria.
        </p>

        <div className="mt-16 grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-4xl font-bold">10K+</h2>
            <p className="mt-2 text-blue-100">
              Verified Properties
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">5K+</h2>
            <p className="mt-2 text-blue-100">
              Happy Tenants
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">2K+</h2>
            <p className="mt-2 text-blue-100">
              Trusted Landlords
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">500+</h2>
            <p className="mt-2 text-blue-100">
              Verified Agents
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-3 text-slate-600">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;