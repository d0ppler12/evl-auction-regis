"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Gavel, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Player = {
  id: string;
  full_name: string;
  photo_url?: string;
  jersey_number?: number | null;
  base_price?: number;
  wing_building?: string;
  team_id?: string | null;
};

type Team = { id: string; name: string; logo_url?: string };

interface AuctionStagePanelProps {
  currentPlayer: Player | null;
  auctionState: {
    current_bid?: number;
    current_bid_team_id?: string | null;
    is_active?: boolean;
  };
  teams: Team[];
  selectedTeamId: string;
  bidAmount: string;
  banner: "sold" | "unsold" | null;
  onBidAmountChange: (v: string) => void;
  onIncrement: (n: number) => void;
  onCustomBid: () => void;
  onSold: () => void;
  onUnsold: () => void;
  onPause: () => void;
  onResume: () => void;
  onResetLot: () => void;
}

const TIMER_SECONDS = 30;

export function AuctionStagePanel({
  currentPlayer,
  auctionState,
  teams,
  selectedTeamId,
  bidAmount,
  banner,
  onBidAmountChange,
  onIncrement,
  onCustomBid,
  onSold,
  onUnsold,
  onPause,
  onResume,
  onResetLot,
}: AuctionStagePanelProps) {
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const leadingTeam = teams.find((t) => t.id === auctionState.current_bid_team_id);
  const isActive = auctionState.is_active && currentPlayer;

  useEffect(() => {
    if (currentPlayer && auctionState.is_active) setTimer(TIMER_SECONDS);
  }, [currentPlayer?.id, auctionState.is_active, auctionState.current_bid, auctionState.current_bid_team_id]);

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isActive, currentPlayer?.id]);

  const playerFranchise = currentPlayer?.team_id
    ? teams.find((t) => t.id === currentPlayer.team_id)
    : null;

  return (
    <div className="relative flex flex-col min-h-[520px] lg:min-h-[calc(100vh-10rem)] rounded-2xl border-2 border-blue-500/30 bg-gradient-to-b from-[#0c1628] via-[#0b1121] to-[#060a12] overflow-hidden shadow-[0_0_60px_rgba(37,99,235,0.15)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-48 bg-blue-600/20 blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
          <span className="text-xs font-black uppercase tracking-widest text-white">
            {isActive ? "Live Auction" : currentPlayer ? "Paused" : "Standby"}
          </span>
        </div>
        {currentPlayer && (
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[10px] text-slate-500 uppercase">Timer</span>
            <span
              className={`text-lg font-black tabular-nums ${
                timer <= 5 && isActive ? "text-red-400 animate-pulse" : "text-blue-300"
              }`}
            >
              {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {banner === "sold" && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-20 z-30 flex justify-center pointer-events-none"
          >
            <div className="px-12 py-4 bg-emerald-600 border-2 border-emerald-300 rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.6)]">
              <p className="text-3xl font-black text-white uppercase tracking-[0.3em]">SOLD</p>
            </div>
          </motion.div>
        )}
        {banner === "unsold" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-20 z-30 flex justify-center pointer-events-none"
          >
            <div className="px-12 py-4 bg-red-600/90 border-2 border-red-400 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              <p className="text-2xl font-black text-white uppercase tracking-[0.25em]">UNSOLD</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        {!currentPlayer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-32 h-32 rounded-full border-2 border-dashed border-blue-500/40 flex items-center justify-center mb-6"
            >
              <Gavel className="w-14 h-14 text-blue-500/50" />
            </motion.div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Auction Stage Ready</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Select a player from the queue to begin the live draft broadcast.
            </p>
            <motion.div
              className="mt-8 flex gap-2"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-blue-500" />
              ))}
            </motion.div>
          </div>
        ) : (
          <>
            <div className="relative flex flex-col sm:flex-row items-center gap-6 mb-6">
              {currentPlayer.jersey_number != null && (
                <span className="absolute right-4 top-0 text-[100px] sm:text-[140px] font-black text-white/[0.04] font-display leading-none pointer-events-none select-none">
                  {currentPlayer.jersey_number}
                </span>
              )}
              <div className="relative shrink-0">
                <div className="absolute -inset-3 bg-blue-500/30 blur-2xl rounded-3xl" />
                <div className="relative w-36 h-44 sm:w-44 sm:h-52 rounded-2xl border-2 border-blue-400/50 overflow-hidden bg-[#1a2744]">
                  {currentPlayer.photo_url && currentPlayer.photo_url !== "placeholder" ? (
                    <img src={currentPlayer.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-black text-blue-400">
                      {currentPlayer.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left z-10">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-1">On the block</p>
                <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
                  {currentPlayer.full_name}
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Player · Base {currentPlayer.base_price?.toLocaleString() ?? 0} pts
                </p>
                {(playerFranchise || leadingTeam) && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    {(playerFranchise?.logo_url || leadingTeam?.logo_url) && (
                      <img
                        src={playerFranchise?.logo_url || leadingTeam?.logo_url}
                        alt=""
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span className="text-sm font-bold text-slate-200">
                      {playerFranchise?.name || leadingTeam?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 p-6 mb-6 text-center">
              <p className="text-xs font-bold text-amber-400/80 uppercase tracking-[0.2em] mb-2">Current highest bid</p>
              <motion.p
                key={auctionState.current_bid}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                className={`text-5xl sm:text-6xl font-black font-mono text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] ${
                  isActive ? "animate-pulse" : ""
                }`}
              >
                {(auctionState.current_bid ?? 0).toLocaleString()}
              </motion.p>
              <p className="text-sm font-bold text-white mt-3">
                Leading: <span className="text-emerald-400">{leadingTeam?.name || "—"}</span>
              </p>
            </div>

            <div className="mt-auto space-y-4 border-t border-white/10 pt-4">
              <div className="flex flex-wrap gap-2">
                {auctionState.is_active ? (
                  <button
                    type="button"
                    onClick={onPause}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-200 text-xs font-bold uppercase hover:bg-amber-600/30"
                  >
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onResume}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold uppercase hover:bg-emerald-600/30"
                  >
                    <Play className="w-4 h-4" /> Resume
                  </button>
                )}
                <button
                  type="button"
                  onClick={onResetLot}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold uppercase hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Lot
                </button>
              </div>

              <div className="w-full">
                <button
                  type="button"
                  onClick={() => onIncrement(1000)}
                  className="w-full py-3.5 rounded-xl bg-slate-800/80 border border-white/10 font-mono font-bold text-white hover:border-blue-500/50 hover:bg-blue-600/20 active:scale-95 transition-all text-center"
                >
                  +1000 Points
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => onBidAmountChange(e.target.value)}
                  placeholder="Custom bid"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none"
                />
                <Button variant="primary" onClick={onCustomBid}>
                  Set Bid
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="h-14 bg-emerald-600 hover:bg-emerald-500 border-none text-lg font-black tracking-wider"
                  onClick={onSold}
                >
                  <Gavel className="w-5 h-5 inline mr-2" /> SOLD
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-14 bg-red-600 hover:bg-red-500 text-white border-none font-bold"
                  onClick={onUnsold}
                >
                  <XCircle className="w-5 h-5 inline mr-2" /> UNSOLD
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
