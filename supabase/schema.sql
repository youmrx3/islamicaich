-- Thabat — Supabase schema. Run once in Supabase → SQL Editor.
-- Stores problem reports (no user identifiers), specialist review decisions and
-- reviewer accounts (name, email, qualification; emails readable only by the server).
-- Existing projects: run supabase/migrations/002_reviewers.sql instead of this file.

create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  kind        text not null default 'problem' check (kind in ('problem','request_review','suggest_source')),
  quote       text not null check (char_length(quote) <= 1000),
  status      text not null check (char_length(status) <= 40),
  evidence_id text check (char_length(evidence_id) <= 60),
  comment     text not null default '' check (char_length(comment) <= 1000),
  state       text not null default 'open' check (state in ('open','resolved','rejected'))
);

create table if not exists public.reviewers (
  id          uuid primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (char_length(email) between 5 and 200),
  title       text not null check (char_length(title) between 2 and 200),   -- qualification / speciality
  affiliation text not null default '' check (char_length(affiliation) <= 200),
  profile_url text not null default '' check (char_length(profile_url) <= 300),
  note        text not null default '' check (char_length(note) <= 1000),
  status      text not null default 'pending' check (status in ('pending','approved','rejected','revoked')),
  token_hash  text unique,                                                   -- sha256 of the access code
  decided_at  timestamptz
);

create table if not exists public.review_decisions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  entry_id    text not null,                       -- register entry, e.g. R001
  decision    text not null check (decision in ('approved','needs_edit','rejected')),
  reviewer    text not null check (char_length(reviewer) between 2 and 120),
  reviewer_id uuid references public.reviewers(id),               -- null when signed by the admin
  note        text not null default '' check (char_length(note) <= 2000)
);

alter table public.reports enable row level security;
alter table public.review_decisions enable row level security;
alter table public.reviewers enable row level security;  -- no policies: server only

-- The public (anon) key may only INSERT reports; nobody can read them with it.
drop policy if exists "anon can insert reports" on public.reports;
create policy "anon can insert reports" on public.reports for insert to anon with check (true);

-- Review decisions are written and read by the server with the service_role key
-- (which bypasses RLS). Optionally allow public read of decisions (no personal data):
drop policy if exists "public can read decisions" on public.review_decisions;
create policy "public can read decisions" on public.review_decisions for select to anon using (true);
