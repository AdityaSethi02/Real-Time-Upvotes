import Link from "next/link";
import { IconMessage } from "@/lib/icons";

interface AppShellProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export default function AppShell({ children, showLogo = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-mesh">
      {showLogo && (
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary transition-colors group-hover:bg-primary/30">
                <IconMessage className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground">ChatBoard</span>
            </Link>
          </div>
        </header>
      )}
      <main className={showLogo ? "pt-14" : ""}>{children}</main>
    </div>
  );
}
