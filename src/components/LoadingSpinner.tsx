type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const sizes = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

export default function LoadingSpinner({
  size = "md",
  label,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <div
        className={`animate-spin rounded-full border-brand-200 border-t-brand-600 ${sizes[size]}`}
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}
