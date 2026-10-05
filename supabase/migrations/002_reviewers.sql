-- Thabat — migration 002: reviewer accounts.
-- Run once in Supabase → SQL Editor (safe to run again).
-- Flow: a specialist applies on /join → the admin approves on /review → the server
-- issues a personal access code (only its SHA-256 hash is stored) → decisions are
-- signed with the reviewer's verified name.

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

-- Row-level security with NO policies: only the server (service_role key) can read
-- or write reviewer accounts. Emails are never exposed to the public key.
alter table public.reviewers enable row level security;

-- Link each decision to the verified reviewer account.
alter table public.review_decisions add column if not exists reviewer_id uuid references public.reviewers(id);
