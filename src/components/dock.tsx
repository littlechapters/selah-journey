import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Clock, Home, Orbit } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/bible", label: "Bible", icon: BookOpen },
  { to: "/immerse", label: "Immerse", icon: Orbit },
  { to: "/journey", label: "Journey", icon: Clock },
] as const;

export function Dock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/source" || pathname === "/handoff") return null;

  return (
    <nav
      aria-label="Primary"
      className="dock pointer-events-auto fixed bottom-4 left-1/2 z-30 w-[min(92vw,26rem)] -translate-x-1/2 rounded-full border border-white/10 bg-black/45 px-2 py-2 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl"
    >
      <ul className="grid grid-cols-4 items-center">
        {TABS.map((tab) => {
          const on = pathname === tab.to;
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex justify-center">
              <Link
                to={tab.to}
                className={`flex min-h-12 min-w-[4.4rem] flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] tracking-wide transition-colors duration-150 ${
                  on ? "bg-white/10 text-fg" : "text-muted"
                }`}
                aria-current={on ? "page" : undefined}
              >
                <Icon className="size-[18px]" strokeWidth={1.6} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
