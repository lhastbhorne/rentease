import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

function RelatedProperties({ properties }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Related Properties
          </h2>

          <p className="mt-2 text-slate-600">
            You may also be interested in these properties.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={property.image}
                alt={property.title}
                className="h-60 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="text-xl font-bold">{property.title}</h3>

                <div className="mt-3 flex items-center gap-2 text-slate-500">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span>{property.location}</span>
                </div>

                <p className="mt-5 text-2xl font-bold text-blue-600">
                  {property.price}
                </p>

                <Link
                  to={`/properties/${property.id}`}
                  className="mt-6 block rounded-xl bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RelatedProperties;
