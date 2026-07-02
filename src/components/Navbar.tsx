import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 group">
          <img
            src="/codexa-logo.png"
            alt="Codexa"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-lg shadow-brand transition-smooth group-hover:scale-105"
          />
          <span className="truncate text-base font-bold tracking-tight sm:text-lg">Codexa</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className={`text-sm font-medium transition-smooth hover:text-foreground ${pathname === "/" ? "text-foreground" : "text-muted-foreground"}`}>Home</Link>
          <Link to="/dashboard" className={`text-sm font-medium transition-smooth hover:text-foreground ${pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"}`}>Dashboard</Link>
          <Link to="/project-ideas" className={`inline-flex items-center gap-1.5 text-sm font-medium transition-smooth hover:text-foreground ${pathname === "/project-ideas" ? "text-foreground" : "text-muted-foreground"}`}>
            Project Ideas
            <span className="rounded-full bg-gradient-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">New</span>
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-smooth hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/dashboard"
            className="rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-white shadow-brand transition-smooth hover:scale-[1.03] sm:px-4 sm:text-sm"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
