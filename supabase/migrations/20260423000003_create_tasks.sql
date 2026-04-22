create table public.tasks (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  title            text        not null,
  notes            text,
  goal             text,
  acceptance       text,
  estimate_minutes integer,
  steps            jsonb       not null default '[]'::jsonb,
  links            jsonb       not null default '[]'::jsonb,
  status           text        not null default 'backlog',
  priority         text        not null default 'medium',
  category         text,
  due_date         text,
  created_at       timestamptz not null default now(),
  completed_at     timestamptz,
  updated_at       timestamptz,
  constraint tasks_status_check   check (status   in ('backlog', 'today', 'done')),
  constraint tasks_priority_check check (priority in ('low', 'medium', 'high', 'critical'))
);

alter table public.tasks enable row level security;

create policy "tasks: owner full access"
  on public.tasks for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-set user_id from the authenticated session so the client never
-- needs to pass it explicitly.
create or replace function public.set_task_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$;

create trigger tasks_set_user_id
  before insert on public.tasks
  for each row execute function public.set_task_user_id();
