function Stats() {
  const stats = [
    {
      id: 1,
      number: "2,500+",
      title: "Properties Listed",
    },
    {
      id: 2,
      number: "1,200+",
      title: "Happy Tenants",
    },
    {
      id: 3,
      number: "350+",
      title: "Verified Landlords",
    },
    {
      id: 4,
      number: "98%",
      title: "Customer Satisfaction",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-xl bg-slate-50 p-6 text-center shadow-sm transition hover:shadow-lg"
          >
            <h2 className="text-4xl font-bold text-blue-600">
              {stat.number}
            </h2>

            <p className="mt-3 text-gray-600">
              {stat.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;