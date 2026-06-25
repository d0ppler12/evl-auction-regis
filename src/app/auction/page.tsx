"use client"
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuctionPage() {
  const [auctionState, setAuctionState] = useState<any>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [biddingTeam, setBiddingTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [animationOverlay, setAnimationOverlay] = useState<'sold' | 'unsold' | null>(null);
  const prevStateRef = useRef<any>(null);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  
  useEffect(() => {
    async function init() {
      const { data: t } = await supabase.from('teams').select('*').order('name');
      const { data: p } = await supabase.from('players').select('*');
      
      if (t) setTeams(t);
      if (p) setAllPlayers(p);

      const { data: s } = await supabase.from('auction_state').select('*').eq('id', 1).maybeSingle();
      if (s) {
        setAuctionState(s);
        prevStateRef.current = s;
        if (s.current_player_id && p) {
           const pl = p.find(x => x.id === s.current_player_id);
           if (pl) setCurrentPlayer(pl);
        }
        if (s.current_bid_team_id && t) {
           const team = t.find(x => x.id === s.current_bid_team_id);
           setBiddingTeam(team);
        }
      }
    }
    init();

    const channel = supabase.channel('auction_display_premium')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, (payload) => {
        const ns = payload.new as any;
        setAuctionState(ns);
        
        setAllPlayers((currentPlayers) => {
          if (ns.current_player_id) {
            const pl = currentPlayers.find((p) => p.id === ns.current_player_id);
            if (pl) setCurrentPlayer((prevCP: any) => prevCP?.id === pl.id ? prevCP : pl);
          } else {
            setCurrentPlayer(null);
          }
          return currentPlayers;
        });
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
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Handle auction state side effects correctly outside of the subscription loop
  useEffect(() => {
    if (!auctionState) return;
    const prev = prevStateRef.current;

    if (prev?.is_active && !auctionState.is_active && auctionState.current_bid_team_id) {
      setAnimationOverlay('sold');
      setTimeout(() => setAnimationOverlay(null), 1000);
    } else if (prev?.is_active && !auctionState.is_active && !auctionState.current_bid_team_id) {
      setAnimationOverlay('unsold');
      setTimeout(() => setAnimationOverlay(null), 1000);
    }

    if (auctionState.current_player_id !== prev?.current_player_id) {
      setBidHistory([]);
    } else if (auctionState.current_bid && auctionState.current_bid_team_id) {
      setBidHistory((h) => {
        const newBid = { amount: auctionState.current_bid, teamId: auctionState.current_bid_team_id };
        
        if (h.length > 0 && h[0].teamId === newBid.teamId) {
          if (h[0].amount === newBid.amount) return h;
          const newHistory = [...h];
          newHistory[0] = newBid;
          return newHistory;
        }
        
        return [newBid, ...h].slice(0, 3);
      });
    }

    prevStateRef.current = auctionState;
  }, [auctionState]);

  useEffect(() => {
      if (auctionState?.current_bid_team_id && teams.length > 0) {
          const team = teams.find(t => t.id === auctionState.current_bid_team_id);
          setBiddingTeam(team);
      } else if (!auctionState?.current_bid_team_id) {
          setBiddingTeam(null);
      }
  }, [auctionState?.current_bid_team_id, teams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!auctionState && teams.length === 0 && allPlayers.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-[#00d4ff] text-2xl font-black uppercase tracking-[0.3em]">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-t-[#00d4ff] border-[#00d4ff]/20 rounded-full animate-spin shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
          Initializing Broadcast...
        </div>
      </div>
    );
  }

  const isPlayerDone = currentPlayer?.auction_status === 'sold' || currentPlayer?.auction_status === 'unsold';

  return (
    <div className="min-h-screen md:h-screen bg-[#0a0e1a] text-white overflow-x-hidden md:overflow-hidden flex flex-col font-sans relative" style={{ backgroundImage: 'linear-gradient(135deg, #0a0e1a 0%, #000000 100%)' }}>
      
      {/* CSS Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="particles-bg"></div>
      </div>

      {/* Header */}
      <header className="z-20 w-full px-4 md:px-8 pt-4 pb-2 flex flex-row items-center justify-between relative shrink-0">
        {/* Left: EVL Logo */}
        <div className="flex-1 flex justify-start items-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#000] border-2 border-[#00d4ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.5)] z-30 overflow-hidden shrink-0">
            <img src="/evl-hero.png" alt="EVL" className="w-[120%] h-[120%] object-contain filter drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]" />
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex-none flex justify-center px-2 md:px-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#00d4ff] drop-shadow-[0_0_15px_rgba(0,212,255,0.6)] leading-tight text-center whitespace-nowrap" style={{ fontFamily: 'Impact, sans-serif' }}>
            EVL AUCTION 2026
          </h1>
        </div>

        {/* Right: Status Bug */}
        <div className="flex-1 flex justify-end items-center">
           {auctionState?.is_active ? (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                 <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                 <span className="text-red-500 font-black text-sm uppercase tracking-[0.2em]">LIVE <span className="opacity-70 ml-1">00:24</span></span>
              </div>
           ) : (
              <div className="flex items-center gap-3 bg-gray-500/10 border border-gray-500/30 px-5 py-2 rounded-full">
                 <span className="text-gray-400 font-black text-sm uppercase tracking-[0.2em]">PAUSED</span>
              </div>
           )}
        </div>
      </header>

      {/* Main Container - 3 Column Grid */}
      <main className="z-10 flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative min-h-0 py-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {currentPlayer && !isPlayerDone ? (
            <motion.div
              key={currentPlayer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full h-auto lg:h-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-4 items-start justify-center pb-24 md:pb-0"
            >
              
              {/* LEFT COLUMN - PLAYER INFO */}
              <div className="flex flex-col gap-4 relative w-full lg:max-w-md ml-auto">
                 {/* Glowing left border in team color or electric blue */}
                 <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full shadow-[0_0_10px_#00d4ff] z-10" style={{ backgroundColor: biddingTeam ? (biddingTeam.color_theme || '#00d4ff') : '#00d4ff' }} />
                 
                 <div className="bg-[#11111a]/80 border border-[#00d4ff]/30 p-6 rounded-xl backdrop-blur-md relative overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                    {/* Watermark Jersey Number */}
                    <div className="absolute -right-4 -bottom-4 text-[150px] leading-none font-black text-white/[0.03] pointer-events-none select-none">
                       {currentPlayer.jersey_number || ''}
                    </div>
                    
                    <h2 className="text-[#00d4ff] text-xs font-black uppercase tracking-[0.3em] border-b border-[#00d4ff]/30 pb-2 mb-4">
                       Player Info
                    </h2>
                    
                    <h1 className="text-3xl lg:text-5xl font-black text-white uppercase mb-4 leading-tight" style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 0 15px rgba(0,212,255,0.6), 0 0 5px rgba(0,212,255,0.3)', letterSpacing: '0.05em' }}>
                       {currentPlayer.full_name}
                    </h1>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <p className="text-[#f5c518] text-xs font-bold uppercase tracking-widest mb-1">Jersey No.</p>
                          <p className="text-3xl font-black text-white">{currentPlayer.jersey_number || '--'}</p>
                       </div>
                       <div>
                          <p className="text-[#f5c518] text-xs font-bold uppercase tracking-widest mb-1">Age</p>
                          <p className="text-3xl font-black text-white">{currentPlayer.age || '--'}</p>
                       </div>
                       <div className="col-span-2">
                          <p className="text-[#f5c518] text-xs font-bold uppercase tracking-widest mb-1">Position / Role</p>
                          <p className="text-2xl font-black text-white">{currentPlayer.playing_role || 'Player'}</p>
                       </div>
                    </div>
                 </div>

                 {/* Volleyball Experience */}
                 <div className="bg-[#11111a]/80 border border-[#00d4ff]/30 p-6 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(0,212,255,0.1)] h-fit">
                    <h2 className="text-[#00d4ff] text-xs font-black uppercase tracking-[0.3em] border-b border-[#00d4ff]/30 pb-2 mb-3">
                       Volleyball Experience
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                       {currentPlayer.volleyball_experience || currentPlayer.previous_tournament_experience || "No prior tournament experience listed."}
                    </p>
                 </div>
              </div>

              {/* CENTER COLUMN - PHOTO */}
              <div className="flex flex-col items-center justify-start gap-3 w-full max-w-[350px] shrink-0 mx-auto">
                 {/* Photo Hexagon (Made larger and isolated) */}
                 <div className="relative flex justify-center">
                    <div className="w-[320px] h-[368px] lg:w-[350px] lg:h-[402px] bg-[#00d4ff] p-1.5 shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all duration-300" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                       <div className="w-full h-full bg-[#0a0e1a] overflow-hidden flex items-center justify-center relative" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#00d4ff]/20 to-transparent pointer-events-none z-10" />
                          {currentPlayer.photo_url && currentPlayer.photo_url !== 'placeholder' ? (
                             <img src={currentPlayer.photo_url} alt="" className="w-full h-full object-cover object-top filter contrast-125 brightness-110" />
                          ) : (
                             <div className="text-[#00d4ff]/20 text-7xl font-black">EVL</div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* RIGHT COLUMN - BIDDING */}
              <div className="flex flex-col gap-4 w-full lg:max-w-md mr-auto">
                 
                 {/* Base Price Panel */}
                 <div className="bg-[#11111a]/80 border border-[#00d4ff]/30 p-5 rounded-xl backdrop-blur-md flex justify-between items-center shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                    <span className="text-[#f5c518] text-sm font-bold uppercase tracking-widest">Base Price</span>
                    <span className="text-white font-mono font-black text-2xl">₹ {currentPlayer.base_price?.toLocaleString() || '0'}</span>
                 </div>

                 {/* Current Bid Panel */}
                 <div className="bg-[#11111a]/90 border-2 border-[#00d4ff] p-6 lg:p-8 rounded-xl backdrop-blur-md shadow-[0_0_30px_rgba(0,212,255,0.2)] flex flex-col items-center">
                    <p className="text-[#00d4ff] text-sm font-black uppercase tracking-[0.4em] mb-2">Current Bid</p>
                    <motion.div 
                      key={auctionState?.current_bid}
                      initial={{ scale: 1.15, textShadow: '0 0 40px rgba(0,212,255,1)' }}
                      animate={{ scale: 1, textShadow: '0 0 20px rgba(0,212,255,0.6)' }}
                      className="text-6xl lg:text-7xl font-mono font-black text-white mb-8"
                    >
                      <span className="text-[#00d4ff] mr-2">₹</span>{auctionState?.current_bid?.toLocaleString() || '0'}
                    </motion.div>

                    <div className="w-full bg-[#0a0e1a]/80 rounded-xl p-5 flex flex-col items-center border border-white/10 relative overflow-hidden">
                       <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Leading Team</p>
                       
                       {biddingTeam ? (
                         <div className="flex flex-col items-center w-full z-10">
                            {biddingTeam.logo_url && <img src={biddingTeam.logo_url} className="h-20 object-contain drop-shadow-lg mb-3" alt="" />}
                            <p className="text-3xl font-black text-white uppercase tracking-wider text-center drop-shadow-md" style={{ color: biddingTeam.color_theme || '#fff' }}>{biddingTeam.name}</p>
                            
                            <div className="w-full h-px bg-white/10 my-4" />
                            
                            <div className="flex justify-between items-center w-full px-2">
                               <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Remaining Purse</span>
                               <span className="text-[#f5c518] font-mono font-black text-xl">₹ {(biddingTeam.purse_remaining - (auctionState?.current_bid || 0)).toLocaleString()}</span>
                            </div>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center py-8 z-10">
                            <span className="w-10 h-10 rounded-full border-2 border-dashed border-[#00d4ff]/50 animate-spin-slow mb-4" />
                            <p className="text-sm font-black text-[#00d4ff]/70 uppercase tracking-widest">AWAITING BID...</p>
                         </div>
                       )}
                       
                       {biddingTeam && (
                         <div className="absolute inset-0 opacity-10 animate-pulse" style={{ backgroundColor: biddingTeam.color_theme || '#00d4ff' }} />
                       )}
                    </div>
                 </div>

                 {/* Bid History Mini Feed */}
                 <div className="w-full bg-[#11111a]/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm shadow-[0_0_15px_rgba(0,212,255,0.05)]">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-3">Recent Bids</p>
                    <div className="flex flex-col gap-2 overflow-hidden h-[90px]">
                       {bidHistory.length > 0 ? bidHistory.filter((bid, idx, arr) => idx === 0 || bid.teamId !== arr[idx - 1].teamId).slice(0, 3).map((bid, idx) => {
                          const team = teams.find(t => t.id === bid.teamId);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm animate-fade-in-up opacity-80">
                               <span className="text-gray-300 truncate w-40 flex items-center gap-2">
                                 {team?.logo_url && <img src={team.logo_url} className="h-5 w-5 object-contain" alt="" />}
                                 {team?.name || 'Unknown Team'}
                               </span>
                               <span className="font-mono font-bold text-gray-300">₹ {bid.amount.toLocaleString()}</span>
                            </div>
                          );
                       }) : (
                          <div className="text-sm text-gray-600 italic text-center py-2">No bids yet</div>
                       )}
                    </div>
                 </div>

              </div>

            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 w-full flex items-center justify-center pointer-events-none"
            >
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SOLD Overlay */}
      <AnimatePresence>
        {animationOverlay === 'sold' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0e1a]/90 backdrop-blur-sm pointer-events-none"
          >
            {/* CSS Confetti */}
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
              {Array.from({ length: 100 }).map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 80; // vw/vh
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const color = ['#f5c518', '#00d4ff', '#ff0055', '#00ffaa', '#aa00ff', '#ffffff'][Math.floor(Math.random() * 6)];
                const size = Math.random() * 10 + 5;
                return (
                  <div 
                    key={i} 
                    className="absolute rounded-full confetti-particle"
                    style={{ 
                      width: size, height: size, backgroundColor: color, boxShadow: `0 0 10px ${color}`,
                      '--tx': `${tx}vw`, '--ty': `${ty}vh`, animationDelay: `${Math.random() * 0.2}s`
                    } as any}
                  />
                );
              })}
            </div>
            
            <div className="flex flex-col items-center justify-center z-10">
              <div
                className="text-7xl md:text-[150px] font-black text-[#f5c518] uppercase tracking-widest drop-shadow-[0_0_50px_rgba(245,197,24,0.8)] leading-none mb-6 animate-sold-scale"
                style={{ fontFamily: 'Impact, sans-serif' }}
              >
                SOLD!
              </div>
              
              <div className="flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
                <div className="text-3xl md:text-5xl font-black text-[#00d4ff] uppercase tracking-widest drop-shadow-[0_0_20px_rgba(0,212,255,0.6)]">
                  TO
                </div>
                
                {biddingTeam && (
                  <div
                    className="flex items-center justify-center gap-4 bg-[#11111a] border-4 rounded-3xl px-12 py-6 overflow-hidden relative animate-sold-pulse"
                    style={{ borderColor: biddingTeam.color_theme || '#f5c518', '--team-color': biddingTeam.color_theme || '#f5c518' } as any}
                  >
                    <div className="absolute inset-0 bg-white/10" />
                    {biddingTeam.logo_url && <img src={biddingTeam.logo_url} className="h-16 object-contain z-10 drop-shadow-lg" alt="" />}
                    <span className="text-5xl font-black text-white uppercase tracking-wider z-10 drop-shadow-md">{biddingTeam.name}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* UNSOLD Overlay */}
        {animationOverlay === 'unsold' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(50,55,65,0.95)_0%,rgba(10,14,26,0.98)_100%)] backdrop-blur-md pointer-events-none"
          >
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(255,255,255,0.03)] pointer-events-none" />
            
            <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, times: [0, 0.5, 1], ease: "easeInOut" }}
                className="absolute top-[45%] -translate-y-1/2 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-slate-400 to-transparent z-0"
              />
              
              <motion.div 
                initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center z-10"
              >
                <div className="text-6xl md:text-8xl font-black text-slate-100 uppercase tracking-[0.4em] leading-none drop-shadow-2xl">
                  UNSOLD
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sponsor Strip */}
      <div className="w-full bg-[#11111a] border-t border-[#00d4ff]/30 py-4 px-6 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 z-10 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
         <span className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-[0.3em] mb-2 md:mb-0">Sponsored by:</span>
         
         <div className="flex items-center gap-8 md:gap-16 bg-white/5 px-8 py-3 rounded-full border border-white/10 shadow-inner">
            <img src="/wendys_logo.png" alt="Wendy's" className="h-[40px] md:h-[60px] w-auto object-contain" />
            <div className="h-8 w-px bg-white/20" />
            <img src="/enser_logo.png" alt="Enser" className="h-[35px] md:h-[45px] w-auto object-contain" />
            <div className="h-8 w-px bg-white/20" />
            <img src="/namhra_logo.png" alt="Namhra" className="h-[35px] md:h-[45px] w-auto object-contain" />
         </div>
      </div>

      {/* Bottom Ticker */}
      <footer className="z-20 h-10 bg-black border-t-2 border-[#00d4ff] flex items-center overflow-hidden shrink-0 sticky bottom-0 w-full shadow-[0_-5px_20px_rgba(0,212,255,0.15)]">
         <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
         <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />
         
         <div className="flex animate-marquee whitespace-nowrap items-center h-full">
            {teams.length === 0 ? (
              <span className="px-8 text-gray-600 text-xs uppercase font-bold tracking-widest">No teams loaded</span>
            ) : (
              [...teams, ...teams, ...teams, ...teams, ...teams].map((team, idx) => {
              const isLeading = biddingTeam?.id === team.id;
              const displayedPurse = isLeading ? (team.purse_remaining - (auctionState?.current_bid || 0)) : team.purse_remaining;
              
              return (
                <div key={`${team.id}-${idx}`} className="flex items-center px-8 border-r border-white/10">
                  {team.logo_url && <img src={team.logo_url} className="h-6 mr-3 object-contain" alt="" />}
                  <span className={`text-sm font-bold uppercase tracking-widest mr-4 ${idx % 2 === 0 ? 'text-[#00d4ff]' : 'text-gray-300'}`}>
                    {team.name}
                  </span>
                  <span className="text-[10px] text-gray-500 mr-2 uppercase tracking-widest">Purse</span>
                  <span className={`font-mono font-black text-sm ${isLeading ? 'text-[#f5c518]' : 'text-white'}`}>
                    {displayedPurse.toLocaleString()}
                  </span>
                </div>
              );
            })
            )}
         </div>
      </footer>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
          width: fit-content;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }

        /* Sold/Unsold Overlays */
        @keyframes confetti-explode {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
        }
        .confetti-particle {
          animation: confetti-explode 1s ease-out forwards;
        }
        
        @keyframes sold-scale {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-sold-scale {
          animation: sold-scale 0.3s ease-out forwards;
        }
        
        @keyframes sold-pulse {
          0% { transform: scale(1); box-shadow: 0 0 20px var(--team-color); }
          25% { transform: scale(1.05); box-shadow: 0 0 60px var(--team-color); }
          50% { transform: scale(1); box-shadow: 0 0 20px var(--team-color); }
          75% { transform: scale(1.05); box-shadow: 0 0 60px var(--team-color); }
          100% { transform: scale(1); box-shadow: 0 0 20px var(--team-color); }
        }
        .animate-sold-pulse {
          animation: sold-pulse 0.5s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        
        @keyframes unsold-shake {
          0% { transform: translateX(-100px); opacity: 0; }
          40% { transform: translateX(0); opacity: 1; }
          55% { transform: translateX(-15px); }
          70% { transform: translateX(15px); }
          85% { transform: translateX(-15px); }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-unsold-shake {
          animation: unsold-shake 0.4s ease-out forwards;
        }
        
        /* Subtly Animated Star/Particle Background */
        .particles-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 40px 70px, #00d4ff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 90px 40px, #00d4ff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 160px 120px, #00d4ff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: particle-drift 100s linear infinite;
          opacity: 0.3;
        }
        @keyframes particle-drift {
          0% { transform: translateY(0); }
          100% { transform: translateY(-200px); }
        }
      `}</style>
    </div>
  );
}

