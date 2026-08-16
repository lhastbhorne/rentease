import { FaStar } from "react-icons/fa";
import ReviewCard from "../../common/ReviewCard";

function PropertyReviews({ reviews }) {
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Reviews</h2>

            <p className="mt-2 text-slate-600">
              See what previous tenants are saying.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-lg">
            <FaStar className="text-yellow-400" />

            <span className="text-2xl font-bold">
              {averageRating.toFixed(1)}
            </span>

            <span className="text-slate-500">({reviews.length} Reviews)</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PropertyReviews;
