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
  const [isSold, setIsSold] = useState(false);
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

    const channel = supabase.channel('auction_display_yt')
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
            setIsSold(true);
            setTimeout(() => setIsSold(false), 4000);
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

      {/* Bottom Center: Lower Third Overlay */}
      <div className="w-full flex justify-center mb-8">
        <AnimatePresence mode="wait">
          {currentPlayer ? (
            <motion.div
              key={currentPlayer.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-[1000px] h-[140px] bg-gradient-to-r from-gray-900 via-[#0b1221] to-gray-900 border border-gray-700/50 rounded-xl shadow-2xl flex items-center overflow-hidden relative backdrop-blur-md"
            >
              {isSold && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                  <motion.span 
                    initial={{ scale: 3 }} animate={{ scale: 1 }}
                    className="text-6xl font-black text-red-500 uppercase tracking-[0.2em] rotate-[-5deg]"
                  >
                    SOLD TO {biddingTeam?.name}
                  </motion.span>
                </div>
              )}

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
                  <span className="text-amber-500">{currentPlayer.playing_position || 'PLAYER'}</span>
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
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-[1000px] h-[60px] bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-2xl flex items-center justify-center backdrop-blur-md"
            >
               <span className="text-lg font-black text-gray-400 uppercase tracking-widest animate-pulse">Waiting for Next Player...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
