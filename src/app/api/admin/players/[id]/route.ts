import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const PLAYER_FIELDS = [
  'full_name', 'age', 'phone_number', 'wing_building', 'jersey_name', 'jersey_size',
  'jersey_number', 'utr_number', 'playing_position', 'volleyball_experience',
  'previous_tournament_experience', 'photo_url', 'instagram_id', 'base_price', 'status',
  'auction_status', 'team_id', 'sold_price',
]

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    for (const key of PLAYER_FIELDS) {
      if (body[key] !== undefined) updates[key] = body[key]
    }
    if (updates.age) updates.age = parseInt(String(updates.age))
    if (updates.jersey_number) updates.jersey_number = parseInt(String(updates.jersey_number))
    if (updates.base_price) updates.base_price = parseInt(String(updates.base_price))

    const { data, error } = await supabaseAdmin
      .from('players')
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
    const { error } = await supabaseAdmin.from('players').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
