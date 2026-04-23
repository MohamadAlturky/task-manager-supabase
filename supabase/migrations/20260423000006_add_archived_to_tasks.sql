-- Add archived boolean flag and archived_at timestamp to tasks
alter table public.tasks
  add column archived boolean not null default false,
  add column archived_at timestamptz;
