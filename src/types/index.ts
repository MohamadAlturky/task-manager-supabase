export type Priority = "low" | "medium" | "high" | "critical";

export type TaskStatus = "backlog" | "today" | "done";

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface TaskLink {
  id: string;
  label: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  /** The "why" — the outcome this task serves. */
  goal?: string;
  /** Definition of done — observable conditions. */
  acceptance?: string;
  /** Estimated time in minutes. */
  estimateMinutes?: number;
  /** Ordered checklist of steps. */
  steps?: SubTask[];
  /** External references / links. */
  links?: TaskLink[];
  status: TaskStatus;
  priority: Priority;
  category?: string;
  dueDate?: string; // ISO
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export type LogAction =
  | "created"
  | "completed"
  | "uncompleted"
  | "moved-today"
  | "moved-backlog"
  | "deleted"
  | "edited"
  | "step-added"
  | "step-completed"
  | "step-removed";

export interface LogEntry {
  id: string;
  taskId?: string;
  taskTitle: string;
  action: LogAction;
  at: string;
  note?: string;
}

export interface StoredUser {
  username: string;
  // Note: this is a local-only demo app. Passwords are hashed (SHA-256) but
  // localStorage is not a secure auth mechanism — see README.
  passwordHash: string;
  createdAt: string;
}