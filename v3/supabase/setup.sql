create table if not exists public.blue_bird_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.blue_bird_states enable row level security;
drop policy if exists own_state on public.blue_bird_states;
create policy own_state on public.blue_bird_states for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.blue_bird_states from anon;
grant select, insert, update on public.blue_bird_states to authenticated;
create or replace function public.save_blue_bird_state(new_payload jsonb, expected_revision bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_revision bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if expected_revision = 0 then
    insert into public.blue_bird_states(user_id, payload) values(auth.uid(), new_payload)
    on conflict do nothing returning revision into next_revision;
  else
    update public.blue_bird_states set payload = new_payload, revision = revision + 1, updated_at = now()
    where user_id = auth.uid() and revision = expected_revision returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'Another device saved changes' using errcode = '40001'; end if;
  return next_revision;
end $$;
revoke all on function public.save_blue_bird_state(jsonb,bigint) from public, anon;
grant execute on function public.save_blue_bird_state(jsonb,bigint) to authenticated;
