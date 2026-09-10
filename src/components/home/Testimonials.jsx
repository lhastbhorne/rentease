import testimonials from "../../data/testimonials";
import TestimonialCard from "../common/TestimonialCard";

function Testimonials() {
  return (
    <section className="bg-slate-50 py-20 transition-colors duration-300 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
            What Our Users Say
          </h2>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Hear from tenants, landlords, and agents who have used RentEase.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
