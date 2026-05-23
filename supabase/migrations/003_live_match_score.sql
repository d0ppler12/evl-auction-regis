-- Add live match tracking fields to the matches table
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS current_set INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS points_team_a INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_team_b INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS live_feed JSONB DEFAULT '[]'::jsonb;
