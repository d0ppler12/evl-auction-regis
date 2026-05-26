import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { pickPlayerFields, updatePlayerById } from '@/lib/player-db'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const body = await request.json()
    const updates = pickPlayerFields(body)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const data = await updatePlayerById(params.id, updates)
    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const { error } = await supabaseAdmin.from('players').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
