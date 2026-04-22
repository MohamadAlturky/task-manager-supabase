import { useCallback, useEffect, useState } from "react";
import type { LogAction, LogEntry, Priority, SubTask, Task, TaskLink, TaskStatus } from "@/types";

interface UserData {
  tasks: Task[];
  log: LogEntry[];
}

const empty: UserData = { tasks: [], log: [] };

function key(username: string) {
  return `chronicle.data.${username}`;
}

function read(username: string): UserData {
  try {
    const raw = localStorage.getItem(key(username));
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { tasks: parsed.tasks ?? [], log: parsed.log ?? [] };
  } catch {
    return empty;
  }
}

function write(username: string, data: UserData) {
  localStorage.setItem(key(username), JSON.stringify(data));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useTasks(username: string | null) {
  const [data, setData] = useState<UserData>(empty);

  useEffect(() => {
    if (!username) {
      setData(empty);
      return;
    }
    setData(read(username));
  }, [username]);

  const persist = useCallback(
    (next: UserData) => {
      setData(next);
      if (username) write(username, next);
    },
    [username],
  );

  const addLog = useCallback(
    (entry: Omit<LogEntry, "id" | "at">, base: UserData): UserData => ({
      ...base,
      log: [{ id: uid(), at: new Date().toISOString(), ...entry }, ...base.log].slice(0, 200),
    }),
    [],
  );

  const createTask = useCallback(
    (input: { title: string; notes?: string; priority: Priority; status: TaskStatus; category?: string; dueDate?: string }) => {
      const task: Task = {
        id: uid(),
        title: input.title.trim(),
        notes: input.notes?.trim() || undefined,
        priority: input.priority,
        status: input.status,
        category: input.category?.trim() || undefined,
        dueDate: input.dueDate || undefined,
        createdAt: new Date().toISOString(),
      };
      const next: UserData = { ...data, tasks: [task, ...data.tasks] };
      persist(addLog({ taskId: task.id, taskTitle: task.title, action: "created" }, next));
    },
    [data, persist, addLog],
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const target = data.tasks.find((t) => t.id === id);
      if (!target) return;
      const isDone = target.status === "done";
      const updated: Task = isDone
        ? { ...target, status: "today", completedAt: undefined }
        : { ...target, status: "done", completedAt: new Date().toISOString() };
      const next: UserData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === id ? updated : t)),
      };
      persist(
        addLog(
          { taskId: id, taskTitle: target.title, action: isDone ? "uncompleted" : "completed" },
          next,
        ),
      );
    },
    [data, persist, addLog],
  );

  const moveTask = useCallback(
    (id: string, status: TaskStatus) => {
      const target = data.tasks.find((t) => t.id === id);
      if (!target || target.status === status) return;
      const next: UserData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === id ? { ...t, status, completedAt: status === "done" ? new Date().toISOString() : undefined } : t)),
      };
      const action: LogAction =
        status === "today" ? "moved-today" : status === "backlog" ? "moved-backlog" : "completed";
      persist(addLog({ taskId: id, taskTitle: target.title, action }, next));
    },
    [data, persist, addLog],
  );

  const deleteTask = useCallback(
    (id: string) => {
      const target = data.tasks.find((t) => t.id === id);
      if (!target) return;
      const next: UserData = { ...data, tasks: data.tasks.filter((t) => t.id !== id) };
      persist(addLog({ taskId: id, taskTitle: target.title, action: "deleted" }, next));
    },
    [data, persist, addLog],
  );

  const clearLog = useCallback(() => {
    persist({ ...data, log: [] });
  }, [data, persist]);

  const updateTask = useCallback(
    (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => {
      const target = data.tasks.find((t) => t.id === id);
      if (!target) return;
      const updated: Task = { ...target, ...patch, updatedAt: new Date().toISOString() };
      const next: UserData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === id ? updated : t)),
      };
      persist(addLog({ taskId: id, taskTitle: updated.title, action: "edited" }, next));
    },
    [data, persist, addLog],
  );

  const addStep = useCallback(
    (taskId: string, title: string) => {
      const target = data.tasks.find((t) => t.id === taskId);
      if (!target || !title.trim()) return;
      const step: SubTask = {
        id: uid(),
        title: title.trim(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      const updated: Task = {
        ...target,
        steps: [...(target.steps ?? []), step],
        updatedAt: new Date().toISOString(),
      };
      const next: UserData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === taskId ? updated : t)),
      };
      persist(
        addLog(
          { taskId, taskTitle: target.title, action: "step-added", note: step.title },
          next,
        ),
      );
    },
    [data, persist, addLog],
  );

  const toggleStep = useCallback(
    (taskId: string, stepId: string) => {
      const target = data.tasks.find((t) => t.id === taskId);
      if (!target?.steps) return;
      const step = target.steps.find((s) => s.id === stepId);
      if (!step) return;
      const nowDone = !step.done;
      const updated: Task = {
        ...target,
        steps: target.steps.map((s) =>
          s.id === stepId
            ? { ...s, done: nowDone, completedAt: nowDone ? new Date().toISOString() : undefined }
            : s,
        ),
        updatedAt: new Date().toISOString(),
      };
      const next: UserData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === taskId ? updated : t)),
      };
      persist(
        nowDone
          ? addLog(
              { taskId, taskTitle: target.title, action: "step-completed", note: step.title },
              next,
            )
          : next,
      );
    },
    [data, persist, addLog],
  );

  const removeStep = useCallback(
    (taskId: string, stepId: string) => {
      const target = data.tasks.find((t) => t.id === taskId);
      if (!target?.steps) return;
      const step = target.steps.find((s) => s.id === stepId);
      const updated: Task = {
        ...target,
        steps: target.steps.filter((s) => s.id !== stepId),
        updatedAt: new Date().toISOString(),
      };
      const next: UserData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === taskId ? updated : t)),
      };
      persist(
        addLog(
          { taskId, taskTitle: target.title, action: "step-removed", note: step?.title },
          next,
        ),
      );
    },
    [data, persist, addLog],
  );

  const addLink = useCallback(
    (taskId: string, link: Omit<TaskLink, "id">) => {
      const target = data.tasks.find((t) => t.id === taskId);
      if (!target) return;
      const newLink: TaskLink = { id: uid(), ...link };
      const updated: Task = {
        ...target,
        links: [...(target.links ?? []), newLink],
        updatedAt: new Date().toISOString(),
      };
      persist({
        ...data,
        tasks: data.tasks.map((t) => (t.id === taskId ? updated : t)),
      });
    },
    [data, persist],
  );

  const removeLink = useCallback(
    (taskId: string, linkId: string) => {
      const target = data.tasks.find((t) => t.id === taskId);
      if (!target?.links) return;
      const updated: Task = {
        ...target,
        links: target.links.filter((l) => l.id !== linkId),
        updatedAt: new Date().toISOString(),
      };
      persist({
        ...data,
        tasks: data.tasks.map((t) => (t.id === taskId ? updated : t)),
      });
    },
    [data, persist],
  );

  return {
    tasks: data.tasks,
    log: data.log,
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