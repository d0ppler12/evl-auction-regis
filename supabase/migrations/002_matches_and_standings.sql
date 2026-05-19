-- Run in Supabase SQL Editor

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS jersey_name TEXT,
  ADD COLUMN IF NOT EXISTS jersey_size TEXT,
  ADD COLUMN IF NOT EXISTS jersey_number INTEGER,
  ADD COLUMN IF NOT EXISTS utr_number TEXT;

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_b_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  match_date DATE,
  match_time TEXT,
  venue TEXT DEFAULT 'Eternia Arena',
  status TEXT DEFAULT 'scheduled',
  sets_team_a INTEGER DEFAULT 0,
  sets_team_b INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_standings (
  team_id UUID PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  sets_won INTEGER DEFAULT 0,
  sets_lost INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for team logos (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;
