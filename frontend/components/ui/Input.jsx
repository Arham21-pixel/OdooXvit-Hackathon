export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-semibold text-charcoal font-body px-1">{label}</label>}
      <input
        className={`px-6 py-3.5 rounded-full border bg-white font-body text-dark placeholder-muted focus:outline-none focus:ring-2 transition-all shadow-sm ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-[#E0D8CC] focus:border-accent focus:ring-accent/20 hover:border-accent/50"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-danger mt-1 font-medium px-4 font-body">{error}</span>}
    </div>
  );
}
