function PropertySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      {/* Image */}
      <div className="h-60 w-full animate-pulse bg-slate-200"></div>

      <div className="space-y-4 p-6">
        {/* Title */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200"></div>

        {/* Location */}
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200"></div>

        {/* Price */}
        <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200"></div>

        {/* Beds & Baths */}
        <div className="flex gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200"></div>
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200"></div>
        </div>

        {/* Button */}
        <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-slate-200"></div>
      </div>
    </div>
  );
}

export default PropertySkeleton;