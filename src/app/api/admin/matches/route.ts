import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    requireAdmin()
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('*, team_a:team_a_id(id, name, logo_url), team_b:team_b_id(id, name, logo_url)')
      .order('match_date', { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin()
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('matches')
      .insert({
        team_a_id: body.team_a_id,
        team_b_id: body.team_b_id,
        match_date: body.match_date || null,
        match_time: body.match_time || null,
        venue: body.venue || 'Eternia Arena',
        status: body.status || 'scheduled',
        sets_team_a: parseInt(body.sets_team_a) || 0,
        sets_team_b: parseInt(body.sets_team_b) || 0,
        match_type: body.match_type || 'league',
        bracket_round: body.bracket_round || null,
      })
      .select('*, team_a:team_a_id(id, name), team_b:team_b_id(id, name)')
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
