import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const [teamsRes, standingsRes, matchesRes, soldRes] = await Promise.all([
      supabaseAdmin.from('teams').select('*, players(id, full_name, sold_price)').order('name'),
      supabaseAdmin
        .from('team_standings')
        .select('*, team:team_id(id, name, logo_url)')
        .order('points', { ascending: false }),
      supabaseAdmin
        .from('matches')
        .select('*, team_a:team_a_id(name), team_b:team_b_id(name)')
        .order('match_date', { ascending: true }),
      supabaseAdmin
        .from('players')
        .select('full_name, sold_price, playing_position, team:team_id(name)')
        .eq('auction_status', 'sold')
        .order('sold_price', { ascending: false })
        .limit(1),
    ])

    return NextResponse.json({
      teams: teamsRes.data || [],
      standings: standingsRes.data || [],
      matches: matchesRes.data || [],
      topPlayer: soldRes.data?.[0] || null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
