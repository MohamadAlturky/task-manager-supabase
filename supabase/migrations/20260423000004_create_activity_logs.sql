create table public.activity_logs (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  task_id    uuid        references public.tasks(id) on delete set null,
  task_title text        not null,
  action     text        not null,
  at         timestamptz not null default now(),
  note       text,
  constraint activity_logs_action_check check (
    action in (
      'created', 'completed', 'uncompleted',
      'moved-today', 'moved-backlog', 'deleted',
      'edited', 'step-added', 'step-completed', 'step-removed'
    )
  )
);

alter table public.activity_logs enable row level security;

create policy "logs: owner full access"
  on public.activity_logs for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_log_user_id()
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

create trigger logs_set_user_id
  before insert on public.activity_logs
  for each row execute function public.set_log_user_id();
