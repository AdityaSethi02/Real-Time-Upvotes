import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 shadow-xl shadow-black/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
