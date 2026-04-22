create or replace function public.get_email_by_username(p_username text)
returns text
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := lower(trim(p_username));

  if not exists (
    select 1 from public.profiles where username = v_username
  ) then
    return null;
  end if;

  return v_username || '@masaj.app';
end;
$$;

grant execute on function public.get_email_by_username(text) to anon, authenticated;
