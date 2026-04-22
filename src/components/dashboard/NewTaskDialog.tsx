import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Priority, TaskStatus } from "@/types";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(1, "Give it a name.").max(140),
  notes: z.string().trim().max(500).optional(),
  category: z.string().trim().max(40).optional(),
  dueDate: z.string().optional(),
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
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setNotes("");
    setCategory("");
    setDueDate("");
    setPriority("medium");
    setStatus(defaultStatus);
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ title, notes, category, dueDate });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    onCreate({
      title: parsed.data.title,
      notes: parsed.data.notes || undefined,
      category: parsed.data.category || undefined,
      dueDate: parsed.data.dueDate || undefined,
      priority,
      status,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl italic font-medium">New entry</DialogTitle>
          <DialogDescription>Inscribe a task into your ledger.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              autoFocus
              maxLength={140}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional context, thoughts, references…"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Place in</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today's passage</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category / tag</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Strategy, Home…"
                maxLength={40}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Inscribe</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
