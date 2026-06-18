"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { PlayerPoolItem } from "./PlayerPoolCard";

export type PlayerDetail = PlayerPoolItem & {
  age?: number | null;
  wing_building?: string;
  jersey_size?: string;
  volleyball_experience?: string;
  previous_tournament_experience?: string;
};

interface PlayerDetailModalProps {
  player: PlayerDetail | null;
  onClose: () => void;
}

function statusBadge(status: string) {
  if (status === "sold")
    return {
      label: "SOLD",
      cls: "bg-emerald-500/25 text-emerald-300 border-emerald-400/50",
    };
  if (status === "in_auction")
    return {
      label: "AVAILABLE",
      cls: "bg-blue-500/25 text-blue-200 border-blue-400/50",
    };
  return {
    label: "UNSOLD",
    cls: "bg-red-500/25 text-red-300 border-red-400/50",
  };
}

export function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [player, onClose]);

  const badge = player ? statusBadge(player.auction_status || "unsold") : null;

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#0f1a2e] via-[#0b1121] to-[#060a14] shadow-[0_0_80px_rgba(37,99,235,0.2)]"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-blue-400/40 transition-all"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Hero */}
            <div className="relative overflow-hidden rounded-t-3xl px-6 sm:px-10 pt-10 pb-8 border-b border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-900/30" />
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 blur-[100px] rounded-full" />
              {player.jersey_number != null && (
                <span className="absolute right-8 top-6 text-[120px] sm:text-[160px] font-black text-white/[0.04] font-display leading-none select-none pointer-events-none">
                  {player.jersey_number}
                </span>
              )}

              <div className="relative flex flex-col sm:flex-row gap-8 items-center sm:items-end">
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 bg-blue-500/40 blur-2xl rounded-3xl opacity-60" />
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border-2 border-blue-400/50 overflow-hidden bg-[#1a2744] shadow-2xl">
                    {player.photo_url && player.photo_url !== "placeholder" ? (
                      <img
                        src={player.photo_url}
                        alt={player.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-black text-blue-400 font-display">
                        {player.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left pb-2">
                  <span
                    className={`inline-block mb-3 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${badge?.cls}`}
                  >
                    {badge?.label}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
                    {player.full_name}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-slate-300">
                    {player.teams?.logo_url && (
                      <img
                        src={player.teams.logo_url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border border-white/10"
                      />
                    )}
                    <span className="font-bold text-blue-300 uppercase tracking-wider text-sm">
                      {player.teams?.name || "No Team"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-6 justify-center sm:justify-start">
                    <div className="px-5 py-3 rounded-xl bg-black/40 border border-blue-500/20">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Base Price
                      </p>
                      <p className="text-xl font-mono font-black text-blue-300">
                        {(player.base_price ?? 0).toLocaleString()} PTS
                      </p>
                    </div>
                    <div className="px-5 py-3 rounded-xl bg-black/40 border border-amber-500/20">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Current Bid
                      </p>
                      <p className="text-xl font-mono font-black text-amber-300">
                        {player.currentBid != null
                          ? `${player.currentBid.toLocaleString()} PTS`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 sm:px-10 py-8 space-y-8">
              <div>
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4">
                  Player Profile
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Age", value: player.age ?? "—" },
                    // { label: "Height", value: "—" },
                    {
                      label: "Wing / Building",
                      value: player.wing_building || "—",
                    },
                    { label: "Jersey Size", value: player.jersey_size || "—" },
                    // { label: "Experience", value: player.volleyball_experience || player.previous_tournament_experience || "—" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-blue-500/25 transition-colors"
                    >
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {player.teams?.owner_name && (
                <div className="rounded-2xl bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 p-5">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                    Team
                  </p>
                  <p className="text-slate-200 text-sm leading-relaxed italic">
                    &ldquo;{player.teams.name}&rdquo;
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4">
                  Season Stats
                </h3>
                <div className="rounded-2xl bg-gradient-to-br from-blue-600/15 to-indigo-900/20 border border-blue-500/25 p-8 text-center max-w-xs">
                  <p className="text-5xl font-black font-mono text-white mb-1">
                    {player.matchesPlayed ?? 0}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Matches Played
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
