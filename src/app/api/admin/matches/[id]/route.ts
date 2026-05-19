import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { recalculateStandings } from '@/lib/standings'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    const fields = ['team_a_id', 'team_b_id', 'match_date', 'match_time', 'venue', 'status', 'sets_team_a', 'sets_team_b']
    for (const f of fields) {
      if (body[f] !== undefined) updates[f] = body[f]
    }
    if (updates.sets_team_a !== undefined) updates.sets_team_a = parseInt(String(updates.sets_team_a))
    if (updates.sets_team_b !== undefined) updates.sets_team_b = parseInt(String(updates.sets_team_b))

    const { data, error } = await supabaseAdmin
      .from('matches')
      .update(updates)
      .eq('id', params.id)
      .select('*, team_a:team_a_id(id, name), team_b:team_b_id(id, name)')
      .single()
    if (error) throw error

    if (data.status === 'completed') {
      await recalculateStandings()
    }

    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const { error } = await supabaseAdmin.from('matches').delete().eq('id', params.id)
    if (error) throw error
    await recalculateStandings()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
