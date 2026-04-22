import type { LogEntry } from "@/types";
import { formatDateTime } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

const TONE: Record<LogEntry["action"], { text: string; tone: string }> = {
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

export function ActivityLogMobile({ log, onClear }: { log: LogEntry[]; onClear: () => void }) {
  return (
    <div className="px-6 py-7">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Annotated</p>
          <h2 className="font-serif text-2xl italic mt-1">History</h2>
        </div>
        {log.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {log.length === 0 ? (
        <p className="text-sm text-muted-foreground italic mt-4">
          Nothing has been written yet.
        </p>
      ) : (
        <ol className="relative space-y-5 border-l border-border ml-1.5">
          {log.map((entry) => {
            const meta = TONE[entry.action];
            return (
              <li key={entry.id} className="pl-5 relative">
                <span
                  className={cn(
                    "absolute -left-[5px] top-1.5 size-2.5 rounded-full ring-2 ring-background",
                    meta.tone,
                  )}
                />
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
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
  );
}
