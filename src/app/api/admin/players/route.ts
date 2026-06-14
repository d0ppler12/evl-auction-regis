import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const PLAYER_FIELDS = [
  'full_name', 'age', 'phone_number', 'wing_building', 'jersey_name', 'jersey_size',
  'jersey_number', 'utr_number', 'playing_position', 'volleyball_experience',
  'previous_tournament_experience', 'photo_url', 'instagram_id', 'base_price', 'status',
  'auction_status', 'team_id', 'sold_price', 'gender',
]

function pickPlayerFields(body: Record<string, unknown>) {
  const row: Record<string, unknown> = {}
  for (const key of PLAYER_FIELDS) {
    if (body[key] !== undefined) row[key] = body[key]
  }
  return row
}

export async function GET(request: Request) {
  try {
    requireAdmin()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin.from('players').select('*, teams(name)').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)

    const { data, error } = await query
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
    const row = pickPlayerFields(body)
    row.status = row.status || 'approved'
    row.auction_status = row.auction_status || 'unsold'
    row.photo_url = row.photo_url || 'placeholder'
    if (row.age) row.age = parseInt(String(row.age))
    if (row.jersey_number) row.jersey_number = parseInt(String(row.jersey_number))
    if (row.base_price !== undefined && row.base_price !== null) {
      const parsed = parseInt(String(row.base_price))
      row.base_price = Number.isNaN(parsed) ? 0 : parsed
    }

    const { data, error } = await supabaseAdmin.from('players').insert(row).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
