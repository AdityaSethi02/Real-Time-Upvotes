import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  hint,
  error,
  icon,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={cn(
            "w-full rounded-xl border border-border bg-surface py-2.5 text-sm text-foreground",
            "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "transition-all duration-200 hover:border-primary/30",
            icon ? "pl-10 pr-4" : "px-4",
            error && "border-hot focus:ring-hot/50",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-hot">{error}</p>}
    </div>
  );
}
