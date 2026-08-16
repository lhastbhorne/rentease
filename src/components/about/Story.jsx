import { FaCheckCircle } from "react-icons/fa";

function Story() {
  const highlights = [
    "Verified property listings",
    "Trusted landlords and agents",
    "Simple and transparent rental process",
    "Modern technology for better property management",
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        {/* Left Image */}

        <div>
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900"
            alt="Modern building"
            className="h-full w-full rounded-3xl object-cover shadow-lg"
          />
        </div>

        {/* Right Content */}

        <div>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Our Story
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Simplifying Property Rentals for Everyone
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            RentEase was created to eliminate the stress, uncertainty, and
            inefficiencies often experienced in the rental process. Finding a
            verified property, communicating with trusted landlords, and
            managing rental applications should be straightforward—not
            frustrating.
          </p>

          <p className="mt-6 leading-8 text-slate-600">
            Our platform brings tenants, landlords, and property agents together
            in one secure ecosystem where listings are organized, communication
            is transparent, and rental management is easier for everyone
            involved.
          </p>

          <div className="mt-8 space-y-4">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <FaCheckCircle className="text-xl text-blue-600" />

                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Story;
