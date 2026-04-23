import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LogEntry } from "@/types";
import { ACTION_LABEL, ACTIVITY_LOG_PAGE_SIZE } from "@/lib/activity-log-labels";
import { formatDateTime } from "@/lib/task-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: LogEntry[];
  onClear: () => void;
};

export function ActivityHistoryTableDialog({ open, onOpenChange, log, onClear }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(log.length / ACTIVITY_LOG_PAGE_SIZE));

  const pageRows = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * ACTIVITY_LOG_PAGE_SIZE;
    return log.slice(start, start + ACTIVITY_LOG_PAGE_SIZE);
  }, [log, page, totalPages]);

  const rangeLabel = useMemo(() => {
    if (log.length === 0) return "";
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * ACTIVITY_LOG_PAGE_SIZE + 1;
    const end = Math.min(safePage * ACTIVITY_LOG_PAGE_SIZE, log.length);
    return `${start}–${end} of ${log.length}`;
  }, [log.length, page, totalPages]);

  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [log.length, totalPages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[calc(100%-2rem)] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="font-serif text-xl italic">Annotated history</DialogTitle>
          <DialogDescription>
            {log.length === 0
              ? "No entries yet."
              : `${log.length} entr${log.length === 1 ? "y" : "ies"} in order from newest to oldest.`}
          </DialogDescription>
        </DialogHeader>

        {log.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-6 py-2 border-y border-border bg-muted/15 text-xs text-muted-foreground">
            <span className="tabular-nums">{rangeLabel}</span>
            <span className="tabular-nums shrink-0">
              Page {Math.min(page, totalPages)} of {totalPages}
            </span>
          </div>
        )}

        <div className="min-h-0 max-h-[min(50vh,480px)] overflow-y-auto border-b border-border">
          {log.length === 0 ? (
            <p className="text-sm text-muted-foreground italic px-6 py-8">
              Nothing has been recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[160px] sm:w-[180px]">When</TableHead>
                  <TableHead className="w-[140px] sm:w-[160px]">Action</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell max-w-[200px]">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((entry) => {
                  const meta = ACTION_LABEL[entry.action];
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="align-top text-muted-foreground tabular-nums text-xs whitespace-nowrap">
                        {formatDateTime(entry.at)}
                      </TableCell>
                      <TableCell className="align-top font-medium text-xs">{meta.text}</TableCell>
                      <TableCell className="align-top font-serif italic text-sm">
                        {entry.taskTitle}
                      </TableCell>
                      <TableCell className="align-top text-xs text-muted-foreground hidden md:table-cell max-w-[200px]">
                        {entry.note ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {log.length > 0 && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 border-b border-border bg-muted/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex-col-reverse sm:flex-row sm:justify-between gap-2">
          {log.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:mr-auto w-full sm:w-auto"
              onClick={() => {
                onClear();
                onOpenChange(false);
              }}
            >
              Clear history
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            className={log.length === 0 ? "sm:ml-auto w-full sm:w-auto" : "w-full sm:w-auto"}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
