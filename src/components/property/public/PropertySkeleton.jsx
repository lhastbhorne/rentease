function PropertySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg transition-colors duration-300 dark:bg-slate-900">
      {/* Image */}
      <div className="h-60 w-full animate-pulse bg-slate-200 dark:bg-slate-700" />

      <div className="space-y-4 p-6">
        {/* Title */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

        {/* Location */}
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

        {/* Price */}
        <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

        {/* Beds & Baths */}
        <div className="flex gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

          <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Button */}
        <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export default PropertySkeleton;
