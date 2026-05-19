import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    requireAdmin()

    const [teams, players, sold, matches] = await Promise.all([
      supabaseAdmin.from('teams').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('players').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('players').select('id', { count: 'exact', head: true }).eq('auction_status', 'sold'),
      supabaseAdmin.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
    ])

    return NextResponse.json({
      totalTeams: teams.count || 0,
      playersRegistered: players.count || 0,
      soldPlayers: sold.count || 0,
      upcomingMatches: matches.count || 0,
    })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
