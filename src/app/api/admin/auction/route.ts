import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    requireAdmin()
    const [playersRes, teamsRes, stateRes] = await Promise.all([
      supabaseAdmin.from('players').select('*'),
      supabaseAdmin.from('teams').select('*').order('name'),
      supabaseAdmin.from('auction_state').select('*').eq('id', 1).single(),
    ])
    if (playersRes.error) throw playersRes.error
    if (teamsRes.error) throw teamsRes.error

    const allPlayers = playersRes.data || []
    const approvedUnsoldPlayers = allPlayers.filter(p => p.status === 'approved' && p.auction_status !== 'sold')

    // Fetch existing auction_order table
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('auction_order')
      .select('*')
    if (orderError) throw orderError

    const orderMap = new Map(orderData?.map(o => [o.player_id, o.sequence_number]) || [])

    // Find any approved unsold player missing from auction_order
    const missingPlayers = approvedUnsoldPlayers.filter(p => !orderMap.has(p.id))

    if (missingPlayers.length > 0) {
      let maxSeq = 0
      if (orderData && orderData.length > 0) {
        maxSeq = Math.max(...orderData.map(o => o.sequence_number))
      }

      // Shuffle missing players
      const shuffledMissing = [...missingPlayers].sort(() => Math.random() - 0.5)
      
      const insertData = shuffledMissing.map((p, i) => ({
        player_id: p.id,
        sequence_number: maxSeq + i + 1,
        is_completed: false
      }))

      const { error: insertErr } = await supabaseAdmin
        .from('auction_order')
        .insert(insertData)
      
      if (!insertErr) {
        insertData.forEach(item => {
          orderMap.set(item.player_id, item.sequence_number)
        })
      }
    }

    // Sort players: approved & unsold players by sequence_number, then others
    const sortedPlayers = [...allPlayers].sort((a, b) => {
      const aApproved = a.status === 'approved' && a.auction_status !== 'sold'
      const bApproved = b.status === 'approved' && b.auction_status !== 'sold'

      if (aApproved && bApproved) {
        const aSeq = orderMap.get(a.id) ?? 999999
        const bSeq = orderMap.get(b.id) ?? 999999
        return aSeq - bSeq
      }
      if (aApproved) return -1
      if (bApproved) return 1
      
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    const state = stateRes.data
    const currentPlayer = state?.current_player_id
      ? sortedPlayers.find((p) => p.id === state.current_player_id)
      : null

    return NextResponse.json({
      players: sortedPlayers,
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

    if (action === 'pause') {
      const { data, error } = await supabaseAdmin
        .from('auction_state')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
      if (error) throw error
      return NextResponse.json(data?.[0] ?? data)
    }

    if (action === 'resume') {
      const { data: state } = await supabaseAdmin.from('auction_state').select('*').eq('id', 1).single()
      if (!state?.current_player_id) {
        return NextResponse.json({ error: 'Select a player first' }, { status: 400 })
      }
      const { data, error } = await supabaseAdmin
        .from('auction_state')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
      if (error) throw error
      return NextResponse.json(data?.[0] ?? data)
    }

    if (action === 'reset_lot') {
      const { data: state } = await supabaseAdmin.from('auction_state').select('*').eq('id', 1).single()
      if (!state?.current_player_id) {
        return NextResponse.json({ error: 'No player on block' }, { status: 400 })
      }
      const { data: player } = await supabaseAdmin
        .from('players')
        .select('base_price')
        .eq('id', state.current_player_id)
        .single()
      const { data, error } = await supabaseAdmin
        .from('auction_state')
        .update({
          current_bid: player?.base_price || 0,
          current_bid_team_id: null,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
      if (error) throw error
      return NextResponse.json(data?.[0] ?? data)
    }

    if (action === 'shuffle_pool') {
      const { data: players } = await supabaseAdmin
        .from('players')
        .select('id')
        .eq('status', 'approved')
        .neq('auction_status', 'sold')

      if (players && players.length > 0) {
        const playerIds = players.map(p => p.id)
        
        await supabaseAdmin
          .from('auction_order')
          .delete()
          .in('player_id', playerIds)

        const shuffled = [...playerIds].sort(() => Math.random() - 0.5)

        const insertData = shuffled.map((id, index) => ({
          player_id: id,
          sequence_number: index + 1,
          is_completed: false
        }))

        const { error } = await supabaseAdmin
          .from('auction_order')
          .insert(insertData)
        if (error) throw error
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return unauthorizedResponse()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
