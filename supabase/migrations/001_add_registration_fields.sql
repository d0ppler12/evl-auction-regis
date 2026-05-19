-- Run this in Supabase Dashboard → SQL Editor
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS jersey_name TEXT,
  ADD COLUMN IF NOT EXISTS jersey_size TEXT,
  ADD COLUMN IF NOT EXISTS jersey_number INTEGER,
  ADD COLUMN IF NOT EXISTS utr_number TEXT;
