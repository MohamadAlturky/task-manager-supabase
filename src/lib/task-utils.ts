import type { Priority } from "@/types";

export const PRIORITY_META: Record<
  Priority,
  { label: string; dot: string; ring: string; rail: string }
> = {
  low: {
    label: "Low",
    dot: "bg-muted-foreground/40",
    ring: "border-border",
    rail: "before:bg-muted-foreground/30",
  },
  medium: {
    label: "Medium",
    dot: "bg-oxide",
    ring: "border-oxide/40",
    rail: "before:bg-oxide",
  },
  high: {
    label: "High",
    dot: "bg-gold",
    ring: "border-gold/50",
    rail: "before:bg-gold",
  },
  critical: {
    label: "Urgent",
    dot: "bg-seal",
    ring: "border-seal/50",
    rail: "before:bg-seal",
  },
};

export function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatLongDate(d: Date) {
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const month = d.toLocaleDateString(undefined, { month: "long" });
  return `${weekday}, the ${ordinal(d.getDate())} of ${month}`;
}
