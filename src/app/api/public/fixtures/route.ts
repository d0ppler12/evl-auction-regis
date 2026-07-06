import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('id, team_a_id, team_b_id, match_date, match_time, venue, status, sets_team_a, sets_team_b, points_team_a, points_team_b, match_type, bracket_round, team_a:team_a_id(id, name, logo_url, color_theme), team_b:team_b_id(id, name, logo_url, color_theme)')
      .order('match_date', { ascending: true })
      .order('match_time', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
