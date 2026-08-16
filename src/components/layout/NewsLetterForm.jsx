function NewsletterForm() {
  return (
    <div>
      <h3 className="mb-6 text-xl font-semibold text-white">
        Newsletter
      </h3>

      <p className="mb-5">
        Subscribe to receive the latest rental properties and updates.
      </p>

      <form className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <button
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

export default NewsletterForm;