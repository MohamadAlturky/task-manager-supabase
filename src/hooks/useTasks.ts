import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Task, LogEntry, TaskStatus, Priority, LogAction, SubTask, TaskLink } from "@/types";

// ── Row mappers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? undefined,
    goal: row.goal ?? undefined,
    acceptance: row.acceptance ?? undefined,
    estimateMinutes: row.estimate_minutes ?? undefined,
    steps: (row.steps as SubTask[]) ?? [],
    links: (row.links as TaskLink[]) ?? [],
    status: row.status as TaskStatus,
    priority: row.priority as Priority,
    category: row.category ?? undefined,
    dueDate: row.due_date ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToLog(row: any): LogEntry {
  return {
    id: row.id,
    taskId: row.task_id ?? undefined,
    taskTitle: row.task_title,
    action: row.action as LogAction,
    at: row.at,
    note: row.note ?? undefined,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTasks(username: string | null) {
  const qc = useQueryClient();
  const tasksKey = ["tasks", username];
  const logsKey = ["logs", username];

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: tasksKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(rowToTask);
    },
    enabled: !!username,
    staleTime: 60_000,
  });

  const { data: log = [] } = useQuery<LogEntry[]>({
    queryKey: logsKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data.map(rowToLog);
    },
    enabled: !!username,
    staleTime: 60_000,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  function invalidate() {
    qc.invalidateQueries({ queryKey: tasksKey });
    qc.invalidateQueries({ queryKey: logsKey });
  }

  async function addLog(entry: {
    taskId?: string;
    taskTitle: string;
    action: LogAction;
    note?: string;
  }) {
    await supabase.from("activity_logs").insert({
      task_id: entry.taskId ?? null,
      task_title: entry.taskTitle,
      action: entry.action,
      at: new Date().toISOString(),
      note: entry.note ?? null,
    });
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  async function createTask(input: {
    title: string;
    notes?: string;
    priority: Priority;
    status: TaskStatus;
    category?: string;
    dueDate?: string;
  }) {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: input.title,
        notes: input.notes ?? null,
        priority: input.priority,
        status: input.status,
        category: input.category ?? null,
        due_date: input.dueDate ?? null,
      })
      .select("id, title")
      .single();
    if (error) throw error;
    await addLog({ taskId: data.id, taskTitle: data.title, action: "created" });
    invalidate();
  }

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const isDone = task.status === "done";
    const now = new Date().toISOString();
    await supabase.from("tasks").update({
      status: isDone ? "backlog" : "done",
      completed_at: isDone ? null : now,
      updated_at: now,
    }).eq("id", id);
    await addLog({ taskId: id, taskTitle: task.title, action: isDone ? "uncompleted" : "completed" });
    invalidate();
  }

  async function moveTask(id: string, status: TaskStatus) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const now = new Date().toISOString();
    const action: LogAction =
      status === "done" ? "completed" :
      status === "today" ? "moved-today" : "moved-backlog";
    await supabase.from("tasks").update({
      status,
      completed_at: status === "done" ? now : null,
      updated_at: now,
    }).eq("id", id);
    await addLog({ taskId: id, taskTitle: task.title, action });
    invalidate();
  }

  async function deleteTask(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await supabase.from("tasks").delete().eq("id", id);
    await addLog({ taskTitle: task.title, action: "deleted" });
    invalidate();
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined)           update.title            = patch.title;
    if (patch.notes !== undefined)           update.notes            = patch.notes || null;
    if (patch.goal !== undefined)            update.goal             = patch.goal || null;
    if (patch.acceptance !== undefined)      update.acceptance       = patch.acceptance || null;
    if (patch.estimateMinutes !== undefined) update.estimate_minutes = patch.estimateMinutes ?? null;
    if (patch.priority !== undefined)        update.priority         = patch.priority;
    if (patch.status !== undefined)          update.status           = patch.status;
    if (patch.category !== undefined)        update.category         = patch.category || null;
    if (patch.dueDate !== undefined)         update.due_date         = patch.dueDate || null;
    if (patch.steps !== undefined)           update.steps            = patch.steps;
    if (patch.links !== undefined)           update.links            = patch.links;
    await supabase.from("tasks").update(update).eq("id", id);
    await addLog({ taskId: id, taskTitle: patch.title ?? task.title, action: "edited" });
    invalidate();
  }

  async function addStep(taskId: string, title: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !title.trim()) return;
    const step: SubTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    const steps = [...(task.steps ?? []), step];
    await supabase.from("tasks").update({ steps, updated_at: new Date().toISOString() }).eq("id", taskId);
    await addLog({ taskId, taskTitle: task.title, action: "step-added", note: step.title });
    invalidate();
  }

  async function toggleStep(taskId: string, stepId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.steps) return;
    const now = new Date().toISOString();
    const steps = task.steps.map((s) =>
      s.id === stepId ? { ...s, done: !s.done, completedAt: s.done ? undefined : now } : s
    );
    await supabase.from("tasks").update({ steps, updated_at: now }).eq("id", taskId);
    const toggled = steps.find((s) => s.id === stepId);
    if (toggled?.done) {
      await addLog({ taskId, taskTitle: task.title, action: "step-completed", note: toggled.title });
    }
    invalidate();
  }

  async function removeStep(taskId: string, stepId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.steps) return;
    const removed = task.steps.find((s) => s.id === stepId);
    const steps = task.steps.filter((s) => s.id !== stepId);
    await supabase.from("tasks").update({ steps, updated_at: new Date().toISOString() }).eq("id", taskId);
    await addLog({ taskId, taskTitle: task.title, action: "step-removed", note: removed?.title });
    invalidate();
  }

  async function addLink(taskId: string, link: Omit<TaskLink, "id">) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newLink: TaskLink = { id: crypto.randomUUID(), ...link };
    const links = [...(task.links ?? []), newLink];
    await supabase.from("tasks").update({ links, updated_at: new Date().toISOString() }).eq("id", taskId);
    invalidate();
  }

  async function removeLink(taskId: string, linkId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.links) return;
    const links = task.links.filter((l) => l.id !== linkId);
    await supabase.from("tasks").update({ links, updated_at: new Date().toISOString() }).eq("id", taskId);
    invalidate();
  }

  async function clearLog() {
    await supabase.from("activity_logs").delete().not("id", "is", null);
    qc.invalidateQueries({ queryKey: logsKey });
  }

  return {
    tasks,
    log,
    createTask,
    toggleComplete,
    moveTask,
    deleteTask,
    clearLog,
    updateTask,
    addStep,
    toggleStep,
    removeStep,
    addLink,
    removeLink,
  };
}
