import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Book, Inbox, ScrollText, LogOut } from "lucide-react";

interface Props {
  view: "today" | "backlog" | "log";
  onChange: (v: "today" | "backlog" | "log") => void;
}

export function Sidebar({ view, onChange }: Props) {
  const { user, logout } = useAuth();

  const items: { id: Props["view"]; label: string; icon: typeof Book }[] = [
    { id: "today", label: "Daily Record", icon: Book },
    { id: "backlog", label: "The Backlog", icon: Inbox },
    { id: "log", label: "History", icon: ScrollText },
  ];

  return (
    <nav className="hidden md:flex w-60 lg:w-64 bg-leather text-vellum/90 flex-col border-r border-leather/50 shrink-0">
      <div className="px-7 pt-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-sm bg-vellum/10 border border-vellum/20 grid place-items-center">
            <span className="font-serif text-xl italic text-vellum">C</span>
          </div>
          <span className="font-serif text-2xl italic tracking-tight text-vellum">Chronicle</span>
        </div>
      </div>

      <div className="px-4 space-y-1 flex-1">
        {items.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                active
                  ? "bg-vellum/10 text-vellum"
                  : "text-vellum/60 hover:bg-vellum/5 hover:text-vellum/90",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full transition-colors",
                  active ? "bg-seal" : "border border-vellum/30",
                )}
              />
              <Icon className="size-4 opacity-70" strokeWidth={1.5} />
              <span className="font-medium tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-7 pb-7 pt-4 border-t border-vellum/10 space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-vellum/40">Keeper</p>
          <p className="font-serif italic text-vellum/90 mt-0.5">{user}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 text-xs text-vellum/50 hover:text-seal transition-colors"
        >
          <LogOut className="size-3.5" />
          Close the volume
        </button>
        <p className="text-[10px] text-vellum/30 font-serif italic pt-2">Volume IV — MMXXVI</p>
      </div>
    </nav>
  );
}