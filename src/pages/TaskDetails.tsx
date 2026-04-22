import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Flag,
  GripVertical,
  Link as LinkIcon,
  Pencil,
  Plus,
  Save,
  Tag,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { PRIORITY_META, formatDate, formatDateTime } from "@/lib/task-utils";
import { cn } from "@/lib/utils";
import type { Priority, TaskStatus } from "@/types";

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    tasks,
    log,
    updateTask,
    addStep,
    toggleStep,
    removeStep,
    addLink,
    removeLink,
    deleteTask,
    toggleComplete,
    moveTask,
  } = useTasks(user);

  const task = tasks.find((t) => t.id === id);

  const taskLog = useMemo(
    () => log.filter((entry) => entry.taskId === id).slice(0, 50),
    [log, id],
  );

  // local edit state
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task?.title ?? "");
  const [draftGoal, setDraftGoal] = useState(task?.goal ?? "");
  const [draftNotes, setDraftNotes] = useState(task?.notes ?? "");
  const [draftAcceptance, setDraftAcceptance] = useState(task?.acceptance ?? "");
  const [draftCategory, setDraftCategory] = useState(task?.category ?? "");
  const [draftDue, setDraftDue] = useState(task?.dueDate ?? "");
  const [draftPriority, setDraftPriority] = useState<Priority>(task?.priority ?? "medium");
  const [draftEstimate, setDraftEstimate] = useState<string>(
    task?.estimateMinutes ? String(task.estimateMinutes) : "",
  );

  const [newStep, setNewStep] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  if (!task) {
    return (
      <div className="min-h-dvh grid place-items-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Page missing
          </p>
          <h1 className="font-serif text-4xl italic mt-3">This entry could not be found.</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            It may have been removed from your ledger, or the link is no longer valid.
          </p>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link to="/">
              <ArrowLeft className="size-4 mr-2" /> Return to the ledger
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const meta = PRIORITY_META[task.priority];
  const steps = task.steps ?? [];
  const links = task.links ?? [];
  const stepsDone = steps.filter((s) => s.done).length;
  const stepsProgress = steps.length === 0 ? 0 : Math.round((stepsDone / steps.length) * 100);
  const isDone = task.status === "done";
  const overdue =
    !isDone && task.dueDate && new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

  function startEdit() {
    setDraftTitle(task.title);
    setDraftGoal(task.goal ?? "");
    setDraftNotes(task.notes ?? "");
    setDraftAcceptance(task.acceptance ?? "");
    setDraftCategory(task.category ?? "");
    setDraftDue(task.dueDate ?? "");
    setDraftPriority(task.priority);
    setDraftEstimate(task.estimateMinutes ? String(task.estimateMinutes) : "");
    setEditing(true);
  }

  function saveEdit() {
    if (!draftTitle.trim()) return;
    const estimateNum = parseInt(draftEstimate, 10);
    updateTask(task.id, {
      title: draftTitle.trim(),
      goal: draftGoal.trim() || undefined,
      notes: draftNotes.trim() || undefined,
      acceptance: draftAcceptance.trim() || undefined,
      category: draftCategory.trim() || undefined,
      dueDate: draftDue || undefined,
      priority: draftPriority,
      estimateMinutes: !Number.isNaN(estimateNum) && estimateNum > 0 ? estimateNum : undefined,
    });
    setEditing(false);
  }

  function handleAddStep(e: React.FormEvent) {
    e.preventDefault();
    if (!newStep.trim()) return;
    addStep(task.id, newStep);
    setNewStep("");
  }

  function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;
    addLink(task.id, {
      label: newLinkLabel.trim() || newLinkUrl.trim(),
      url: newLinkUrl.trim(),
    });
    setNewLinkLabel("");
    setNewLinkUrl("");
  }

  function handleStatusChange(value: TaskStatus) {
    if (value === task.status) return;
    moveTask(task.id, value);
  }

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="-ml-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 mr-2" /> Ledger
          </Button>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  <X className="size-4 mr-2" /> Cancel
                </Button>
                <Button onClick={saveEdit}>
                  <Save className="size-4 mr-2" /> Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={startEdit} className="rounded-full">
                  <Pencil className="size-3.5 mr-2" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif italic text-2xl">
                        Strike this entry from the ledger?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. The task and its steps will be removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteTask(task.id);
                          navigate("/");
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8 lg:py-12 grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
        {/* Main column */}
        <div className="min-w-0 space-y-10">
          {/* Title + status */}
          <section>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", meta.dot)} />
              <span>{meta.label} priority</span>
              {task.category && (
                <>
                  <span>·</span>
                  <span className="font-serif italic text-accent normal-case tracking-normal text-xs">
                    #{task.category}
                  </span>
                </>
              )}
            </div>

            {editing ? (
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="mt-3 font-serif italic text-3xl sm:text-4xl h-auto py-2 border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent"
                placeholder="Title"
              />
            ) : (
              <h1
                className={cn(
                  "font-serif italic text-3xl sm:text-4xl lg:text-5xl mt-3 leading-tight",
                  isDone && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h1>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleComplete(task.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors",
                  isDone
                    ? "bg-seal text-vellum border-seal"
                    : "border-border hover:border-accent hover:text-accent",
                )}
              >
                <CheckCircle2 className="size-3.5" />
                {isDone ? "Completed" : "Mark complete"}
              </button>

              <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                <SelectTrigger className="w-auto h-8 rounded-full text-xs border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today's passage</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              {overdue && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                  <Clock className="size-3" /> Overdue
                </span>
              )}
            </div>
          </section>

          {/* Goal */}
          <Section
            icon={<Target className="size-4" />}
            label="The Goal"
            hint="Why this matters — the outcome it serves."
          >
            {editing ? (
              <Textarea
                value={draftGoal}
                onChange={(e) => setDraftGoal(e.target.value)}
                placeholder="What does success look like? Who benefits?"
                rows={3}
              />
            ) : task.goal ? (
              <p className="font-serif italic text-lg leading-relaxed text-foreground/90">
                {task.goal}
              </p>
            ) : (
              <EmptyHint onAdd={startEdit} text="No goal set. Naming the why sharpens the doing." />
            )}
          </Section>

          {/* Steps */}
          <Section
            icon={<CheckCircle2 className="size-4" />}
            label="Steps"
            hint={
              steps.length > 0
                ? `${stepsDone} of ${steps.length} finished · ${stepsProgress}%`
                : "Break it into small, observable actions."
            }
          >
            {steps.length > 0 && (
              <div className="mb-4">
                <Progress value={stepsProgress} className="h-1" />
              </div>
            )}

            <ul className="space-y-1">
              {steps.map((step) => (
                <li
                  key={step.id}
                  className="group flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                >
                  <GripVertical className="size-3.5 mt-1 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
                  <Checkbox
                    checked={step.done}
                    onCheckedChange={() => toggleStep(task.id, step.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        step.done && "line-through text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    {step.completedAt && step.done && (
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-0.5">
                        Finished {formatDateTime(step.completedAt)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(task.id, step.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                    aria-label="Remove step"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddStep} className="mt-3 flex gap-2">
              <Input
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="Add a step…"
                className="flex-1"
              />
              <Button type="submit" variant="outline" size="icon" disabled={!newStep.trim()}>
                <Plus className="size-4" />
              </Button>
            </form>
          </Section>

          {/* Notes */}
          <Section
            icon={<Pencil className="size-4" />}
            label="Notes & context"
            hint="Thoughts, references, decisions, anything worth remembering."
          >
            {editing ? (
              <Textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Optional context…"
                rows={5}
              />
            ) : task.notes ? (
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">
                {task.notes}
              </p>
            ) : (
              <EmptyHint onAdd={startEdit} text="No notes yet." />
            )}
          </Section>

          {/* Definition of done */}
          <Section
            icon={<Flag className="size-4" />}
            label="Definition of done"
            hint="How will you know this is truly finished?"
          >
            {editing ? (
              <Textarea
                value={draftAcceptance}
                onChange={(e) => setDraftAcceptance(e.target.value)}
                placeholder="e.g. Draft sent to editor, confirmation received…"
                rows={3}
              />
            ) : task.acceptance ? (
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">
                {task.acceptance}
              </p>
            ) : (
              <EmptyHint onAdd={startEdit} text="No completion criteria set." />
            )}
          </Section>

          {/* Links */}
          <Section
            icon={<LinkIcon className="size-4" />}
            label="References & links"
            hint="Documents, articles, or anything worth keeping nearby."
          >
            {links.length > 0 && (
              <ul className="space-y-2 mb-3">
                {links.map((link) => (
                  <li
                    key={link.id}
                    className="group flex items-center gap-3 px-3 py-2 rounded-md border border-border/70 bg-card/60 hover:border-accent/40 transition-colors"
                  >
                    <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex-1 min-w-0 truncate hover:text-accent ink-underline pb-0.5"
                    >
                      {link.label}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeLink(task.id, link.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      aria-label="Remove link"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddLink} className="grid sm:grid-cols-[1fr_2fr_auto] gap-2">
              <Input
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                placeholder="Label (optional)"
              />
              <Input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://…"
                type="url"
              />
              <Button type="submit" variant="outline" disabled={!newLinkUrl.trim()}>
                <Plus className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </form>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-border bg-card/60 backdrop-blur-sm shadow-card-soft">
            <div className="px-5 py-4 border-b border-border/70">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Particulars
              </p>
            </div>
            <dl className="px-5 py-4 space-y-4 text-sm">
              <Detail icon={<Flag className="size-3.5" />} label="Priority">
                {editing ? (
                  <Select
                    value={draftPriority}
                    onValueChange={(v) => setDraftPriority(v as Priority)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className={cn("size-1.5 rounded-full", meta.dot)} />
                    {meta.label}
                  </span>
                )}
              </Detail>

              <Detail icon={<Calendar className="size-3.5" />} label="Due">
                {editing ? (
                  <Input
                    type="date"
                    value={draftDue}
                    onChange={(e) => setDraftDue(e.target.value)}
                    className="h-8 text-xs"
                  />
                ) : task.dueDate ? (
                  <span
                    className={cn(
                      "tabular-nums",
                      overdue && "text-destructive font-medium",
                    )}
                  >
                    {formatDate(task.dueDate)}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </Detail>

              <Detail icon={<Tag className="size-3.5" />} label="Category">
                {editing ? (
                  <Input
                    value={draftCategory}
                    onChange={(e) => setDraftCategory(e.target.value)}
                    placeholder="e.g. Strategy"
                    className="h-8 text-xs"
                    maxLength={40}
                  />
                ) : task.category ? (
                  <span className="font-serif italic text-accent">#{task.category}</span>
                ) : (
                  <span className="text-muted-foreground italic">None</span>
                )}
              </Detail>

              <Detail icon={<Clock className="size-3.5" />} label="Estimate">
                {editing ? (
                  <Input
                    type="number"
                    min={0}
                    value={draftEstimate}
                    onChange={(e) => setDraftEstimate(e.target.value)}
                    placeholder="minutes"
                    className="h-8 text-xs"
                  />
                ) : task.estimateMinutes ? (
                  <span className="tabular-nums">
                    {formatEstimate(task.estimateMinutes)}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">—</span>
                )}
              </Detail>

              <div className="pt-3 mt-3 border-t border-border/70 space-y-2 text-xs text-muted-foreground">
                <p>
                  <span className="uppercase tracking-widest text-[10px]">Inscribed</span>
                  <br />
                  <span className="text-foreground/80 tabular-nums">
                    {formatDateTime(task.createdAt)}
                  </span>
                </p>
                {task.updatedAt && (
                  <p>
                    <span className="uppercase tracking-widest text-[10px]">Last edited</span>
                    <br />
                    <span className="text-foreground/80 tabular-nums">
                      {formatDateTime(task.updatedAt)}
                    </span>
                  </p>
                )}
                {task.completedAt && (
                  <p>
                    <span className="uppercase tracking-widest text-[10px]">Completed</span>
                    <br />
                    <span className="text-foreground/80 tabular-nums">
                      {formatDateTime(task.completedAt)}
                    </span>
                  </p>
                )}
              </div>
            </dl>
          </div>

          {/* Per-task activity */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              This entry's history
            </p>
            {taskLog.length === 0 ? (
              <p className="text-xs italic text-muted-foreground">No history yet.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-border/70 ml-1">
                {taskLog.map((entry) => (
                  <li key={entry.id} className="pl-4 relative">
                    <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-foreground/40 ring-2 ring-background" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
                      {formatDateTime(entry.at)}
                    </p>
                    <p className="text-xs mt-0.5">
                      <span className="font-medium capitalize">
                        {entry.action.replace("-", " ")}
                      </span>
                      {entry.note && (
                        <span className="text-muted-foreground"> · {entry.note}</span>
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Section({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className="text-accent">{icon}</span>
          {label}
        </div>
        {hint && (
          <p className="font-serif italic text-sm text-muted-foreground mt-1">{hint}</p>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-3">
      <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function EmptyHint({ text, onAdd }: { text: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="w-full text-left text-sm italic text-muted-foreground border border-dashed border-border rounded-md px-4 py-3 hover:border-accent/50 hover:text-foreground transition-colors"
    >
      {text} <span className="not-italic underline">Edit to add.</span>
    </button>
  );
}

function formatEstimate(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
