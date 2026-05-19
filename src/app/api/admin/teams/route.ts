import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    requireAdmin()
    const { data, error } = await supabaseAdmin.from('teams').select('*').order('created_at')
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
    const totalPurse = parseInt(body.total_purse) || 100000
    const { data, error } = await supabaseAdmin
      .from('teams')
      .insert({
        name: body.name,
        owner_name: body.owner_name,
        is_playing_owner: !!body.is_playing_owner,
        total_purse: totalPurse,
        purse_remaining: totalPurse,
        color_theme: body.color_theme || null,
        logo_url: body.logo_url || null,
      })
      .select()
      .single()
    if (error) throw error
    try {
      await supabaseAdmin.from('team_standings').upsert({ team_id: data.id })
    } catch { /* table may not exist yet */ }
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
