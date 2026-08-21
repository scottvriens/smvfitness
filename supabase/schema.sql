-- SMV Fitness — database schema (Phase 4)
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.

-- ============================================================
-- 1. PROFILES  (one row per person — coach or client)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('coach', 'client')) default 'client',
  name text not null,
  email text not null,
  avatar_initials text not null default '',
  joined_date date not null default current_date
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- Role/name are read from the signup metadata (see the invite flow we'll wire up later).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, email, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_initials', upper(left(new.email, 2)))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Helper used throughout the RLS policies below: is the current user the coach?
create or replace function is_coach()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'coach'
  );
$$;

-- ============================================================
-- 2. PROGRAMS, WORKOUT DAYS, EXERCISES  (coach-authored, client-readable)
-- ============================================================
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  week_label text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists workout_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  day_label text not null,
  day_index int not null default 0
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references workout_days(id) on delete cascade,
  name text not null,
  muscle_group text not null default '',
  target_sets int not null default 3,
  target_reps text not null default '',
  target_rpe text,
  order_index int not null default 0
);

create table if not exists program_assignments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  start_date date not null default current_date,
  unique (program_id, client_id)
);

-- ============================================================
-- 3. CLIENT-OWNED DATA  (workouts logged, habits, check-ins, metrics, photos)
-- ============================================================
create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  workout_day_id uuid references workout_days(id) on delete set null,
  date date not null default current_date,
  exercise_logs jsonb not null default '[]',
  completed boolean not null default false
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  icon text not null default 'Check',
  active boolean not null default true
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null default current_date,
  completed boolean not null default false,
  unique (habit_id, date)
);

create table if not exists checkin_submissions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric,
  measurements jsonb not null default '{}',
  answers jsonb not null default '{}',
  coach_reviewed boolean not null default false,
  coach_comment text
);

create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric not null,
  measurements jsonb not null default '{}'
);

create table if not exists progress_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  angle text not null check (angle in ('front', 'side', 'back')),
  storage_path text not null
);

create table if not exists nutrition_targets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  calories int not null,
  protein_g int not null,
  carbs_g int not null,
  fat_g int not null,
  effective_date date not null default current_date
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('coach', 'client')),
  body text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. ROW-LEVEL SECURITY
--    Clients can only ever touch their own rows. The coach can touch everyone's.
-- ============================================================
alter table profiles enable row level security;
alter table programs enable row level security;
alter table workout_days enable row level security;
alter table exercises enable row level security;
alter table program_assignments enable row level security;
alter table workout_logs enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table checkin_submissions enable row level security;
alter table body_metrics enable row level security;
alter table progress_photos enable row level security;
alter table nutrition_targets enable row level security;
alter table messages enable row level security;

-- profiles
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or is_coach());
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- programs / workout_days / exercises: coach manages, clients read what's assigned to them
drop policy if exists "programs_all_coach" on programs;
create policy "programs_all_coach" on programs for all using (is_coach()) with check (is_coach());
drop policy if exists "programs_select_client" on programs;
create policy "programs_select_client" on programs for select
  using (exists (select 1 from program_assignments pa where pa.program_id = id and pa.client_id = auth.uid()));

drop policy if exists "workout_days_all_coach" on workout_days;
create policy "workout_days_all_coach" on workout_days for all using (is_coach()) with check (is_coach());
drop policy if exists "workout_days_select_client" on workout_days;
create policy "workout_days_select_client" on workout_days for select
  using (exists (
    select 1 from program_assignments pa where pa.program_id = workout_days.program_id and pa.client_id = auth.uid()
  ));

drop policy if exists "exercises_all_coach" on exercises;
create policy "exercises_all_coach" on exercises for all using (is_coach()) with check (is_coach());
drop policy if exists "exercises_select_client" on exercises;
create policy "exercises_select_client" on exercises for select
  using (exists (
    select 1 from workout_days wd
    join program_assignments pa on pa.program_id = wd.program_id
    where wd.id = exercises.workout_day_id and pa.client_id = auth.uid()
  ));

drop policy if exists "assignments_all_coach" on program_assignments;
create policy "assignments_all_coach" on program_assignments for all using (is_coach()) with check (is_coach());
drop policy if exists "assignments_select_own" on program_assignments;
create policy "assignments_select_own" on program_assignments for select using (client_id = auth.uid());

-- client-owned tables: same shape for each — own rows, or coach sees/edits everything
drop policy if exists "workout_logs_owner" on workout_logs;
create policy "workout_logs_owner" on workout_logs for all
  using (client_id = auth.uid() or is_coach()) with check (client_id = auth.uid() or is_coach());

drop policy if exists "habits_owner" on habits;
create policy "habits_owner" on habits for all
  using (client_id = auth.uid() or is_coach()) with check (client_id = auth.uid() or is_coach());

drop policy if exists "habit_logs_owner" on habit_logs;
create policy "habit_logs_owner" on habit_logs for all
  using (exists (select 1 from habits h where h.id = habit_logs.habit_id and (h.client_id = auth.uid() or is_coach())))
  with check (exists (select 1 from habits h where h.id = habit_logs.habit_id and (h.client_id = auth.uid() or is_coach())));

drop policy if exists "checkins_owner" on checkin_submissions;
create policy "checkins_owner" on checkin_submissions for all
  using (client_id = auth.uid() or is_coach()) with check (client_id = auth.uid() or is_coach());

drop policy if exists "body_metrics_owner" on body_metrics;
create policy "body_metrics_owner" on body_metrics for all
  using (client_id = auth.uid() or is_coach()) with check (client_id = auth.uid() or is_coach());

drop policy if exists "progress_photos_owner" on progress_photos;
create policy "progress_photos_owner" on progress_photos for all
  using (client_id = auth.uid() or is_coach()) with check (client_id = auth.uid() or is_coach());

drop policy if exists "nutrition_targets_owner" on nutrition_targets;
create policy "nutrition_targets_owner" on nutrition_targets for all
  using (client_id = auth.uid() or is_coach()) with check (client_id = auth.uid() or is_coach());

drop policy if exists "messages_owner" on messages;
create policy "messages_owner" on messages for all
  using (client_id = auth.uid() or is_coach()) with check (client_id = auth.uid() or is_coach());

-- ============================================================
-- 5. STORAGE  (progress photos — private bucket, same ownership rule)
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('progress-photos', 'progress-photos', false)
  on conflict (id) do nothing;

drop policy if exists "progress_photos_storage_owner" on storage.objects;
create policy "progress_photos_storage_owner" on storage.objects for all
  using (
    bucket_id = 'progress-photos'
    and (is_coach() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'progress-photos'
    and (is_coach() or (storage.foldername(name))[1] = auth.uid()::text)
  );
