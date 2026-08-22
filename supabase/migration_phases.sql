-- SMV Fitness — phased programs migration
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
--
-- This changes the shape of workout_days (it now hangs off a phase instead
-- of directly off a program), so any existing test programs' days/exercises
-- can't be carried forward automatically — this migration clears them out.
-- Programs and client assignments themselves are left alone; just rebuild
-- the days/exercises through the program editor afterward.

create table if not exists program_phases (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  phase_label text not null,
  phase_index int not null default 0,
  duration_weeks int not null default 4
);

alter table workout_days add column if not exists phase_id uuid references program_phases(id) on delete cascade;

-- Clear old test data: exercises cascade-delete with workout_days, but we
-- delete both explicitly for clarity.
delete from exercises;
delete from workout_days;

alter table workout_days drop column if exists program_id;
alter table workout_days alter column phase_id set not null;

-- week_label is superseded by phases (total weeks is now the sum of each
-- phase's duration) — drop it, it's no longer read or written anywhere.
alter table programs drop column if exists week_label;

alter table program_phases enable row level security;

drop policy if exists "phases_all_coach" on program_phases;
create policy "phases_all_coach" on program_phases for all using (is_coach()) with check (is_coach());

drop policy if exists "phases_select_client" on program_phases;
create policy "phases_select_client" on program_phases for select
  using (exists (
    select 1 from program_assignments pa
    where pa.program_id = program_phases.program_id and pa.client_id = auth.uid()
  ));

drop policy if exists "workout_days_select_client" on workout_days;
create policy "workout_days_select_client" on workout_days for select
  using (exists (
    select 1 from program_phases pp
    join program_assignments pa on pa.program_id = pp.program_id
    where pp.id = workout_days.phase_id and pa.client_id = auth.uid()
  ));

drop policy if exists "exercises_select_client" on exercises;
create policy "exercises_select_client" on exercises for select
  using (exists (
    select 1 from workout_days wd
    join program_phases pp on pp.id = wd.phase_id
    join program_assignments pa on pa.program_id = pp.program_id
    where wd.id = exercises.workout_day_id and pa.client_id = auth.uid()
  ));
