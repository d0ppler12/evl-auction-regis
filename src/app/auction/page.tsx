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
  const [isSold, setIsSold] = useState(false);
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
          return prev.map((p) => p.id === payload.new.id ? payload.new : p);
        });
        setCurrentPlayer((prev: any) => {
          if (prev && payload.eventType === 'UPDATE' && prev.id === payload.new.id) {
            return payload.new;
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
      setIsSold(true);
      setTimeout(() => setIsSold(false), 4000);
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

  return (
    <div className="min-h-screen md:h-screen bg-[#0a0e1a] text-white overflow-x-hidden md:overflow-hidden flex flex-col font-sans relative" style={{ backgroundImage: 'linear-gradient(135deg, #0a0e1a 0%, #000000 100%)' }}>
      
      {/* CSS Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="particles-bg"></div>
      </div>

      {/* Header */}
      <header className="z-20 w-full px-4 pt-4 pb-2 flex flex-row items-center justify-center md:justify-center relative shrink-0 gap-3 md:gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#000] border-2 border-[#00d4ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.5)] z-30 overflow-hidden shrink-0">
          <img src="/evl-hero.png" alt="EVL" className="w-[120%] h-[120%] object-contain filter drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#00d4ff] drop-shadow-[0_0_15px_rgba(0,212,255,0.6)] leading-tight text-center" style={{ fontFamily: 'Impact, sans-serif' }}>
          EVL AUCTION 2026
        </h1>
      </header>

      {/* Main Container - 3 Column Grid */}
      <main className="z-10 flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative min-h-0 py-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {currentPlayer ? (
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
                 
                 <div className="bg-[#11111a]/80 border border-[#00d4ff]/30 p-5 rounded-xl backdrop-blur-md relative overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                    {/* Watermark Jersey Number */}
                    <div className="absolute -right-4 -bottom-4 text-[150px] leading-none font-black text-white/[0.03] pointer-events-none select-none">
                       {currentPlayer.jersey_number || ''}
                    </div>
                    
                    <h2 className="text-[#00d4ff] text-xs font-black uppercase tracking-[0.3em] border-b border-[#00d4ff]/30 pb-2 mb-3">
                       Player Info
                    </h2>
                    
                    <h1 className="text-3xl lg:text-4xl font-black text-white uppercase mb-2 leading-tight" style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 0 15px rgba(0,212,255,0.6), 0 0 5px rgba(0,212,255,0.3)', letterSpacing: '0.08em' }}>
                       {currentPlayer.full_name}
                    </h1>
                    
                    <div className="flex flex-col gap-4">
                       <div>
                          <p className="text-[#f5c518] text-xs font-bold uppercase tracking-widest mb-1">Jersey No.</p>
                          <p className="text-2xl font-black text-white">{currentPlayer.jersey_number || '--'}</p>
                       </div>
                       <div>
                          <p className="text-[#f5c518] text-xs font-bold uppercase tracking-widest mb-1">Position</p>
                          <p className="text-xl font-black text-white uppercase">{currentPlayer.playing_position || 'PLAYER'}</p>
                       </div>
                       <div>
                          <p className="text-[#f5c518] text-xs font-bold uppercase tracking-widest mb-1">Age</p>
                          <p className="text-xl font-black text-white">{currentPlayer.age || '--'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* CENTER COLUMN - PHOTO + BID PANEL */}
              <div className="flex flex-col items-center justify-start gap-3 w-full max-w-[320px] shrink-0 mx-auto">
                 
                 {/* Top Slim Bar: Base Price & Status */}
                 <div className="w-full bg-[#11111a]/80 border border-[#00d4ff]/30 rounded-full px-5 py-2 flex justify-between items-center backdrop-blur-sm shadow-[0_0_10px_rgba(0,212,255,0.15)]">
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Base Price</span>
                       <span className="text-white font-mono font-black text-sm">{currentPlayer.base_price?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Status</span>
                       {auctionState?.is_active ? (
                         <span className="text-red-500 font-black text-xs flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" /> LIVE</span>
                       ) : (
                         <span className="text-gray-500 font-black text-xs">PAUSED</span>
                       )}
                    </div>
                 </div>

                 {/* Photo Hexagon */}
                 <div className="relative mt-1 flex justify-center">
                    <div className="w-[280px] h-[322px] bg-[#00d4ff] p-1.5 shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                       <div className="w-full h-full bg-[#0a0e1a] overflow-hidden flex items-center justify-center relative" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#00d4ff]/20 to-transparent pointer-events-none" />
                          {currentPlayer.photo_url && currentPlayer.photo_url !== 'placeholder' ? (
                             <img src={currentPlayer.photo_url} alt="" className="w-full h-full object-cover object-top filter contrast-125 brightness-110" />
                          ) : (
                             <div className="text-[#00d4ff]/20 text-7xl font-black">EVL</div>
                          )}
                       </div>
                    </div>
                    
                    {isSold && (
                      <motion.div 
                        initial={{ scale: 4, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: -15 }}
                        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                      >
                         <div className="text-6xl font-black text-red-500 border-8 border-red-500 px-8 py-2 rounded-xl backdrop-blur-md bg-black/80 uppercase tracking-widest shadow-[0_0_40px_rgba(239,68,68,0.8)]" style={{ textShadow: '0 0 20px rgba(239,68,68,0.8)' }}>
                           SOLD
                         </div>
                      </motion.div>
                    )}
                 </div>

                 {/* Bid Amount & Action Area */}
                 <div className="w-full flex flex-col items-center mt-1">
                    <p className="text-[#00d4ff] text-[10px] font-black uppercase tracking-[0.3em] mb-0">Current Bid</p>
                    <motion.div 
                      key={auctionState?.current_bid}
                      initial={{ scale: 1.15, textShadow: '0 0 40px rgba(0,212,255,1)' }}
                      animate={{ scale: 1, textShadow: '0 0 20px rgba(0,212,255,0.6)' }}
                      className="text-5xl font-mono font-black text-[#00d4ff] mb-2"
                    >
                      {auctionState?.current_bid?.toLocaleString() || '0'}
                    </motion.div>

                    {/* Pulsing Button for Current Bidder */}
                    <div className="w-full relative group">
                      {biddingTeam ? (
                        <div 
                          className="w-full rounded-xl p-3 flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 border border-white/20"
                          style={{ 
                            backgroundColor: biddingTeam.color_theme || '#00d4ff',
                            boxShadow: `0 0 20px ${biddingTeam.color_theme || '#00d4ff'}99` 
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          {biddingTeam.logo_url && <img src={biddingTeam.logo_url} className="h-7 object-contain z-10 drop-shadow-md" alt="" />}
                          <p className="text-xl font-black text-white uppercase tracking-wider z-10 truncate drop-shadow-md">{biddingTeam.name}</p>
                        </div>
                      ) : (
                        <div className="w-full bg-[#0a0e1a] border-2 border-[#00d4ff]/50 rounded-xl p-3 flex items-center justify-center shadow-[0_0_10px_rgba(0,212,255,0.1)] relative overflow-hidden">
                          <div className="absolute inset-0 bg-[#00d4ff]/5 animate-pulse" />
                          <p className="text-sm font-black text-[#00d4ff]/70 uppercase tracking-widest z-10">AWAITING BID...</p>
                        </div>
                      )}
                    </div>
                 </div>

              </div>

              {/* RIGHT COLUMN - STATS */}
              <div className="flex flex-col gap-4 w-full lg:max-w-md mr-auto">
                 <div className="bg-[#11111a]/80 border border-[#00d4ff]/30 p-5 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(0,212,255,0.1)] h-fit">
                    <h2 className="text-[#00d4ff] text-xs font-black uppercase tracking-[0.3em] border-b border-[#00d4ff]/30 pb-2 mb-2">
                       Volleyball Experience
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                       {currentPlayer.volleyball_experience || currentPlayer.previous_tournament_experience || "No prior tournament experience listed."}
                    </p>
                 </div>

                 {/* Bid History Mini Feed */}
                 <div className="w-full bg-[#11111a]/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm shadow-[0_0_15px_rgba(0,212,255,0.05)] h-fit">
                    <p className="text-[#00d4ff] text-xs font-black uppercase tracking-[0.3em] border-b border-[#00d4ff]/30 pb-2 mb-2">Bid History</p>
                    <div className="flex flex-col gap-2 h-[75px] overflow-hidden">
                       {bidHistory.length > 0 ? bidHistory.filter((bid, idx, arr) => idx === 0 || bid.teamId !== arr[idx - 1].teamId).map((bid, idx) => {
                          const team = teams.find(t => t.id === bid.teamId);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm animate-fade-in-up">
                               <span className="text-gray-400 truncate w-40">{team?.name || 'Unknown Team'}</span>
                               <span className="font-mono font-bold text-[#00d4ff]">{bid.amount.toLocaleString()}</span>
                            </div>
                          );
                       }) : (
                          <div className="text-sm text-gray-600 italic">No bids yet</div>
                       )}
                    </div>
                 </div>
              </div>

            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-600 font-black text-3xl sm:text-4xl tracking-widest uppercase py-24 w-full">
              Awaiting Next Player
            </div>
          )}
        </AnimatePresence>
      </main>

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
          animation: fade-in-up 0.3s ease-out forwards;
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

