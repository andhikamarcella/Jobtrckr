create extension if not exists "pgcrypto";

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  company text not null,
  position text not null,
  applied_at date not null,
  status text not null check (status in ('waiting','interview','rejected','hired')),
  notes text,
  created_at timestamptz default now()
);

alter table public.applications enable row level security;

create policy "Users can select their own applications"
  on public.applications
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own applications"
  on public.applications
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own applications"
  on public.applications
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own applications"
  on public.applications
  for delete
  using (auth.uid() = user_id);
