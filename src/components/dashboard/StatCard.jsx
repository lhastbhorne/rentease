function StatCard({ title, value, icon, color = "bg-blue-600", change }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">{value}</h2>

          {change && <p className="mt-2 text-sm text-green-600">{change}</p>}
        </div>

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl text-3xl text-white ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
