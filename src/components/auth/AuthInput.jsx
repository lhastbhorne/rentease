function AuthInput({
  label,
  type = "text",
  placeholder,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block font-medium text-slate-700">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-blue-600 focus:outline-none"
      />
    </div>
  );
}

export default AuthInput;
