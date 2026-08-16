import { FaStar } from "react-icons/fa";

function TestimonialCard({ testimonial }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-md transition hover:-translate-y-2 hover:shadow-xl">
      {/* Rating */}
      <div className="mb-4 flex text-yellow-400">
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <FaStar key={index} />
        ))}
      </div>

      {/* Review */}
      <p className="leading-7 text-slate-600 italic">
        "{testimonial.review}"
      </p>

      {/* User */}
      <div className="mt-8 flex items-center gap-4">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="h-14 w-14 rounded-full object-cover"
        />

        <div>
          <h4 className="font-semibold text-slate-900">
            {testimonial.name}
          </h4>

          <p className="text-sm text-slate-500">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;