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
