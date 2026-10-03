-- =====================================================================
-- ezyjobs — مخطط قاعدة البيانات

create extension if not exists pgcrypto;
--  نفّذ هذا الملف في: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) جدول الملفات الشخصية
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null check (char_length(username) between 3 and 32),
  role        text not null default 'seeker'
                check (role in ('publisher', 'seeker')),
  display_name text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) جدول الوظائف
-- ---------------------------------------------------------------------
create table if not exists public.jobs (
  id                text primary key,
  slug              text unique not null,
