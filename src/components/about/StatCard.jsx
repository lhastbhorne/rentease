function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl text-blue-600">
        <Icon />
      </div>

      <h3 className="text-4xl font-bold text-blue-600">{stat.number}</h3>

      <p className="mt-4 text-lg font-medium text-slate-700">{stat.title}</p>
    </div>
  );
}

export default StatCard;
