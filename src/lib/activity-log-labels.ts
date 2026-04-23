import type { LogEntry } from "@/types";

/** Page size for the full history table and preview strip in the sidebar / mobile. */
export const ACTIVITY_LOG_PAGE_SIZE = 10;

export const ACTIVITY_LOG_PREVIEW_LIMIT = ACTIVITY_LOG_PAGE_SIZE;

export const ACTION_LABEL: Record<LogEntry["action"], { text: string; tone: string }> = {
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
  archived: { text: "Archived", tone: "bg-foreground/30" },
  unarchived: { text: "Unarchived", tone: "bg-foreground/30" },
};
