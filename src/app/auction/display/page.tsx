"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Wallet, Tv, Gavel, Clock } from 'lucide-react'

export default function AuctionDisplayPage() {
  const [auctionState, setAuctionState] = useState<any>(null)
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [biddingTeam, setBiddingTeam] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [isSold, setIsSold] = useState(false)
  const [prevState, setPrevState] = useState<any>(null)
  const [connected, setConnected] = useState(true)
  const [timer, setTimer] = useState(30)

  // 1. Local Countdown Clock logic synchronized with bid reset
  useEffect(() => {
    if (currentPlayer && auctionState?.is_active) {
      setTimer(30)
    }
  }, [currentPlayer?.id, auctionState?.current_bid, auctionState?.current_bid_team_id, auctionState?.is_active])

  useEffect(() => {
    if (!auctionState?.is_active || !currentPlayer) return
    const interval = setInterval(() => {
      setTimer((t) => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [auctionState?.is_active, currentPlayer?.id])

  const getTimerStatus = () => {
    if (timer === 0) return "SOLD!"
    if (timer <= 5) return "FAIR WARNING"
    if (timer <= 12) return "GOING TWICE"
    if (timer <= 20) return "GOING ONCE"
    return "LIVE BIDDING"
  }

  // 2. Fetch and subscription logic
  useEffect(() => {
    async function init() {
      const { data: t } = await supabase.from('teams').select('*').order('name')
      const { data: p } = await supabase.from('players').select('*')
      const hasRealTeams = t && t.length > 0
      
      if (hasRealTeams) setTeams(t)
      if (p) setAllPlayers(p)
      
      const { data: s } = await supabase.from('auction_state').select('*').eq('id', 1).maybeSingle()
      if (s) {
        setAuctionState(s)
        setPrevState(s)
        if (s.current_player_id) {
          const { data: player } = await supabase.from('players').select('*').eq('id', s.current_player_id).maybeSingle()
          if (player) setCurrentPlayer(player)
        }
        if (s.current_bid_team_id && hasRealTeams) {
          setBiddingTeam(t.find(team => team.id === s.current_bid_team_id))
        }
      } else {
        // Fallback to mock data matching /auction page
        if (!hasRealTeams) {
          setTeams([
            { id: '1', name: 'Spikers Syndicate', purse_remaining: 85000, color_theme: '#2563EB' },
            { id: '2', name: 'Net Ninjas', purse_remaining: 125000, color_theme: '#F97316' }
          ])
        }
        setAllPlayers([
          { id: '1', full_name: 'Alice Smith', team_id: '1', auction_status: 'sold', sold_price: 15000 }
        ])
        setCurrentPlayer({
          id: '1',
          jersey_number: 10,
          volleyball_experience: 'Pro',
          age: 24,
          wing_building: 'A Wing'
        })
        setAuctionState({ current_bid: 15000, is_active: true })
        setBiddingTeam({ id: '1', name: 'Spikers Syndicate' })
      }
    }
    init()

    const channel = supabase.channel('auction_display_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, (payload) => {
        const ns = payload.new as any
        setAuctionState(ns)
        
        setAllPlayers((currentPlayers) => {
          if (ns.current_player_id) {
            const pl = currentPlayers.find((p) => p.id === ns.current_player_id);
            if (pl) setCurrentPlayer((prevCP: any) => prevCP?.id === pl.id ? prevCP : pl);
          } else {
            setCurrentPlayer(null);
          }
          return currentPlayers;
        });

        setPrevState((prev: any) => {
          if (prev?.is_active && !ns.is_active && ns.current_bid_team_id) {
            setIsSold(true)
            setTimeout(() => setIsSold(false), 4000)
          }
          return ns
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
        setTeams((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name));
          if (payload.eventType === 'DELETE') return prev.filter((t) => t.id !== payload.old.id);
          return prev.map((t) => t.id === payload.new.id ? payload.new : t);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, (payload) => {
        setAllPlayers((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new];
          if (payload.eventType === 'DELETE') return prev.filter((p) => p.id !== payload.old.id);
          return prev.map((p) => {
            if (p.id === payload.new.id) {
              const updated = { ...p, ...payload.new };
              const toastFields = ['photo_url', 'volleyball_experience', 'previous_tournament_experience'];
              toastFields.forEach((field) => {
                if (p[field] && (payload.new[field] === null || payload.new[field] === undefined)) {
                  updated[field] = p[field];
                }
              });
              return updated;
            }
            return p;
          });
        });
        setCurrentPlayer((prev: any) => {
          if (prev && payload.eventType === 'UPDATE' && prev.id === payload.new.id) {
            const updated = { ...prev, ...payload.new };
            const toastFields = ['photo_url', 'volleyball_experience', 'previous_tournament_experience'];
            toastFields.forEach((field) => {
              if (prev[field] && (payload.new[field] === null || payload.new[field] === undefined)) {
                updated[field] = prev[field];
              }
            });
            return updated;
          }
          return prev;
        });
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="w-16 h-16 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-black tracking-widest uppercase text-cyan-400 animate-pulse">Connecting to Broadcast Feed...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col select-none relative font-sans p-6 justify-between">
      
      {/* Custom Cyberspace HUD Styles */}
      <style>{`
        .hud-panel {
          background: rgba(6, 12, 24, 0.85);
          backdrop-filter: blur(16px);
          border: 2px solid #00E5FF;
          box-shadow: 0 0 35px rgba(0, 229, 255, 0.15), inset 0 0 20px rgba(0, 229, 255, 0.05);
          position: relative;
        }
        .hud-beveled-left {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%);
        }
        .hud-beveled-right {
          clip-path: polygon(0 0, calc(100% - 25px) 0, 100% 25px, 100% 100%, 0 100%);
        }
        .hud-beveled-bar {
          clip-path: polygon(30px 0, calc(100% - 30px) 0, 100% 100%, 0 100%);
        }
        .hud-border-left {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%);
        }
        .hud-border-right {
          clip-path: polygon(0 0, calc(100% - 25px) 0, 100% 25px, 100% 100%, 0 100%);
        }
        .hud-border-bar {
          clip-path: polygon(30px 0, calc(100% - 30px) 0, 100% 100%, 0 100%);
        }
        .neon-cyan-text {
          color: #00E5FF;
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.6);
        }
        .neon-amber-text {
          color: #FBBF24;
          text-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
        }
      `}</style>

      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/25 rounded-full blur-[150px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/25 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Main Grid: Left Spotlight + Center Space + Right Teams Sidebar */}
      <div className="z-10 flex-grow flex gap-6 items-stretch min-h-0 relative">

        {/* 1. LEFT PANEL: CURRENT PLAYER HUD CARD */}
        <div className="w-[34%] max-w-[420px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentPlayer && (
              <motion.div
                key={currentPlayer.id}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5, type: 'spring', damping: 15 }}
                className="w-full hud-panel hud-beveled-left p-6 flex flex-col justify-between h-[580px] lg:h-[650px] relative"
              >
                {/* Glowing cyan beveled border overlay */}
                <div className="absolute inset-0 border-[2px] border-[#00E5FF]/70 hud-border-left pointer-events-none" />

                {/* SOLD celebration stamp overlay */}
                <AnimatePresence>
                  {isSold && (
                    <motion.div 
                      initial={{ scale: 3, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: -15 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hud-border-left"
                    >
                      <div className="text-7xl font-black text-green-400 border-8 border-green-400 px-8 py-2 rounded-2xl bg-slate-950 shadow-[0_0_50px_rgba(74,222,128,0.4)]">
                        SOLD
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Player Card Header */}
                <div className="flex justify-between items-center border-b border-[#00E5FF]/20 pb-3 z-10">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00E5FF]">CURRENT PLAYER</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">REG 10-30</span>
                </div>

                {/* Player Photo Frame */}
                <div className="relative w-full h-[280px] lg:h-[350px] rounded-xl overflow-hidden border border-[#00E5FF]/20 bg-slate-950/80 shadow-[0_0_20px_rgba(0,0,0,0.5)] group z-10">
                  {/* Glowing background smoke grid */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/10 to-[#8B5CF6]/5 pointer-events-none" />
                  
                  {currentPlayer.photo_url && currentPlayer.photo_url !== 'placeholder' ? (
                    <img src={currentPlayer.photo_url} alt="" className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-[#111c34]/50 flex flex-col items-center justify-center gap-3">
                      <Tv className="w-16 h-16 text-[#00E5FF]/20 animate-pulse" />
                      <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">Photo Stream</span>
                    </div>
                  )}
                </div>

                {/* Player Roster Meta */}
                <div className="text-center z-10 space-y-1">
                  <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-none truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {currentPlayer.full_name}
                  </h2>
                  <p className="text-xs font-bold text-[#00E5FF] tracking-[0.15em] uppercase">
                    PLAYER · {currentPlayer.wing_building || 'A Wing'}
                  </p>
                </div>

                {/* Bottom Card Base Price */}
                <div className="hud-panel rounded-xl p-3 border border-[#00E5FF]/30 bg-slate-950/40 text-center z-10">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">BASE PRICE</span>
                  <span className="text-xl font-mono font-black text-white tracking-wider">
                    {currentPlayer.base_price?.toLocaleString() ?? '0'} PTS
                  </span>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. MIDDLE AREA (EMPTY SPACE FOR BROADCAST STREAM, BOTTOM-BAR DOCK) */}
        <div className="flex-1 flex flex-col justify-end items-center relative pb-20">
          
          {/* BOTTOM CENTER: CURRENTLY BIDDING HUD BAR */}
          <div className="w-[820px] h-24 relative">
            
            {/* Glowing cyan beveled border overlay */}
            <div className="absolute inset-0 border-[2px] border-[#00E5FF] hud-border-bar pointer-events-none z-20" />
            
            {/* Main beveled container */}
            <div className="w-full h-full hud-panel hud-beveled-bar px-8 flex items-center justify-between z-10 relative">
              
              {/* beveled light-blue panel backdrop */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/5 via-transparent to-[#00E5FF]/5 pointer-events-none" />

              {/* Left Segment: Round Roster Info */}
              <div className="flex items-center gap-3 w-[25%]">
                <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5 text-[#00E5FF] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">AUCTION</span>
                  <span className="text-xs font-black uppercase text-[#00E5FF] tracking-widest leading-none">LIVE DRAFT</span>
                </div>
              </div>

              {/* Center-Left Segment: Leading Franchise Shield */}
              <div className="flex items-center gap-3 w-[30%] justify-center border-x border-[#00E5FF]/15 px-4 h-12">
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md"
                  style={{ backgroundColor: biddingTeam?.color_theme || '#00E5FF' }}
                >
                  {biddingTeam?.name?.charAt(0).toUpperCase() || '—'}
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">CURRENTLY BIDDING</span>
                  <span className="text-base font-black uppercase text-white truncate block leading-none">
                    {biddingTeam?.name || '— — —'}
                  </span>
                </div>
              </div>

              {/* Center-Right Segment: Bid Points Value */}
              <div className="flex flex-col items-center justify-center w-[25%] pl-4">
                <motion.div 
                  key={auctionState?.current_bid}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-mono font-black text-[#00E5FF] leading-none text-center neon-cyan-text"
                >
                  {auctionState?.current_bid?.toLocaleString() || '0'}
                </motion.div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider mt-1 block">
                  NEXT BID: {(auctionState?.current_bid ? auctionState.current_bid + 1000 : 1000).toLocaleString()}
                </span>
              </div>

              {/* Right Segment: Dynamic Timer Clock */}
              <div className="flex items-center gap-3 w-[20%] justify-end border-l border-[#00E5FF]/15 pl-4 h-12">
                <div className="text-right">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">CLOCK</span>
                  <span className={`text-[10px] font-black uppercase block leading-none tracking-wider ${
                    timer <= 5 && auctionState?.is_active ? 'text-red-400 animate-pulse' : 'text-amber-400'
                  }`}>
                    {getTimerStatus()}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 shrink-0 bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2.5 py-1.5 rounded-lg">
                  <Clock className={`w-4 h-4 ${timer <= 5 && auctionState?.is_active ? 'text-red-400 animate-spin' : 'text-[#00E5FF]'}`} style={{ animationDuration: '3s' }} />
                  <span className="font-mono text-lg font-black text-white tabular-nums leading-none">
                    {String(timer).padStart(2, '0')}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 3. RIGHT PANEL: FRANCHISE LEADERBOARD */}
        <div className="w-[36%] max-w-[440px] flex flex-col justify-center">
          <div className="w-full hud-panel hud-beveled-right p-6 flex flex-col justify-between h-[580px] lg:h-[650px] relative">
            
            {/* Glowing cyan beveled border overlay */}
            <div className="absolute inset-0 border-[2px] border-[#00E5FF]/70 hud-border-right pointer-events-none" />

            {/* Panel Title Header */}
            <div className="flex justify-between items-center border-b border-[#00E5FF]/20 pb-3 shrink-0 z-10">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00E5FF]">FRANCHISE PURSES</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">5 TEAMS</span>
            </div>

            {/* Vertical Roster List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 z-10 scrollbar-thin">
              {teams.map((team, index) => {
                const isActiveBidder = biddingTeam?.id === team.id
                const displayedPurse = isActiveBidder ? (team.purse_remaining - (auctionState?.current_bid || 0)) : team.purse_remaining
                const squadSize = allPlayers.filter(p => p.team_id === team.id && p.auction_status === 'sold').length
                
                return (
                  <div 
                    key={team.id}
                    className={`relative rounded-xl border p-3.5 transition-all duration-300 flex items-center justify-between ${
                      isActiveBidder 
                        ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_20px_rgba(0,229,255,0.15)] scale-[1.02]' 
                        : 'border-white/5 bg-slate-950/40 hover:border-[#00E5FF]/30'
                    }`}
                  >
                    {/* Glowing highlight for active bidder */}
                    {isActiveBidder && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/5 to-transparent animate-pulse rounded-xl" />
                    )}

                    {/* Rank & Team Logo */}
                    <div className="flex items-center gap-3.5 z-10 w-[60%]">
                      <span className="font-mono text-sm font-black text-slate-500 w-4">{index + 1}</span>
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg text-white shrink-0 border border-white/10 shadow-md"
                        style={{ backgroundColor: team.color_theme || '#00E5FF' }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-white uppercase truncate tracking-tight">{team.name}</h4>
                        <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase truncate mt-0.5">
                          OWNER: {team.owner_name}
                        </p>
                      </div>
                    </div>

                    {/* Financial Purse & Squad Size specs */}
                    <div className="text-right z-10 w-[40%] flex flex-col justify-center border-l border-white/5 pl-4 h-10">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">PURSE</span>
                        <span className={`font-mono font-bold text-sm leading-none ${isActiveBidder ? 'text-[#00E5FF] neon-cyan-text' : 'text-slate-200'}`}>
                          {displayedPurse.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">SQUAD</span>
                        <span className="font-mono font-black text-xs text-[#FBBF24] leading-none">
                          {squadSize} PL
                        </span>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

            {/* Bottom Panel Branding */}
            <div className="hud-panel rounded-xl p-3 border border-[#00E5FF]/20 bg-slate-950/40 text-center shrink-0 z-10">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">BROADCAST DRAFT ENGINE</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
