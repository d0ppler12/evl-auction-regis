import { supabaseAdmin } from '@/lib/supabase-admin'

export const PLAYER_FIELDS = [
  'full_name', 'age', 'phone_number', 'wing_building', 'jersey_name', 'jersey_size',
  'jersey_number', 'utr_number', 'playing_position', 'volleyball_experience',
  'previous_tournament_experience', 'photo_url', 'instagram_id', 'base_price', 'status',
  'auction_status', 'team_id', 'sold_price', 'email', 'password',
] as const

export function pickPlayerFields(body: Record<string, unknown>) {
  const row: Record<string, unknown> = {}
  for (const key of PLAYER_FIELDS) {
    if (body[key] !== undefined) row[key] = body[key]
  }
  if (row.age !== undefined) {
    const n = parseInt(String(row.age))
    row.age = Number.isNaN(n) ? null : n
  }
  if (row.jersey_number !== undefined) {
    const n = parseInt(String(row.jersey_number))
    row.jersey_number = Number.isNaN(n) ? null : n
  }
  if (row.base_price !== undefined) {
    const n = parseInt(String(row.base_price))
    row.base_price = Number.isNaN(n) ? 100 : n
  }
  return row
}

/** Update player and return row without .single() coercion errors */
export async function updatePlayerById(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error

  if (data && data.length > 0) return data[0]

  const { data: rows, error: fetchError } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('id', id)
    .limit(1)

  if (fetchError) throw fetchError
  if (!rows || rows.length === 0) throw new Error('Player not found')
  return rows[0]
}
