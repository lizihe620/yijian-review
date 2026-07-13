-- ============================================
-- 一建复习平台 — 数据库迁移
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 0. 扩展
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. 建表
-- ============================================

-- 科目表
create table if not exists subjects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  short_name text not null,
  color text not null default '#3b82f6',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 阶段表
create table if not exists phases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  sort_order int not null default 0,
  description text,
  created_at timestamptz not null default now()
);

-- 每日任务表
create table if not exists daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  subject_id uuid references subjects(id) on delete set null,
  phase_id uuid references phases(id) on delete set null,
  task_content text not null,
  estimated_minutes int not null default 0,
  sort_order int not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  actual_minutes int,
  correct_rate decimal(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 每日重点标记表
create table if not exists daily_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

-- ============================================
-- 2. 索引
-- ============================================

create index if not exists idx_subjects_user on subjects(user_id);
create index if not exists idx_phases_user on phases(user_id);
create index if not exists idx_daily_tasks_user_date on daily_tasks(user_id, date);
create index if not exists idx_daily_tasks_user_subject on daily_tasks(user_id, subject_id);
create index if not exists idx_daily_notes_user_date on daily_notes(user_id, date);

-- ============================================
-- 3. RLS 策略
-- ============================================

alter table subjects enable row level security;
alter table phases enable row level security;
alter table daily_tasks enable row level security;
alter table daily_notes enable row level security;

-- subjects: 用户只能访问自己的数据
create policy "Users can view own subjects" on subjects
  for select using (auth.uid() = user_id);

create policy "Users can insert own subjects" on subjects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own subjects" on subjects
  for update using (auth.uid() = user_id);

create policy "Users can delete own subjects" on subjects
  for delete using (auth.uid() = user_id);

-- phases: 用户只能访问自己的数据
create policy "Users can view own phases" on phases
  for select using (auth.uid() = user_id);

create policy "Users can insert own phases" on phases
  for insert with check (auth.uid() = user_id);

create policy "Users can update own phases" on phases
  for update using (auth.uid() = user_id);

create policy "Users can delete own phases" on phases
  for delete using (auth.uid() = user_id);

-- daily_tasks: 用户只能访问自己的数据
create policy "Users can view own tasks" on daily_tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert own tasks" on daily_tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks" on daily_tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete own tasks" on daily_tasks
  for delete using (auth.uid() = user_id);

-- daily_notes: 用户只能访问自己的数据
create policy "Users can view own notes" on daily_notes
  for select using (auth.uid() = user_id);

create policy "Users can insert own notes" on daily_notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes" on daily_notes
  for update using (auth.uid() = user_id);

create policy "Users can delete own notes" on daily_notes
  for delete using (auth.uid() = user_id);

-- ============================================
-- 4. 更新时间触发器
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_daily_tasks_updated_at
  before update on daily_tasks
  for each row execute function update_updated_at();

create trigger trg_daily_notes_updated_at
  before update on daily_notes
  for each row execute function update_updated_at();
