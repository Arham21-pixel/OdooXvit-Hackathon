export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) {
  const baseStyle =
    "relative inline-flex items-center justify-center font-semibold font-body rounded-full px-8 py-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream overflow-hidden shadow-sm";
  
  const variants = {
    primary:
      "bg-dark text-cream hover:bg-charcoal hover:-translate-y-1 hover:shadow-lg focus:ring-dark",
    outline:
      "bg-transparent text-dark border-2 border-[#E0D8CC] hover:border-dark hover:bg-gray-50/50 focus:ring-dark",
    danger:
      "bg-danger text-white hover:bg-red-600 hover:-translate-y-1 hover:shadow-lg focus:ring-danger",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${
        disabled || isLoading ? "opacity-70 cursor-not-allowed transform-none shadow-none" : ""
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Authorizing...
        </span>
      ) : children}
    </button>
  );
}
