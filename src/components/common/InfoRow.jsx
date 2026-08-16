function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-4">
      <span className="font-medium text-slate-600">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

export default InfoRow;