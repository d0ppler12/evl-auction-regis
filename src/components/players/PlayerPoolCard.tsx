"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type PlayerPoolItem = {
  id: string;
  team_id?: string | null;
  full_name: string;
  photo_url?: string;
  jersey_number?: number | null;
  base_price?: number;
  sold_price?: number | null;
  auction_status?: string;
  teams?: { id: string; name: string; logo_url?: string; owner_name?: string } | null;
  currentBid?: number | null;
  matchesPlayed?: number;
};

function statusConfig(status: string) {
  if (status === "sold") return { label: "SOLD", className: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]" };
  if (status === "in_auction") return { label: "AVAILABLE", className: "bg-blue-500/25 text-blue-200 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.45)] animate-pulse" };
  return { label: "UNSOLD", className: "bg-red-500/20 text-red-300 border-red-400/50 shadow-[0_0_16px_rgba(239,68,68,0.3)]" };
}

interface PlayerPoolCardProps {
  player: PlayerPoolItem;
  index?: number;
  onClick: () => void;
}

export function PlayerPoolCard({ player, index = 0, onClick }: PlayerPoolCardProps) {
  const status = player.auction_status || "unsold";
  const badge = statusConfig(status);
  const isSold = status === "sold";
  const teamName = player.teams?.name;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -6 }}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-2xl overflow-hidden",
        "bg-gradient-to-b from-[#0f1a2e] via-[#0b1121] to-[#060a14]",
        "border border-blue-500/20 hover:border-blue-400/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
        "hover:shadow-[0_0_40px_rgba(37,99,235,0.25),0_16px_48px_rgba(0,0,0,0.5)]",
        "transition-shadow duration-300"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute -top-20 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-colors" />

      <div className="relative p-5 pt-4">
        <div className="flex justify-between items-start mb-3">
          <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border", badge.className)}>
            {badge.label}
          </span>
          {player.jersey_number != null && (
            <span className="text-4xl font-black text-white/10 group-hover:text-blue-500/25 font-display leading-none transition-colors">
              #{player.jersey_number}
            </span>
          )}
        </div>

        <div className="relative mx-auto w-28 h-28 mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/30 to-transparent blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-full h-full rounded-2xl border-2 border-blue-500/30 overflow-hidden bg-[#1a2744] flex items-center justify-center group-hover:border-blue-400/60 transition-colors">
            {player.photo_url && player.photo_url !== "placeholder" ? (
              <Image src={player.photo_url} alt={player.full_name} fill className="object-cover" sizes="112px" />
            ) : (
              <span className="text-3xl font-black text-blue-400/80 font-display">
                {player.full_name?.charAt(0) || "?"}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-center text-lg font-black text-white uppercase tracking-tight mb-1 line-clamp-2">
          {player.full_name}
        </h3>

        <div className="flex items-center justify-center gap-2 mb-4 min-h-[24px]">
          {player.teams?.logo_url ? (
            <div className="relative w-5 h-5 rounded overflow-hidden"><Image src={player.teams.logo_url} alt="" fill className="object-cover" sizes="20px" /></div>
          ) : teamName ? (
            <span className="w-5 h-5 rounded bg-blue-600/40 flex items-center justify-center text-[10px] font-bold text-blue-200">
              {teamName.charAt(0)}
            </span>
          ) : null}
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate max-w-[140px]">
            {teamName || (isSold ? "—" : "Free Agent")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-black/30 border border-white/5 px-2 py-2.5 group-hover:border-blue-500/20 transition-colors">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Base</p>
            <p className="text-sm font-mono font-bold text-blue-300">{(player.base_price ?? 0).toLocaleString()} pts</p>
          </div>
          <div className="rounded-xl bg-black/30 border border-white/5 px-2 py-2.5 group-hover:border-blue-500/20 transition-colors">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Bid</p>
            <p className="text-sm font-mono font-bold text-amber-300">
              {player.currentBid != null ? `${player.currentBid.toLocaleString()} pts` : "—"}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span>Matches</span>
          <span className="text-slate-300 font-mono">{player.matchesPlayed ?? 0}</span>
        </div>
      </div>
    </motion.article>
  );
}
