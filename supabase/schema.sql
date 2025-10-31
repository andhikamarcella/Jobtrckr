create extension if not exists "pgcrypto";

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  position text not null,
  applied_at date not null,
  status text not null check (status in ('waiting','interview','rejected','hired')),
  notes text,
  created_at timestamptz default now()
);

-- Opsional: tambahkan kolom berikut untuk mendukung multi-user di masa depan.
-- alter table public.applications add column if not exists user_id uuid references auth.users (id);
