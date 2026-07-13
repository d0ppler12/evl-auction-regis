import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const [teamsRes, standingsRes, matchesRes, soldRes] = await Promise.all([
      supabaseAdmin.from('teams').select('id, name, logo_url, color_theme, owner_name, players(id, full_name, sold_price)').order('name'),
      supabaseAdmin
        .from('team_standings')
        .select('team_id, played, won, lost, points, sets_won, sets_lost, team:team_id(id, name, logo_url)')
        .order('points', { ascending: false }),
      supabaseAdmin
        .from('matches')
        .select('id, team_a_id, team_b_id, match_date, match_time, venue, status, sets_team_a, sets_team_b, points_team_a, points_team_b, match_type, bracket_round, team_a:team_a_id(id, name, logo_url, color_theme), team_b:team_b_id(id, name, logo_url, color_theme)')
        .order('match_date', { ascending: true }),
      supabaseAdmin
        .from('players')
        .select('id, full_name, sold_price, team:team_id(name)')
        .eq('auction_status', 'sold')
        .order('sold_price', { ascending: false })
        .limit(1),
    ])

    return NextResponse.json(
      {
        teams: teamsRes.data || [],
        standings: standingsRes.data || [],
        matches: matchesRes.data || [],
        topPlayer: soldRes.data?.[0] || null,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
