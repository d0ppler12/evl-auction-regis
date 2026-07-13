import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Cache for 30s; stale-while-revalidate for 2min for live match awareness
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('id, team_a_id, team_b_id, match_date, match_time, venue, status, sets_team_a, sets_team_b, points_team_a, points_team_b, match_type, bracket_round, team_a:team_a_id(id, name, logo_url), team_b:team_b_id(id, name, logo_url)')
      .order('match_date', { ascending: true })

    if (error) throw error
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=120',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
