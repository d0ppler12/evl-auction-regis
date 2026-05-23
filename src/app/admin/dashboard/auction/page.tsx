"use client"
import { useEffect, useState, useCallback } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [auctionState, setAuctionState] = useState<any>({ current_bid: 0 })
  const [players, setPlayers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [bidAmount, setBidAmount] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await adminFetch<any>('/api/admin/auction')
      setPlayers(data.players || [])
      setTeams(data.teams || [])
      setAuctionState(data.auctionState || { current_bid: 0 })
      setCurrentPlayer(data.currentPlayer || null)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleSetPlayer = async (playerId: string) => {
    const player = players.find(p => p.id === playerId)
    setCurrentPlayer(player)
    await adminFetch('/api/admin/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'set_player', player_id: playerId }),
    })
    await refresh()
  }

  const handleIncrementBid = async (increment: number) => {
    if (!selectedTeamId) return alert('Select a bidding team first.')
    await adminFetch('/api/admin/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'bid', team_id: selectedTeamId, increment }),
    })
    await refresh()
  }

  const handleCustomBid = async () => {
    if (!selectedTeamId || !bidAmount) return
    await adminFetch('/api/admin/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'bid', team_id: selectedTeamId, amount: parseInt(bidAmount) }),
    })
    setBidAmount('')
    await refresh()
  }

  const handleMarkSold = async () => {
    if (!currentPlayer || !auctionState.current_bid_team_id) return alert('No active bid.')
    await adminFetch('/api/admin/auction', { method: 'POST', body: JSON.stringify({ action: 'sold' }) })
    setCurrentPlayer(null)
    await refresh()
  }

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return
    await adminFetch('/api/admin/auction', { method: 'POST', body: JSON.stringify({ action: 'unsold' }) })
    setCurrentPlayer(null)
    await refresh()
  }

  const handleShufflePool = async () => {
    if (!confirm('Are you sure you want to shuffle the entire remaining player queue?')) return
    await adminFetch('/api/admin/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'shuffle_pool' }),
    })
    await refresh()
  }

  return (
    <div>
      <div className="bg-surface border-b border-border px-6 py-4 flex justify-between items-center rounded-2xl mb-6 border-white/10">
        <div className="flex items-center gap-3">
          <motion.div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-display font-bold text-white uppercase tracking-widest">Auction Control Room</h1>
        </div>
        <div className="text-sm font-mono text-slate-400">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-2xl p-5 border border-white/10 flex-1 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-widest">Player Queue</h2>
                <span className="text-xs font-mono text-slate-450">{players.filter(p => p.auction_status !== 'sold' && p.status === 'approved').length} remaining</span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleShufflePool} className="bg-slate-800 hover:bg-slate-700 text-xs border border-white/5 py-1 px-3">
                🔀 Shuffle
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-1">
              {players.filter(p => p.auction_status !== 'sold' && p.status === 'approved').map(p => (
                <div key={p.id} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                  currentPlayer?.id === p.id ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-800/50 border-white/5 hover:border-white/20'
                }`}>
                  <div>
                    <p className="font-bold text-white text-sm">{p.full_name}</p>
                    <p className="text-xs text-slate-400 font-mono">₹{p.base_price} · {p.playing_position}</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => handleSetPlayer(p.id)} disabled={currentPlayer?.id === p.id}>
                    Set Live
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 border-2 border-blue-500/30">
            <h2 className="text-base font-bold text-white uppercase tracking-widest mb-5">Live Auction Block</h2>
            {currentPlayer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-display font-black text-white mb-2">{currentPlayer.full_name}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-500/20 rounded-lg text-sm text-blue-400 font-bold uppercase tracking-wider mb-4">
                    {currentPlayer.playing_position}
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-slate-800 rounded-lg border border-white/10">
                      <span className="text-slate-400 text-sm">Base Price</span>
                      <span className="font-mono font-bold text-white">₹{currentPlayer.base_price}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-800 rounded-lg border border-white/10">
                      <span className="text-slate-400 text-sm">Building</span>
                      <span className="font-bold text-white">{currentPlayer.wing_building || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center md:border-l md:border-white/10 md:pl-8">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Bid</p>
                  <motion.div key={auctionState.current_bid} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-5xl font-display font-black text-yellow-400 mb-4 font-mono">
                    ₹{auctionState.current_bid?.toLocaleString()}
                  </motion.div>
                  <div className="px-4 py-2 bg-slate-800 rounded-lg border border-white/10">
                    <p className="text-sm font-bold text-white">
                      Leading: {auctionState.current_bid_team_id ? teams.find(t => t.id === auctionState.current_bid_team_id)?.name : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-white/20 rounded-2xl">
                <p className="text-slate-500 uppercase tracking-widest font-bold">Select a player from the queue</p>
              </div>
            )}
          </div>

          {currentPlayer && (
            <div className="bg-slate-900 rounded-2xl p-6 space-y-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bidding Franchise</label>
                  <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">— Choose Team —</option>
                    {teams.map(t => (<option key={t.id} value={t.id}>{t.name} (₹{t.purse_remaining})</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Custom Amount</label>
                  <div className="flex gap-3">
                    <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="Enter amount" className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-3.5 text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500" />
                    <Button variant="primary" onClick={handleCustomBid}>Set</Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Bid</label>
                <div className="grid grid-cols-4 gap-3">
                  {[100, 500, 1000, 5000].map(amount => (
                    <button key={amount} onClick={() => handleIncrementBid(amount)} className="bg-slate-800 border border-white/10 rounded-xl py-4 text-xl font-mono font-bold text-white hover:bg-slate-700 hover:border-white/30 transition-all active:scale-95">
                      +{amount}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <Button variant="primary" size="lg" className="h-16 text-xl tracking-widest bg-emerald-600 hover:bg-emerald-500 border-none" onClick={handleMarkSold}>🔨 SOLD</Button>
                <Button variant="secondary" size="lg" className="h-16 text-base bg-red-600 hover:bg-red-500 text-white border-none" onClick={handleMarkUnsold}>PASS / UNSOLD</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
