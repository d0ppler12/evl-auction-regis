-- Run this in Supabase Dashboard → SQL Editor
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password TEXT;
