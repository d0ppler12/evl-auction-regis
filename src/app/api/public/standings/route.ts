import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_standings')
      .select('*, team:team_id(id, name, logo_url, color_theme)')
      .order('points', { ascending: false })

    if (error) throw error

    // Map to a clean shape for the public points table
    const standings = (data || []).map((row: any, index: number) => ({
      rank: index + 1,
      team_id: row.team_id,
      name: row.team?.name || 'Unknown',
      color: row.team?.color_theme || '#808080',
      logo_url: row.team?.logo_url || null,
      played: row.played || 0,
      won: row.wins || 0,
      lost: row.losses || 0,
      setsWon: row.sets_won || 0,
      setsLost: row.sets_lost || 0,
      setDiff: (row.sets_won || 0) - (row.sets_lost || 0),
      points: row.points || 0,
    }))

    return NextResponse.json(standings)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
