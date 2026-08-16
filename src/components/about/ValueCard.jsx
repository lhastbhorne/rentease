function ValueCard({ value }) {
  const Icon = value.icon;

  return (
    <div className="group rounded-3xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:bg-blue-600 hover:shadow-2xl">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-600 transition group-hover:bg-white">
        <Icon />
      </div>

      <h3 className="text-2xl font-bold text-slate-900 transition group-hover:text-white">
        {value.title}
      </h3>

      <p className="mt-5 leading-8 text-slate-600 transition group-hover:text-blue-100">
        {value.description}
      </p>
    </div>
  );
}

export default ValueCard;
