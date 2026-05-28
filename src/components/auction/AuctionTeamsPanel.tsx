"use client";

import { motion } from "framer-motion";

type Team = {
  id: string;
  name: string;
  logo_url?: string;
  purse_remaining?: number;
  color_theme?: string;
};

interface AuctionTeamsPanelProps {
  teams: Team[];
  activeTeamId: string | null;
  selectedTeamId: string;
  onSelectTeam: (id: string) => void;
  currentBid?: number;
}

export function AuctionTeamsPanel({
  teams,
  activeTeamId,
  selectedTeamId,
  onSelectTeam,
  currentBid,
}: AuctionTeamsPanelProps) {
  return (
    <div className="flex flex-col h-full min-h-[320px] lg:min-h-[calc(100vh-10rem)] rounded-2xl border border-blue-500/20 bg-gradient-to-b from-[#0f1a2e]/90 to-[#0b1121]/95 overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.08)]">
      <div className="p-4 border-b border-white/10 shrink-0">
        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Franchises</h2>
        <p className="text-xs text-slate-500 mt-0.5">Tap to place bids</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {teams.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">No teams yet</p>
        ) : (
          teams.map((t) => {
            const isLeading = activeTeamId === t.id;
            const isSelected = selectedTeamId === t.id;
            const displayedPurse = isLeading ? ((t.purse_remaining ?? 0) - (currentBid || 0)) : (t.purse_remaining ?? 0);
            return (
              <motion.button
                key={t.id}
                type="button"
                onClick={() => onSelectTeam(t.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  isLeading
                    ? "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : isSelected
                    ? "border-blue-400/50 bg-blue-600/10"
                    : "border-white/10 bg-slate-900/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  {t.logo_url ? (
                    <img src={t.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm text-white border border-white/10"
                      style={{ backgroundColor: t.color_theme || "#2563eb" }}
                    >
                      {t.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{t.name}</p>
                    <p className="text-xs font-mono text-emerald-400/90">
                      {displayedPurse.toLocaleString()} pts left
                    </p>
                  </div>
                  {isLeading && (
                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-black bg-emerald-500 text-white rounded animate-pulse">
                      BID
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
