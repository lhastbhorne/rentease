import { FaPhone, FaEnvelope, FaUser } from "react-icons/fa";

function ContactCard({ contact = {} }) {
  const name = contact?.name || "Property Owner";
  const phone = contact?.phone || "";
  const email = contact?.email || "";

  // Remove spaces and other characters from phone number
  // only when a phone number actually exists.
  const cleanPhone = phone ? phone.replace(/\s+/g, "") : "";

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border bg-slate-50 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">
            Contact Property Owner
          </h2>

          <div className="mt-6 flex flex-col gap-5">
            {/* Name */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FaUser />
              </div>

              <div>
                <p className="text-sm text-slate-500">Property Owner</p>

                <p className="font-semibold text-slate-800">{name}</p>
              </div>
            </div>

            {/* Phone */}
            {phone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-4 hover:text-blue-600"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FaPhone />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Phone</p>

                  <p className="font-semibold text-slate-800">{phone}</p>
                </div>
              </a>
            )}

            {/* Email */}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 hover:text-blue-600"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FaEnvelope />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Email</p>

                  <p className="font-semibold text-slate-800">{email}</p>
                </div>
              </a>
            )}

            {/* No contact information */}
            {!phone && !email && (
              <p className="text-slate-500">
                Contact information is currently unavailable.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactCard;
