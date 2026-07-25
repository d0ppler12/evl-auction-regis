import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_standings')
      .select('team_id, played, wins, losses, sets_won, sets_lost, points, team:team_id(id, name, logo_url, color_theme, group_name)')

    if (error) throw error

    // Map to a clean shape for the public points table
    const standings = (data || []).map((row: any) => ({
      team_id: row.team_id,
      name: row.team?.name || 'Unknown',
      group_name: row.team?.group_name || 'A',
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

    // Sort by points (descending), then by set difference (descending)
    standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points
      }
      return b.setDiff - a.setDiff
    })

    // Assign rank
    standings.forEach((team, index) => {
      team.rank = index + 1
    })

    return NextResponse.json(standings, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
