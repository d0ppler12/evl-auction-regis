"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function YouTubeOverlay() {
  const [auctionState, setAuctionState] = useState<any>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [biddingTeam, setBiddingTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [animationOverlay, setAnimationOverlay] = useState<'sold' | 'unsold' | null>(null);
  const [prevState, setPrevState] = useState<any>(null);
  
  useEffect(() => {
    async function init() {
      const { data: t } = await supabase.from('teams').select('*').order('name');
      const { data: p } = await supabase.from('players').select('*');
      
      if (t) setTeams(t);
      if (p) setAllPlayers(p);

      const { data: s } = await supabase.from('auction_state').select('*').eq('id', 1).maybeSingle();
      if (s) {
        setAuctionState(s);
        setPrevState(s);
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

    const channel = supabase.channel('evl_auction_sync')
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

        setPrevState((prev: any) => {
          if (prev?.is_active && !ns.is_active && ns.current_bid_team_id) {
            setAnimationOverlay('sold');
            setTimeout(() => setAnimationOverlay(null), 1000);
          } else if (prev?.is_active && !ns.is_active && !ns.current_bid_team_id) {
            setAnimationOverlay('unsold');
            setTimeout(() => setAnimationOverlay(null), 1000);
          }
          return ns;
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

  useEffect(() => {
      if (auctionState?.current_bid_team_id && teams.length > 0) {
          const team = teams.find(t => t.id === auctionState.current_bid_team_id);
          setBiddingTeam(team);
      } else if (!auctionState?.current_bid_team_id) {
          setBiddingTeam(null);
      }
  }, [auctionState?.current_bid_team_id, teams]);

  // Enforce transparent body background for OBS
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  const isPlayerDone = currentPlayer?.auction_status === 'sold' || currentPlayer?.auction_status === 'unsold';

  // Transparent background for OBS
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col justify-between pointer-events-none p-8 font-sans" style={{ backgroundColor: 'transparent' }}>
      
      {/* Top Left: LIVE Badge */}
      <div className="flex items-center gap-4">
        {auctionState?.is_active ? (
          <div className="bg-red-600 text-white px-4 py-1.5 rounded flex items-center gap-2 font-black tracking-widest text-sm shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
          </div>
        ) : (
          <div className="bg-gray-800 text-white px-4 py-1.5 rounded flex items-center gap-2 font-black tracking-widest text-sm shadow-lg">
            PAUSED
          </div>
        )}
        <div className="bg-blue-600/90 backdrop-blur text-white px-4 py-1.5 rounded flex items-center gap-2 font-black tracking-widest text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] uppercase">
          <img src="/evl-hero.png" alt="EVL" className="h-5 drop-shadow-md" /> EVL Auction
        </div>
      </div>

      {/* Main Display Area (Lower Thirds) */}
      <div className="flex-1 flex flex-col items-center justify-end pb-12 overflow-hidden relative">
        <div className="relative w-[1000px] h-[140px] overflow-hidden rounded-xl">
          <AnimatePresence mode="wait">
            {currentPlayer && !isPlayerDone ? (
              <motion.div
                key={currentPlayer.id}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full h-full bg-gradient-to-r from-gray-900 via-[#0b1221] to-gray-900 border border-gray-700/50 rounded-xl shadow-2xl flex items-center overflow-hidden relative backdrop-blur-md"
              >
                {/* Player Photo */}
                <div className="w-[140px] h-[140px] bg-blue-900/40 shrink-0 relative overflow-hidden flex items-end justify-center">
                  {currentPlayer.photo_url && currentPlayer.photo_url !== 'placeholder' ? (
                    <img src={currentPlayer.photo_url} alt="" className="w-full h-full object-cover object-top filter contrast-125" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-500/20 text-4xl font-black">EVL</div>
                  )}
                  {/* Fade gradient on the right side of the image */}
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-900 to-transparent" />
                </div>

                {/* Player Info */}
                <div className="flex-1 flex flex-col justify-center px-6">
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter truncate leading-none mb-2 drop-shadow-md">
                    {currentPlayer.full_name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    <span className="text-amber-500">PLAYER</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>#{currentPlayer.jersey_number || '--'}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>Age {currentPlayer.age || '--'}</span>
                  </div>
                </div>

                {/* Bid Info */}
                <div className="w-[320px] bg-black/40 h-full flex flex-col items-center justify-center border-l border-white/10 px-6 relative">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Current Bid</p>
                  <motion.div 
                    key={auctionState?.current_bid}
                    initial={{ scale: 1.2, color: '#fff' }}
                    animate={{ scale: 1, color: '#FBBF24' }}
                    className="text-5xl font-black font-mono text-amber-400 leading-none drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                  >
                    {auctionState?.current_bid?.toLocaleString() || '0'}
                  </motion.div>
                </div>

                {/* Leading Team */}
                <div className="w-[200px] h-full flex flex-col items-center justify-center bg-white/5 px-4 border-l border-white/10">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Leading</p>
                  {biddingTeam ? (
                    <>
                      {biddingTeam.logo_url ? (
                        <img src={biddingTeam.logo_url} className="h-10 object-contain mb-1 drop-shadow-lg" alt="" />
                      ) : (
                        <div className="text-xl font-black text-white">{biddingTeam.name.charAt(0)}</div>
                      )}
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate w-full text-center mt-1">{biddingTeam.name}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">No Bid</p>
                  )}
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 bottom-0 h-[60px]"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {animationOverlay === 'sold' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0a0e1a]/90 backdrop-blur-sm rounded-xl overflow-hidden pointer-events-none"
              >
                {/* CSS Confetti */}
                <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 30 + Math.random() * 80;
                    const tx = Math.cos(angle) * distance;
                    const ty = Math.sin(angle) * distance;
                    const color = ['#f5c518', '#00d4ff', '#ff0055', '#00ffaa', '#aa00ff', '#ffffff'][Math.floor(Math.random() * 6)];
                    const size = Math.random() * 8 + 4;
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
                
                <div className="flex items-center justify-center gap-6 z-10">
                  <div
                    className="text-6xl font-black text-[#f5c518] uppercase tracking-widest drop-shadow-[0_0_20px_rgba(245,197,24,0.8)] leading-none animate-sold-scale"
                    style={{ fontFamily: 'Impact, sans-serif' }}
                  >
                    SOLD!
                  </div>
                  
                  <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
                    <div className="text-3xl font-black text-[#00d4ff] uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,212,255,0.6)]">
                      TO
                    </div>
                    
                    {biddingTeam && (
                      <div
                        className="flex items-center justify-center gap-3 bg-[#11111a] border-2 rounded-xl px-6 py-2 overflow-hidden relative animate-sold-pulse"
                        style={{ borderColor: biddingTeam.color_theme || '#f5c518', '--team-color': biddingTeam.color_theme || '#f5c518' } as any}
                      >
                        <div className="absolute inset-0 bg-white/10" />
                        {biddingTeam.logo_url && <img src={biddingTeam.logo_url} className="h-8 object-contain z-10 drop-shadow-lg" alt="" />}
                        <span className="text-3xl font-black text-white uppercase tracking-wider z-10 drop-shadow-md">{biddingTeam.name}</span>
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
                className="absolute inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(50,55,65,0.95)_0%,rgba(10,14,26,0.98)_100%)] backdrop-blur-md rounded-xl pointer-events-none overflow-hidden"
              >
                <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)] rounded-xl pointer-events-none" />
                
                <div className="relative w-full max-w-lg flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.0, times: [0, 0.5, 1], ease: "easeInOut" }}
                    className="absolute top-[40%] -translate-y-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-slate-400 to-transparent z-0"
                  />

                  <motion.div 
                    initial={{ opacity: 0, filter: "blur(5px)", scale: 0.95 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center z-10"
                  >
                    <div className="text-4xl font-black text-slate-100 uppercase tracking-[0.4em] leading-none drop-shadow-lg">
                      UNSOLD
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
