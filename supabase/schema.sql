-- Schema for Volleyball Auction Platform

-- 1. Players Table
CREATE TABLE public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    age INTEGER,
    phone_number TEXT,
    wing_building TEXT,
    jersey_name TEXT,
    jersey_size TEXT,
    jersey_number INTEGER,
    utr_number TEXT,
    playing_position TEXT,
    volleyball_experience TEXT,
    previous_tournament_experience TEXT,
    photo_url TEXT,
    instagram_id TEXT,
    base_price INTEGER DEFAULT 100,
    status TEXT DEFAULT 'pending_approval', -- 'pending_payment', 'pending_approval', 'approved', 'rejected'
    auction_status TEXT DEFAULT 'unsold', -- 'unsold', 'sold', 'in_auction'
    team_id UUID,
    sold_price INTEGER,
    email TEXT UNIQUE,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teams Table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    is_playing_owner BOOLEAN DEFAULT FALSE,
    total_purse INTEGER DEFAULT 100000,
    purse_remaining INTEGER DEFAULT 100000,
    logo_url TEXT,
    color_theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.players
ADD CONSTRAINT players_team_id_fkey
FOREIGN KEY (team_id) REFERENCES public.teams(id)
ON DELETE SET NULL;

-- 3. Bids Table
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id),
    team_id UUID REFERENCES public.teams(id),
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Auction State Table (Singleton)
CREATE TABLE public.auction_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    current_player_id UUID REFERENCES public.players(id),
    current_bid INTEGER DEFAULT 0,
    current_bid_team_id UUID REFERENCES public.teams(id),
    is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
INSERT INTO public.auction_state (id) VALUES (1);

-- 6. Matches Table
CREATE TABLE public.matches (
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

-- 7. Team Standings Table
CREATE TABLE public.team_standings (
    team_id UUID PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
    played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    sets_won INTEGER DEFAULT 0,
    sets_lost INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Auction Order Table
CREATE TABLE public.auction_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id) UNIQUE,
    sequence_number INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Enable realtime for auction tables
-- NOTE: In a real Supabase project you must run these through the SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
