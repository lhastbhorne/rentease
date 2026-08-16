import { Link } from "react-router-dom";

function AboutHero() {
  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        {/* Breadcrumb */}
        <div className="mb-6 flex justify-center text-sm">
          <Link to="/" className="hover:text-blue-300 transition">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-blue-300">About</span>
        </div>

        <h1 className="text-5xl font-bold leading-tight md:text-6xl">
          About RentEase
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-200">
          RentEase is a modern rental management platform designed to connect
          tenants, landlords, and property agents through a secure, transparent,
          and user-friendly experience.
        </p>
      </div>
    </section>
  );
}

export default AboutHero;
