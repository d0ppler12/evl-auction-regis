import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.owner_name !== undefined) updates.owner_name = body.owner_name
    if (body.is_playing_owner !== undefined) updates.is_playing_owner = !!body.is_playing_owner
    if (body.total_purse !== undefined) updates.total_purse = parseInt(body.total_purse)
    if (body.purse_remaining !== undefined) updates.purse_remaining = parseInt(body.purse_remaining)
    if (body.color_theme !== undefined) updates.color_theme = body.color_theme
    if (body.logo_url !== undefined) updates.logo_url = body.logo_url

    const { data, error } = await supabaseAdmin
      .from('teams')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const { error } = await supabaseAdmin.from('teams').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
