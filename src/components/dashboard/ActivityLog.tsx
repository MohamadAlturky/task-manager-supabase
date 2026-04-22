import type { LogEntry } from "@/types";
import { formatDateTime } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

const ACTION_LABEL: Record<LogEntry["action"], { text: string; tone: string }> = {
  created: { text: "Created", tone: "bg-foreground/30" },
  completed: { text: "Completed", tone: "bg-seal" },
  uncompleted: { text: "Reopened", tone: "bg-gold" },
  "moved-today": { text: "Moved to today", tone: "bg-oxide" },
  "moved-backlog": { text: "Returned to backlog", tone: "bg-foreground/30" },
  deleted: { text: "Removed", tone: "bg-destructive" },
  edited: { text: "Edited", tone: "bg-foreground/30" },
  "step-added": { text: "Step added", tone: "bg-oxide" },
  "step-completed": { text: "Step finished", tone: "bg-seal" },
  "step-removed": { text: "Step removed", tone: "bg-foreground/30" },
};

export function ActivityLog({ log, onClear }: { log: LogEntry[]; onClear: () => void }) {
  return (
    <aside className="hidden xl:flex w-72 border-l border-border bg-card/40 backdrop-blur-sm flex-col">
      <header className="px-7 pt-7 pb-4 flex items-baseline justify-between">
        <h2 className="font-serif text-xl italic">Annotated history</h2>
        {log.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-7 pb-8">
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground italic mt-4">
            Nothing has been written yet. Begin by inscribing a task — its story will be kept here.
          </p>
        ) : (
          <ol className="relative space-y-5 border-l border-border/70 ml-1.5">
            {log.map((entry) => {
              const meta = ACTION_LABEL[entry.action];
              return (
                <li key={entry.id} className="pl-5 relative animate-fade-in">
                  <span
                    className={cn(
                      "absolute -left-[5px] top-1.5 size-2.5 rounded-full ring-2 ring-card",
                      meta.tone,
                    )}
                  />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 tabular-nums">
                    {formatDateTime(entry.at)}
                  </p>
                  <p className="text-xs leading-relaxed mt-1">
                    <span className="font-medium">{meta.text}</span>{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    <span className="italic font-serif text-[15px]">{entry.taskTitle}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <footer className="px-7 py-5 border-t border-border bg-parchment/40">
        <p className="font-serif italic text-xs text-muted-foreground leading-relaxed">
          “Pacing is better than speed. Focus on the serif.”
        </p>
      </footer>
    </aside>
  );
}