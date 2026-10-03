-- Run once in Supabase SQL Editor. This upgrades the existing tables safely.
alter table public.audit_records add column if not exists item text;
alter table public.audit_records add column if not exists order_amount numeric default 0;
alter table public.audit_records add column if not exists invoice_amount numeric default 0;
alter table public.audit_records add column if not exists amount_difference numeric default 0;
alter table public.audit_records add column if not exists discount_percent numeric default 0;
alter table public.audit_records add column if not exists discount_amount numeric default 0;
alter table public.audit_records add column if not exists audit_checked boolean default false;
alter table public.audit_records add column if not exists updated_by uuid;
alter table public.audit_records enable row level security;
alter table public.audit_history enable row level security;
alter table public.user_profiles enable row level security;
drop policy if exists audit_records_select on public.audit_records; create policy audit_records_select on public.audit_records for select to authenticated using (true);
drop policy if exists audit_records_insert on public.audit_records; create policy audit_records_insert on public.audit_records for insert to authenticated with check (true);
drop policy if exists audit_records_update on public.audit_records; create policy audit_records_update on public.audit_records for update to authenticated using (true) with check (true);
drop policy if exists audit_history_select on public.audit_history; create policy audit_history_select on public.audit_history for select to authenticated using (true);
drop policy if exists audit_history_insert on public.audit_history; create policy audit_history_insert on public.audit_history for insert to authenticated with check (true);
drop policy if exists profiles_select on public.user_profiles; create policy profiles_select on public.user_profiles for select to authenticated using (true);
alter publication supabase_realtime add table public.audit_records;
