"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuctionDisplayPage() {
  const [auctionState, setAuctionState] = useState<any>(null)
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [biddingTeam, setBiddingTeam] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [isSold, setIsSold] = useState(false)
  const [prevState, setPrevState] = useState<any>(null)
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: t } = await supabase.from('teams').select('*')
      if (t) setTeams(t)
      const { data: s } = await supabase.from('auction_state').select('*').eq('id', 1).single()
      if (s) {
        setAuctionState(s)
        setPrevState(s)
        if (s.current_player_id) fetchPlayer(s.current_player_id)
        if (s.current_bid_team_id && t) setBiddingTeam(t.find(team => team.id === s.current_bid_team_id))
      }
    }
    init()

    const channel = supabase.channel('display')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, payload => {
        const ns = payload.new as any
        setPrevState((prev: any) => {
          if (prev?.is_active && !ns.is_active && ns.current_bid_team_id) {
            setIsSold(true)
            setTimeout(() => setIsSold(false), 4000)
          }
          return ns
        })
        setAuctionState(ns)
        if (ns.current_player_id) fetchPlayer(ns.current_player_id)
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (auctionState?.current_bid_team_id && teams.length > 0) {
      setBiddingTeam(teams.find(t => t.id === auctionState.current_bid_team_id))
    } else {
      setBiddingTeam(null)
    }
  }, [auctionState?.current_bid_team_id, teams])

  async function fetchPlayer(id: string) {
    const { data } = await supabase.from('players').select('*').eq('id', id).single()
    if (data) setCurrentPlayer(data)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'f') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen()
        else document.exitFullscreen()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Waiting screen
  if (!currentPlayer && !auctionState) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-border border-t-primary rounded-full animate-spin mb-6"></div>
        <h1 className="text-3xl font-display font-black text-heading tracking-widest uppercase">Connecting to Broadcast...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-heading overflow-hidden flex flex-col select-none">
      
      {/* Header Bar */}
      <header className="flex justify-between items-center px-10 py-5 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-xl text-white">V</span>
          </div>
          <h1 className="text-2xl font-display font-black text-heading tracking-widest uppercase">Championship Draft</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {!connected && (
            <div className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Reconnecting...
            </div>
          )}
          <div className="flex items-center gap-3 bg-elevated px-5 py-2.5 rounded-xl border border-border">
            <div className={`w-3 h-3 rounded-full ${auctionState?.is_active ? 'bg-success' : 'bg-gold'} animate-pulse`}></div>
            <p className="text-sm font-bold text-heading tracking-widest uppercase">
              {auctionState?.is_active ? 'LIVE BIDDING' : 'STANDBY'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex px-10 py-8 gap-10 items-stretch">
        
        {/* Left: Player Card */}
        <div className="w-[55%] flex justify-center items-center relative">
          <AnimatePresence mode="wait">
            {currentPlayer ? (
              <motion.div
                key={currentPlayer.id}
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                className="w-full max-w-[650px]"
              >
                <div className="card-elevated rounded-3xl p-10 relative overflow-hidden">
                  
                  {/* SOLD Overlay */}
                  <AnimatePresence>
                    {isSold && (
                      <motion.div 
                        initial={{ scale: 3, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: -15 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-danger/20 backdrop-blur-sm"
                      >
                        <div className="text-[120px] font-display font-black text-danger border-8 border-danger px-10 py-2 rounded-3xl bg-background/80">
                          SOLD
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Player Info */}
                  <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-start">
                      <span className="px-5 py-2 bg-primary/20 border border-primary/30 rounded-xl text-primary font-bold text-lg uppercase tracking-wider">
                        {currentPlayer.playing_position}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-muted uppercase tracking-widest font-bold mb-1">Base Price</p>
                        <p className="text-2xl font-mono font-bold text-heading">₹{currentPlayer.base_price?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Player Image */}
                    <div className="w-64 h-64 mx-auto rounded-full bg-elevated border-4 border-border flex items-center justify-center">
                      <span className="text-muted font-bold text-sm uppercase tracking-widest">Player Photo</span>
                    </div>
                    
                    {/* Name */}
                    <h2 className="text-6xl font-display font-black text-center text-heading uppercase tracking-tight leading-tight">
                      {currentPlayer.full_name}
                    </h2>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-6">
                      <div className="bg-surface rounded-xl p-5 border border-border text-center min-w-[120px]">
                        <p className="text-xs text-muted uppercase font-bold mb-1 tracking-widest">Age</p>
                        <p className="text-2xl font-display font-bold text-heading">{currentPlayer.age || '—'}</p>
                      </div>
                      <div className="bg-surface rounded-xl p-5 border border-border text-center min-w-[160px]">
                        <p className="text-xs text-muted uppercase font-bold mb-1 tracking-widest">Building</p>
                        <p className="text-2xl font-display font-bold text-heading">{currentPlayer.wing_building || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-3xl font-display font-bold text-muted tracking-widest uppercase">Waiting for Player</div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Bid Panel + Teams */}
        <div className="w-[45%] flex flex-col gap-8">
          
          {/* Current Bid */}
          <div className="card-elevated rounded-3xl flex-1 flex flex-col items-center justify-center p-10 border-2 border-primary/20">
            <p className="text-lg font-bold text-muted uppercase tracking-[0.2em] mb-4">Current Bid</p>
            
            <motion.div 
              key={auctionState?.current_bid}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-[100px] leading-none font-display font-black text-primary mb-8 font-mono"
            >
              ₹{auctionState?.current_bid?.toLocaleString() || '0'}
            </motion.div>

            <div className="w-full bg-surface rounded-2xl p-6 border border-border text-center">
              <p className="text-sm font-bold text-muted uppercase tracking-[0.2em] mb-2">Bidding Franchise</p>
              <div className="text-4xl font-display font-black text-heading truncate">
                {biddingTeam?.name || '— — —'}
              </div>
            </div>
          </div>

          {/* Team Purses */}
          <div className="card-elevated rounded-2xl p-6">
            <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-4">Franchise Purses</h3>
            <div className="grid grid-cols-2 gap-3">
              {teams.slice(0, 8).map(team => (
                <div key={team.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                  biddingTeam?.id === team.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-surface border-border'
                }`}>
                  <span className="font-bold text-heading truncate pr-2 text-sm">{team.name}</span>
                  <span className="font-mono font-bold text-primary text-sm">₹{(team.purse_remaining / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
