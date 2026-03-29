export default function Badge({ status, role, children, className = "" }) {
  const content = status || role || children;
  const key = (status || role || "").toLowerCase();

  // Pill-shaped, small font, uppercase tracking
  let style = "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-body shadow-sm ";

  if (role) {
    if (key === "admin") style += "bg-dark text-cream border border-charcoal";
    else if (key === "manager") style += "bg-accent text-white border border-accent2";
    else if (key === "employee") style += "bg-sand text-charcoal border border-[#E0D8CC]";
    else style += "bg-gray-100 text-charcoal";
  } else if (status) {
    if (key === "pending") style += "bg-warning/10 text-warning border border-warning/20";
    else if (key === "approved") style += "bg-success/10 text-success border border-success/20";
    else if (key === "rejected") style += "bg-danger/10 text-danger border border-danger/20";
    else style += "bg-white text-charcoal border border-sand";
  }

  return (
    <span className={`${style} ${className}`}>
      {content}
    </span>
  );
}
