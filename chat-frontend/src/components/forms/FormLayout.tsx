"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@/lib/icons";

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function FormLayout({ title, subtitle, icon, children }: FormLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <div className="mb-8 flex items-start gap-4">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted leading-relaxed">{subtitle}</p>}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
