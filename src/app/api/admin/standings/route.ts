import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { recalculateStandings } from '@/lib/standings'

export async function GET() {
  try {
    requireAdmin()
    const { data, error } = await supabaseAdmin
      .from('team_standings')
      .select('*, team:team_id(id, name, logo_url, color_theme)')
      .order('points', { ascending: false })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Keep the auto-calculation as an option, but the user requested manual overrides.
export async function POST() {
  try {
    requireAdmin()
    await recalculateStandings()
    const { data, error } = await supabaseAdmin
      .from('team_standings')
      .select('*, team:team_id(id, name, logo_url)')
      .order('points', { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// New PUT method to accept a bulk manual update of the standings table
export async function PUT(req: Request) {
  try {
    requireAdmin()
    const body = await req.json()
    const updates = Array.isArray(body) ? body : []

    // Upsert the entire array manually
    const { data, error } = await supabaseAdmin
      .from('team_standings')
      .upsert(
        updates.map(u => ({
          team_id: u.team_id,
          played: parseInt(u.played || 0),
          wins: parseInt(u.wins || 0),
          losses: parseInt(u.losses || 0),
          sets_won: parseInt(u.sets_won || 0),
          sets_lost: parseInt(u.sets_lost || 0),
          points: parseInt(u.points || 0),
          updated_at: new Date().toISOString()
        }))
      )
      
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
