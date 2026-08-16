function MissionVisionCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-3xl bg-white p-10 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-600">
        <Icon />
      </div>

      <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>

      <p className="mt-5 leading-8 text-slate-600">{item.description}</p>
    </div>
  );
}

export default MissionVisionCard;
