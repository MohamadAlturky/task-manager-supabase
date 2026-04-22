import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { NewTaskDialog } from "@/components/dashboard/NewTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Menu, LogOut, BookOpen, PanelLeft, PanelLeftClose } from "lucide-react";
import { formatLongDate } from "@/lib/task-utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLogMobile } from "@/components/dashboard/ActivityLogMobile";

type View = "today" | "backlog" | "log";

const SIDEBAR_OPEN_KEY = "chronicle-sidebar-open";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { tasks, log, createTask, toggleComplete, moveTask, deleteTask, clearLog } = useTasks(user);

  const [view, setView] = useState<View>("today");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<"today" | "backlog">("today");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_OPEN_KEY) !== "0";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, sidebarOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarOpen]);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === "today" || t.status === "done")
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === "done" ? 1 : -1;
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return order[a.priority] - order[b.priority];
        }),
    [tasks],
  );
  const backlogTasks = useMemo(
    () => tasks.filter((t) => t.status === "backlog"),
    [tasks],
  );

  const completedToday = todayTasks.filter((t) => t.status === "done").length;
  const totalToday = todayTasks.length;
  const progress = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  const today = new Date();

  function openNew(status: "today" | "backlog") {
    setDialogStatus(status);
    setDialogOpen(true);
  }

  return (
    <div className="flex min-h-dvh">
      {sidebarOpen && <Sidebar view={view} onChange={setView} />}

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-20">
          <div className="px-5 sm:px-8 lg:px-10 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile nav */}
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-leather text-vellum p-0 border-leather/50">
                  <div className="flex flex-col h-full">
                    <div className="px-7 pt-8 pb-10 flex items-center gap-3">
                      <div className="size-9 rounded-sm bg-vellum/10 border border-vellum/20 grid place-items-center">
                        <span className="font-serif text-xl italic text-vellum">C</span>
                      </div>
                      <span className="font-serif text-2xl italic">Donut</span>
                    </div>
                    <div className="px-4 space-y-1 flex-1">
                      {(["today", "backlog", "log"] as View[]).map((id) => (
                        <button
                          key={id}
                          onClick={() => {
                            setView(id);
                            setMobileNavOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-sm text-sm capitalize ${
                            view === id ? "bg-vellum/10 text-vellum" : "text-vellum/60"
                          }`}
                        >
                          {id === "today" ? "Daily Record" : id === "backlog" ? "The Backlog" : "History"}
                        </button>
                      ))}
                    </div>
                    <div className="px-7 pb-7 pt-4 border-t border-vellum/10">
                      <p className="font-serif italic text-vellum/90">{user}</p>
                      <button
                        onClick={logout}
                        className="mt-3 flex items-center gap-2 text-xs text-vellum/50 hover:text-seal"
                      >
                        <LogOut className="size-3.5" /> Close the volume
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden md:flex shrink-0 -ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen((o) => !o)}
                aria-expanded={sidebarOpen}
                aria-controls={sidebarOpen ? "app-sidebar" : undefined}
                aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="size-5" strokeWidth={1.5} />
                ) : (
                  <PanelLeft className="size-5" strokeWidth={1.5} />
                )}
              </Button>

              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground hidden sm:block">
                  Today's entry
                </p>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] leading-tight italic truncate">
                  {formatLongDate(today)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden lg:flex flex-col items-end">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Progress</p>
                <p className="font-serif italic text-foreground">
                  {completedToday}<span className="text-muted-foreground">/{totalToday}</span> · {progress}%
                </p>
              </div>
              <Button onClick={() => openNew("today")} className="rounded-full px-5 gap-2">
                <Plus className="size-4" />
                <span className="hidden sm:inline">New entry</span>
              </Button>
            </div>
          </div>

          {/* Mobile view tabs */}
          <div className="md:hidden px-5 pb-3">
            <Tabs value={view} onValueChange={(v) => setView(v as View)}>
              <TabsList className="grid grid-cols-3 w-full bg-secondary/60">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="backlog">Backlog</TabsTrigger>
                <TabsTrigger value="log">History</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Body — desktop dual columns */}
        <div className="flex-1 flex min-h-0">
          {/* Backlog column */}
          <section
            className={`${view === "backlog" ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-border/80 bg-muted/20`}
          >
            <div className="px-6 sm:px-7 pt-8 pb-5 flex items-end justify-between border-b border-border/60 bg-secondary/25">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Unwritten intentions
                </p>
                <h2 className="font-serif text-2xl italic text-accent mt-1.5 leading-tight">
                  The Backlog
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums shrink-0">
                {backlogTasks.length} item{backlogTasks.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-3 ledger-lines">
              {backlogTasks.length === 0 ? (
                <EmptyState
                  title="The margin is clear."
                  body="Capture an idea, a follow-up, or a maybe-someday — keep it here until you're ready."
                  cta="Add to backlog"
                  onAction={() => openNew("backlog")}
                />
              ) : (
                backlogTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    variant="backlog"
                    onToggle={() => toggleComplete(t.id)}
                    onMove={() => moveTask(t.id, "today")}
                    onDelete={() => deleteTask(t.id)}
                  />
                ))
              )}
            </div>

            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border/50 bg-secondary/15">
              <Button
                variant="ghost"
                onClick={() => openNew("backlog")}
                className="w-full justify-start text-muted-foreground hover:text-accent rounded-sm"
              >
                <Plus className="size-4 mr-2" /> Capture an intention
              </Button>
            </div>
          </section>

          {/* Today column */}
          <section
            className={`${view === "today" ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0 relative bg-gradient-to-br from-parchment/45 via-background/90 to-secondary/35 paper-texture`}
          >
            <div className="px-6 sm:px-7 pt-8 pb-5 flex items-end justify-between border-b border-border/60 bg-background/40 backdrop-blur-[2px]">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  In motion
                </p>
                <h2 className="font-serif text-2xl italic text-foreground mt-1.5 leading-tight">
                  The Current Passage
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums shrink-0">
                {progress}% complete
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-[2px] bg-border/80 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/80 transition-[width] duration-700 ease-out shadow-[0_0_12px_hsl(var(--accent)/0.35)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-7">
              <div className="max-w-2xl mx-auto space-y-3.5">
                {todayTasks.length === 0 ? (
                  <EmptyState
                    title="A blank page awaits."
                    body="What's the one thing that, if done today, would bring you peace? Begin there."
                    cta="Inscribe today's task"
                    onAction={() => openNew("today")}
                  />
                ) : (
                  todayTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      variant="today"
                      onToggle={() => toggleComplete(t.id)}
                      onMove={() => moveTask(t.id, "backlog")}
                      onDelete={() => deleteTask(t.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Mobile log view */}
          {view === "log" && (
            <div className="md:hidden flex-1 overflow-y-auto">
              <ActivityLogMobile log={log} onClear={clearLog} />
            </div>
          )}

          {/* Desktop activity log */}
          <ActivityLog log={log} onClear={clearLog} />
        </div>
      </main>

      <NewTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultStatus={dialogStatus}
        onCreate={createTask}
      />
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
  onAction,
}: {
  title: string;
  body: string;
  cta: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-sm border border-border/70 bg-card/60 shadow-card-soft px-6 py-12 sm:py-14 text-center animate-fade-in backdrop-blur-[2px]">
      <div className="inline-flex items-center justify-center size-12 rounded-full bg-secondary/80 border border-border/60 mb-4">
        <BookOpen className="size-5 text-accent/90" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif italic text-2xl text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">{body}</p>
      <Button onClick={onAction} variant="outline" className="mt-6 rounded-full border-accent/30 hover:bg-accent/10 hover:text-accent hover:border-accent/50">
        <Plus className="size-4 mr-2" /> {cta}
      </Button>
    </div>
  );
}