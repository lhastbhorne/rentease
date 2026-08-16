import { Link } from "react-router-dom";

function PropertiesHero() {
  return (
    <section
      className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
        {/* Breadcrumb */}
        <div className="mb-6 flex justify-center text-sm">
          <Link to="/" className="transition hover:text-blue-300">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-blue-300">Properties</span>
        </div>

        <h1 className="text-5xl font-bold md:text-6xl">
          Find Your Perfect Property
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-200">
          Explore verified apartments, duplexes, studios, office spaces,
          commercial buildings, and more. Discover properties that match your
          lifestyle and budget with RentEase.
        </p>
      </div>
    </section>
  );
}

export default PropertiesHero;
