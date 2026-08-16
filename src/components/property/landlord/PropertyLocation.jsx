import { FaMapMarkerAlt } from "react-icons/fa";

function PropertyLocation({ address, coordinates }) {
  const hasCoordinates =
    coordinates &&
    typeof coordinates.lat === "number" &&
    typeof coordinates.lng === "number";

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl bg-slate-50 p-8 shadow-sm">
          {/* Heading */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FaMapMarkerAlt />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Property Location
              </h2>

              <p className="mt-1 text-slate-500">
                {address || "Address not available"}
              </p>
            </div>
          </div>

          {/* Map */}
          {hasCoordinates ? (
            <div className="mt-6 overflow-hidden rounded-xl">
              <iframe
                title="Property Location"
                src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&output=embed`}
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="mt-6 flex h-64 items-center justify-center rounded-xl bg-slate-200">
              <div className="text-center">
                <FaMapMarkerAlt className="mx-auto text-3xl text-slate-400" />

                <p className="mt-3 font-medium text-slate-600">
                  Map location unavailable
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  The landlord has not provided map coordinates for this
                  property.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PropertyLocation;
