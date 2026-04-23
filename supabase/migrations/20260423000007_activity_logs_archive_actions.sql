-- Allow archive / unarchive in activity log (matches app LogAction type)
alter table public.activity_logs drop constraint activity_logs_action_check;

alter table public.activity_logs add constraint activity_logs_action_check check (
  action in (
    'created', 'completed', 'uncompleted',
    'moved-today', 'moved-backlog', 'deleted',
    'edited', 'step-added', 'step-completed', 'step-removed',
    'archived', 'unarchived'
  )
);
