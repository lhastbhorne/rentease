import { FaStar } from "react-icons/fa";

function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="h-14 w-14 rounded-full object-cover"
        />

        <div>
          <h3 className="font-bold text-slate-900">{review.name}</h3>

          <p className="text-sm text-slate-500">{review.date}</p>
        </div>
      </div>

      <div className="mt-5 flex">
        {Array.from({ length: review.rating }).map((_, index) => (
          <FaStar key={index} className="text-yellow-400" />
        ))}
      </div>

      <p className="mt-5 leading-7 text-slate-600">{review.comment}</p>
    </div>
  );
}

export default ReviewCard;
