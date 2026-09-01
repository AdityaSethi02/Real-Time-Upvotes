import { IconGithub } from "@/lib/icons";

const TECH = ["Next.js", "FastAPI", "WebSockets", "PostgreSQL", "Tailwind CSS"];

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4">
        <div className="flex flex-wrap justify-center gap-2">
          {TECH.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
        <a
          href="https://github.com/AdityaSethi02/Real-Time-Upvotes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <IconGithub className="h-4 w-4" />
          View on GitHub
        </a>
      </div>
    </footer>
  );
}
