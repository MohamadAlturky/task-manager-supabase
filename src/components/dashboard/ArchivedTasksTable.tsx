import { useState, useMemo } from "react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, RotateCcw, Search } from "lucide-react";
import { useArchivedTasks } from "@/hooks/useArchivedTasks";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRIORITY_META } from "@/lib/task-utils";

export function ArchivedTasksTable() {
  const { user } = useAuth();
  const { tasks, isLoading, unarchiveTask } = useArchivedTasks(user);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
      
      let matchDate = true;
      if (task.archivedAt) {
        const archivedDate = new Date(task.archivedAt);
        if (dateFrom && isBefore(archivedDate, startOfDay(dateFrom))) {
          matchDate = false;
        }
        if (dateTo && isAfter(archivedDate, endOfDay(dateTo))) {
          matchDate = false;
        }
      } else if (dateFrom || dateTo) {
        matchDate = false;
      }

      return matchSearch && matchDate;
    });
  }, [tasks, search, dateFrom, dateTo]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full pt-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search archived tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : <span>From</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-sm">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : <span>To</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {(dateFrom || dateTo || search) && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setDateFrom(undefined);
                setDateTo(undefined);
                setSearch("");
              }}
              className="px-3"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Archived Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No archived tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const meta = PRIORITY_META[task.priority];
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
                        <span className={cn("size-1.5 rounded-full shrink-0", meta.dot)} />
                        {meta.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {task.archivedAt ? format(new Date(task.archivedAt), "PPP p") : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unarchiveTask(task.id)}
                        className="h-8 gap-2"
                      >
                        <RotateCcw className="size-3.5" />
                        <span className="hidden sm:inline">Unarchive</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
