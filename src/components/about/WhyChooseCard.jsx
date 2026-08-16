function WhyChooseCard({ feature }) {
  const Icon = feature.icon;

  return (
    <div className="flex gap-5 rounded-2xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
        <Icon />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-slate-900">
          {feature.title}
        </h3>

        <p className="mt-2 leading-7 text-slate-600">{feature.description}</p>
      </div>
    </div>
  );
}

export default WhyChooseCard;
