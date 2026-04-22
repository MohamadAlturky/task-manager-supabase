-- Auto-confirm every new user so no email verification step is needed.
-- This is appropriate for username-only auth where emails are synthetic
-- (username@masaj.app) and can never receive real messages.
create or replace function public.auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  new.email_confirmed_at = now();
  return new;
end;
$$;

create trigger auto_confirm_email_on_signup
  before insert on auth.users
  for each row execute function public.auto_confirm_email();
