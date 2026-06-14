import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin()
    const teamId = params.id
    const body = await request.json()
    const playerId = body.player_id

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 })
    }

    // Get player's sold price
    const { data: player, error: playerErr } = await supabaseAdmin
      .from('players')
      .select('sold_price, team_id')
      .eq('id', playerId)
      .maybeSingle()
      
    if (playerErr || !player) throw playerErr || new Error('Player not found')
    if (player.team_id !== teamId) return NextResponse.json({ error: 'Player not in this team' }, { status: 400 })

    const soldPrice = player.sold_price || 0

    // Get team's purse remaining
    const { data: team, error: teamErr } = await supabaseAdmin
      .from('teams')
      .select('purse_remaining')
      .eq('id', teamId)
      .maybeSingle()
      
    if (teamErr || !team) throw teamErr || new Error('Team not found')

    // 1. Update Team Purse
    await supabaseAdmin
      .from('teams')
      .update({ purse_remaining: (team.purse_remaining || 0) + soldPrice })
      .eq('id', teamId)

    // 2. Reset Player
    await supabaseAdmin
      .from('players')
      .update({
        team_id: null,
        auction_status: 'unsold',
        sold_price: null
      })
      .eq('id', playerId)

    // 3. Delete Player from bids history
    await supabaseAdmin
      .from('bids')
      .delete()
      .eq('player_id', playerId)

    // 4. Delete Player from auction_order to allow reshuffling
    await supabaseAdmin
      .from('auction_order')
      .delete()
      .eq('player_id', playerId)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
