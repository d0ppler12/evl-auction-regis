-- Change jersey_number column to TEXT to preserve leading zeros (e.g. '07')
ALTER TABLE public.players ALTER COLUMN jersey_number TYPE TEXT;
