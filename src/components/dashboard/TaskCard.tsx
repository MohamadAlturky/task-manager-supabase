import type { Task } from "@/types";
import { PRIORITY_META, formatDate } from "@/lib/task-utils";
import { Check, ArrowLeft, ArrowRight, Trash2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  task: Task;
  variant?: "today" | "backlog";
  onToggle: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, variant = "today", onToggle, onMove, onDelete }: Props) {
  const meta = PRIORITY_META[task.priority];
  const done = task.status === "done";
  const overdue =
    !done &&
    task.dueDate &&
    new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

  return (
    <article
      className={cn(
        "group relative bg-card rounded-lg border border-border/80 shadow-card-soft p-4 sm:p-5",
        "transition-all duration-300 hover:shadow-quill hover:-translate-y-0.5",
        "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r",
        meta.rail,
        done && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-label={done ? "Mark as not done" : "Mark as done"}
          className={cn(
            "shrink-0 mt-0.5 size-5 rounded-full grid place-items-center transition-all border-2",
            done
              ? "bg-seal border-seal text-vellum"
              : "border-border hover:border-accent hover:bg-accent/5",
          )}
        >
          {done && <Check className="size-3" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <Link
            to={`/tasks/${task.id}`}
            className={cn(
              "block text-[15px] font-medium leading-snug tracking-tight hover:text-accent transition-colors",
              done && "line-through text-muted-foreground hover:text-muted-foreground",
            )}
          >
            {task.title}
          </Link>

          {task.notes && !done && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
              {task.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", meta.dot)} />
              <span className="font-medium">{meta.label}</span>
            </span>

            {task.steps && task.steps.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
                <ListChecks className="size-3" />
                {task.steps.filter((s) => s.done).length}/{task.steps.length}
              </span>
            )}

            {task.category && (
              <span className="font-serif italic text-accent text-xs">#{task.category}</span>
            )}

            {task.dueDate && (
              <span
                className={cn(
                  "tabular-nums",
                  overdue ? "text-destructive font-semibold" : "text-muted-foreground",
                )}
              >
                {overdue ? "Overdue · " : "Due "}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onMove}
            aria-label={variant === "today" ? "Send to backlog" : "Bring to today"}
            title={variant === "today" ? "Send to backlog" : "Bring to today"}
          >
            {variant === "today" ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete task"
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
