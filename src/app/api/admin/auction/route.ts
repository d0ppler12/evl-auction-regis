import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    requireAdmin()
    const [playersRes, teamsRes, stateRes] = await Promise.all([
      supabaseAdmin.from('players').select('*').order('created_at'),
      supabaseAdmin.from('teams').select('*').order('name'),
      supabaseAdmin.from('auction_state').select('*').eq('id', 1).single(),
    ])
    if (playersRes.error) throw playersRes.error
    if (teamsRes.error) throw teamsRes.error

    const state = stateRes.data
    const currentPlayer = state?.current_player_id
      ? playersRes.data?.find((p) => p.id === state.current_player_id)
      : null

    return NextResponse.json({
      players: playersRes.data,
      teams: teamsRes.data,
      auctionState: state,
      currentPlayer,
    })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin()
    const body = await request.json()
    const { action } = body

    if (action === 'set_player') {
      const { data: player } = await supabaseAdmin
        .from('players')
        .select('base_price')
        .eq('id', body.player_id)
        .single()

      const { data, error } = await supabaseAdmin
        .from('auction_state')
        .update({
          current_player_id: body.player_id,
          current_bid: player?.base_price || 0,
          current_bid_team_id: null,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    if (action === 'bid') {
      const { data: state } = await supabaseAdmin.from('auction_state').select('*').eq('id', 1).single()
      if (!state?.current_player_id) {
        return NextResponse.json({ error: 'No player selected' }, { status: 400 })
      }

      const amount = body.amount ?? (state.current_bid || 0) + (body.increment || 0)
      const teamId = body.team_id
      if (!teamId) {
        return NextResponse.json({ error: 'Team required' }, { status: 400 })
      }

      const { data, error } = await supabaseAdmin
        .from('auction_state')
        .update({
          current_bid: amount,
          current_bid_team_id: teamId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single()
      if (error) throw error

      await supabaseAdmin.from('bids').insert({
        player_id: state.current_player_id,
        team_id: teamId,
        amount,
      })

      return NextResponse.json(data)
    }

    if (action === 'sold') {
      const { data: state } = await supabaseAdmin.from('auction_state').select('*').eq('id', 1).single()
      if (!state?.current_player_id || !state.current_bid_team_id) {
        return NextResponse.json({ error: 'No active bid' }, { status: 400 })
      }

      const { data: team } = await supabaseAdmin
        .from('teams')
        .select('purse_remaining')
        .eq('id', state.current_bid_team_id)
        .single()

      const newPurse = (team?.purse_remaining || 0) - (state.current_bid || 0)

      await supabaseAdmin
        .from('teams')
        .update({ purse_remaining: newPurse })
        .eq('id', state.current_bid_team_id)

      await supabaseAdmin
        .from('players')
        .update({
          auction_status: 'sold',
          team_id: state.current_bid_team_id,
          sold_price: state.current_bid,
        })
        .eq('id', state.current_player_id)

      const { data, error } = await supabaseAdmin
        .from('auction_state')
        .update({
          is_active: false,
          current_player_id: null,
          current_bid: 0,
          current_bid_team_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    if (action === 'unsold') {
      const { data: state } = await supabaseAdmin.from('auction_state').select('*').eq('id', 1).single()
      if (!state?.current_player_id) {
        return NextResponse.json({ error: 'No player selected' }, { status: 400 })
      }

      await supabaseAdmin
        .from('players')
        .update({ auction_status: 'unsold' })
        .eq('id', state.current_player_id)

      const { data, error } = await supabaseAdmin
        .from('auction_state')
        .update({
          is_active: false,
          current_player_id: null,
          current_bid: 0,
          current_bid_team_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
