"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconChevronDown } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface SelectProps {
  id?: string;
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Select({
  id,
  label,
  hint,
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm transition-all duration-200",
            "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50",
            open && "border-primary/50 ring-2 ring-primary/30",
            selected ? "text-foreground" : "text-muted"
          )}
        >
          <span>{selected?.label ?? placeholder}</span>
          <IconChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <ul
            className="absolute z-50 mt-1.5 max-h-52 w-full overflow-auto rounded-xl border border-border bg-[hsl(222,47%,11%)] py-1 shadow-xl shadow-black/40 scrollbar-thin animate-slide-up"
            role="listbox"
          >
            {options.map((opt) => (
              <li key={opt.value} role="option" aria-selected={value === opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2 text-sm transition-colors",
                    value === opt.value
                      ? "bg-primary/15 text-primary"
                      : "text-foreground hover:bg-surface-hover"
                  )}
                >
                  {opt.label}
                  {value === opt.value && <IconCheck className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
