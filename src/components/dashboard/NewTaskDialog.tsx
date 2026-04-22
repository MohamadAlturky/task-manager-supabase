import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Priority, TaskStatus } from "@/types";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(1, "Give it a name.").max(140),
});

interface Props {
  open: boolean;
  defaultStatus?: TaskStatus;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: {
    title: string;
    notes?: string;
    priority: Priority;
    status: TaskStatus;
    category?: string;
    dueDate?: string;
  }) => void;
}

export function NewTaskDialog({ open, onOpenChange, onCreate, defaultStatus = "today" }: Props) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setError(null);
  }, [open, defaultStatus]);

  function reset() {
    setTitle("");
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    onCreate({
      title: parsed.data.title,
      priority: "medium",
      status: defaultStatus,
    });
    reset();
    onOpenChange(false);
  }

  const isBacklog = defaultStatus === "backlog";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent
        className={[
          "sm:max-w-sm gap-0 p-0 overflow-hidden rounded-sm border-border bg-card",
          "shadow-page",
        ].join(" ")}
      >
        <div className="paper-texture px-5 pt-5 pb-4 border-b border-border/80">
          <DialogHeader className="space-y-1 text-left">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-sans">
              {isBacklog ? "The backlog" : "Today's passage"}
            </p>
            <DialogTitle className="font-serif text-2xl italic font-medium text-foreground tracking-tight pr-8">
              {isBacklog ? "Name this intention" : "Name this task"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
              {isBacklog
                ? "A short label is enough. You can open it later for detail."
                : "One line is enough to anchor what you will do today."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-4 bg-background/80" noValidate>
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-xs uppercase tracking-widest text-muted-foreground">
              Name
            </Label>
            <Input
              id="task-name"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder={isBacklog ? "e.g. Reply to Mara, tidy desk…" : "e.g. Finish the outline…"}
              autoFocus
              maxLength={140}
              className="rounded-sm border-border bg-background font-sans"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive font-sans" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-sm text-muted-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-sm">
              {isBacklog ? "Add to backlog" : "Add to today"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
