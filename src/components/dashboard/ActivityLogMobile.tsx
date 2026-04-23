import { useMemo, useState } from "react";
import type { LogEntry } from "@/types";
import { ACTIVITY_LOG_PREVIEW_LIMIT, ACTION_LABEL } from "@/lib/activity-log-labels";
import { formatDateTime } from "@/lib/task-utils";
import { cn } from "@/lib/utils";
import { ActivityHistoryTableDialog } from "@/components/dashboard/ActivityHistoryTableDialog";

export function ActivityLogMobile({ log, onClear }: { log: LogEntry[]; onClear: () => void }) {
  const [tableOpen, setTableOpen] = useState(false);

  const preview = useMemo(
    () => log.slice(0, ACTIVITY_LOG_PREVIEW_LIMIT),
    [log],
  );

  return (
    <>
      <div className="px-6 py-7">
        <div className="flex items-baseline justify-between mb-5 gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Annotated</p>
            <button
              type="button"
              onClick={() => setTableOpen(true)}
              className="group text-left mt-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-haspopup="dialog"
              aria-expanded={tableOpen}
            >
              <h2 className="font-serif text-2xl italic group-hover:text-accent transition-colors">History</h2>
              {log.length > ACTIVITY_LOG_PREVIEW_LIMIT && (
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  Last {ACTIVITY_LOG_PREVIEW_LIMIT} shown · open full list
                </p>
              )}
            </button>
          </div>
          {log.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors shrink-0"
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
            {preview.map((entry) => {
              const meta = ACTION_LABEL[entry.action];
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

      <ActivityHistoryTableDialog
        open={tableOpen}
        onOpenChange={setTableOpen}
        log={log}
        onClear={onClear}
      />
    </>
  );
}
