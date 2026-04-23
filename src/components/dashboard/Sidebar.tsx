import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Props {
  view: "today" | "archived";
  onChange: (v: "today" | "archived") => void;
}

const NAV_LINK =
  "w-full text-left bg-transparent border-0 rounded-none font-serif italic text-sm tracking-tight " +
  "text-vellum/65 hover:text-vellum transition-colors " +
  "underline-offset-[6px] decoration-vellum/50 " +
  "focus-visible:outline-none focus-visible:underline focus-visible:decoration-vellum";

export function Sidebar({ view, onChange }: Props) {
  const { user, logout } = useAuth();

  const items: { id: Props["view"]; label: string }[] = [
    { id: "today", label: "Daily Record" },
    { id: "archived", label: "Archived Tasks" },
  ];

  return (
    <nav
      id="app-sidebar"
      className={cn(
        "hidden md:flex w-60 lg:w-64 flex-col shrink-0 border-r border-vellum/10",
        "bg-leather text-vellum/90 [background-image:var(--gradient-leather)] shadow-[inset_-1px_0_0_hsl(40_33%_96%/0.06)]",
      )}
      aria-label="Primary"
    >
      <div className="border-b border-vellum/10 px-7 pt-8 pb-10">
        <div className="flex items-center gap-3">
          <span className="font-serif text-2xl italic tracking-tight text-vellum truncate">Donut</span>
        </div>
      </div>

      <div className="flex-1 py-4 px-5 space-y-0.5">
        {items.map(({ id, label }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                NAV_LINK,
                "px-2 py-2.5",
                active && "text-vellum underline decoration-vellum/70",
              )}
            >
              {label}
            </button>
          );
        })}

        <div className="pt-4 mt-2 border-t border-vellum/10 space-y-0.5">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn(
                NAV_LINK,
                "block w-full px-2 py-2.5",
                isActive && "text-vellum underline decoration-vellum/70",
              )
            }
          >
            About us
          </NavLink>
          <NavLink
            to="/manual"
            className={({ isActive }) =>
              cn(
                NAV_LINK,
                "block w-full px-2 py-2.5",
                isActive && "text-vellum underline decoration-vellum/70",
              )
            }
          >
            Manual
          </NavLink>
        </div>
      </div>

      <div className="mt-auto border-t border-vellum/10 px-7 pb-7 pt-4 space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-vellum/40 font-sans not-italic">Keeper</p>
          <p className="font-serif italic text-vellum/90 mt-0.5 truncate">{user ?? "—"}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className={cn(NAV_LINK, "text-xs not-italic font-sans text-vellum/50 hover:text-seal")}
        >
          Close the volume
        </button>
        <p className="text-[10px] text-vellum/30 font-serif italic pt-2">Volume IV — MMXXVI</p>
      </div>
    </nav>
  );
}
