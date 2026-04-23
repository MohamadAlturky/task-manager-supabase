import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Task, TaskStatus, Priority, SubTask, TaskLink } from "@/types";

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
    archived: row.archived ?? false,
    archivedAt: row.archived_at ?? undefined,
  };
}

export function useArchivedTasks(username: string | null) {
  const qc = useQueryClient();
  const queryKey = ["archived-tasks", username];

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("archived", true)
        .order("archived_at", { ascending: false });
      if (error) throw error;
      return data.map(rowToTask);
    },
    enabled: !!username,
  });

  const unarchiveTask = async (id: string) => {
    const now = new Date().toISOString();
    await supabase.from("tasks").update({
      archived: false,
      archived_at: null,
      updated_at: now,
    }).eq("id", id);
    
    // Log it
    await supabase.from("activity_logs").insert({
      task_title: "Task",
      action: "unarchived",
      at: now,
    });
    
    qc.invalidateQueries({ queryKey });
    qc.invalidateQueries({ queryKey: ["tasks", username] });
    qc.invalidateQueries({ queryKey: ["logs", username] });
  };

  return { tasks, isLoading, unarchiveTask };
}
