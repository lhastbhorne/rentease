function AuthButton({ children }) {
  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
    >
      {children}
    </button>
  );
}

export default AuthButton;