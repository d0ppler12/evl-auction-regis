"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AuctionPage() {
  const [auctionState, setAuctionState] = useState<any>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [biddingTeam, setBiddingTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [isSold, setIsSold] = useState(false);
  
  useEffect(() => {
    // 1. Fetch initial teams for purse display
    async function fetchInitialData() {
      const { data: teamsData } = await supabase.from('teams').select('*');
      if (teamsData) setTeams(teamsData);

      const { data: stateData } = await supabase.from('auction_state').select('*').eq('id', 1).single();
      if (stateData) {
        setAuctionState(stateData);
        if (stateData.current_player_id) fetchPlayer(stateData.current_player_id);
        if (stateData.current_bid_team_id && teamsData) {
           const team = teamsData.find(t => t.id === stateData.current_bid_team_id);
           setBiddingTeam(team);
        }
      } else {
        // Mock data
        setTeams([{ id: '1', name: 'Spikers Syndicate', purse_remaining: 85000 }, { id: '2', name: 'Net Ninjas', purse_remaining: 125000 }]);
        setCurrentPlayer({ id: '1', full_name: 'Alice Smith', playing_position: 'Hitter', base_price: 5000, age: 24, wing_building: 'A Wing' });
        setAuctionState({ current_bid: 15000, is_active: true });
        setBiddingTeam({ name: 'Spikers Syndicate' });
      }
    }
    fetchInitialData();

    // 2. Set up realtime subscription
    const subscription = supabase
      .channel('auction_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, payload => {
        const newState = payload.new as any;
        setAuctionState(newState);
        if (newState.current_player_id && (!currentPlayer || newState.current_player_id !== currentPlayer.id)) {
            fetchPlayer(newState.current_player_id);
        }
        
        // Handle Sold State (is_active goes from true to false)
        if (auctionState && auctionState.is_active && !newState.is_active && newState.current_bid_team_id) {
            setIsSold(true);
            setTimeout(() => setIsSold(false), 4000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [auctionState, currentPlayer]);

  useEffect(() => {
      if (auctionState?.current_bid_team_id && teams.length > 0) {
          const team = teams.find(t => t.id === auctionState.current_bid_team_id);
          setBiddingTeam(team);
      } else if (!auctionState?.current_bid_team_id) {
          setBiddingTeam(null);
      }
  }, [auctionState?.current_bid_team_id, teams]);

  async function fetchPlayer(id: string) {
    const { data } = await supabase.from('players').select('*').eq('id', id).single();
    if (data) setCurrentPlayer(data);
  }

  // Handle keyboard shortcut for fullscreen
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

  if (!currentPlayer && !auctionState) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white neon-text text-2xl font-bold">LOADING AUCTION...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col font-sans relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[150px] mix-blend-screen animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="z-10 flex justify-between items-center p-6 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-white transition-colors">
             &larr; Back
          </Link>
          <h1 className="text-2xl font-extrabold tracking-widest neon-text">CHAMPIONSHIP AUCTION</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-xs text-muted-foreground uppercase tracking-widest">Player Status</p>
             <p className={`text-sm font-bold ${auctionState?.is_active ? 'text-green-400' : 'text-yellow-400'}`}>
               {auctionState?.is_active ? 'LIVE BIDDING' : 'PAUSED'}
             </p>
          </div>
          <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs border border-white/20 transition-colors" onClick={() => document.documentElement.requestFullscreen()}>
            [F] Fullscreen
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 flex-1 flex flex-col lg:flex-row p-6 gap-8 relative">
        
        {/* Left Column: Player Info */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <AnimatePresence mode="wait">
            {currentPlayer && (
              <motion.div
                key={currentPlayer.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-full max-w-2xl"
              >
                <div className="glass-card rounded-3xl p-1 relative overflow-hidden border-2 border-primary/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                  {isSold && (
                    <motion.div 
                      initial={{ scale: 3, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: -20 }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-8xl font-black text-red-500 border-8 border-red-500 px-8 py-2 rounded-xl backdrop-blur-sm bg-black/40"
                      style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}
                    >
                      SOLD
                    </motion.div>
                  )}
                  
                  <div className="bg-black/80 rounded-[22px] p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-64 h-64 rounded-full bg-gray-800 border-4 border-secondary/50 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)] shrink-0 flex items-center justify-center">
                        <span className="text-gray-500 text-xl font-bold uppercase tracking-widest">Photo</span>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <h2 className="text-5xl lg:text-6xl font-black mb-2 tracking-tighter uppercase text-white neon-text line-clamp-2">
                          {currentPlayer.full_name}
                        </h2>
                        <p className="text-2xl text-primary font-bold tracking-widest uppercase mb-6">
                          {currentPlayer.playing_position}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-muted-foreground uppercase mb-1">Age</p>
                            <p className="text-xl font-bold">{currentPlayer.age || 'N/A'}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-muted-foreground uppercase mb-1">Building</p>
                            <p className="text-xl font-bold">{currentPlayer.wing_building || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Bidding Info */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-8 flex-1 flex flex-col justify-center items-center border-2 border-secondary/30 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />
            
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 z-10">Current Bid</p>
            <motion.div 
              key={auctionState?.current_bid}
              initial={{ scale: 1.2, color: '#fff' }}
              animate={{ scale: 1, color: '#3b82f6' }}
              className="text-6xl md:text-8xl font-black font-mono mb-8 z-10 text-secondary neon-border-text"
              style={{ textShadow: '0 0 20px rgba(59,130,246,0.5)' }}
            >
              ₹{auctionState?.current_bid?.toLocaleString() || '0'}
            </motion.div>

            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 z-10">Bidding Team</p>
            <div className="text-3xl font-bold text-white text-center h-20 flex items-center justify-center z-10 w-full bg-white/5 rounded-xl border border-white/10 p-4">
              {biddingTeam?.name || '---'}
            </div>

            <div className="w-full mt-8 pt-8 border-t border-white/10 flex justify-between items-center z-10">
              <span className="text-muted-foreground uppercase tracking-widest text-sm">Base Price</span>
              <span className="text-2xl font-mono font-bold text-white">₹{currentPlayer?.base_price?.toLocaleString() || '0'}</span>
            </div>
          </div>

          {/* Teams Purse Mini-Display */}
          <div className="glass-card rounded-xl p-4 h-64 overflow-y-auto">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 sticky top-0 bg-background/90 backdrop-blur pb-2">Teams Remaining Purse</h3>
            <div className="space-y-2">
              {teams.map(team => (
                <div key={team.id} className="flex justify-between items-center text-sm p-3 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <span className="font-semibold truncate max-w-[180px]">{team.name}</span>
                  <span className="font-mono text-primary font-bold">₹{team.purse_remaining?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
