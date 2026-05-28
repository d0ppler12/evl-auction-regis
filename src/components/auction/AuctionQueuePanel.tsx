"use client";

import { motion } from "framer-motion";
import { Search, Shuffle } from "lucide-react";

type Player = {
  id: string;
  full_name: string;
  photo_url?: string;
  jersey_number?: number | null;
  base_price?: number;
  auction_status?: string;
  playing_position?: string;
};

interface AuctionQueuePanelProps {
  players: Player[];
  livePlayerId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onSetLive: (id: string) => void;
  onShuffle: () => void;
}

export function AuctionQueuePanel({
  players,
  livePlayerId,
  search,
  onSearchChange,
  onSetLive,
  onShuffle,
}: AuctionQueuePanelProps) {
  const queue = players.filter(
    (p) => p.auction_status !== "sold" && (p as { status?: string }).status === "approved"
  );
  const q = search.toLowerCase();
  const filtered = queue.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(q) ||
      String(p.jersey_number ?? "").includes(q)
  );

  return (
    <div className="flex flex-col h-full min-h-[420px] lg:min-h-[calc(100vh-10rem)] rounded-2xl border border-blue-500/20 bg-gradient-to-b from-[#0f1a2e]/90 to-[#0b1121]/95 overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.08)]">
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Player Queue</h2>
            <p className="text-xs font-mono text-blue-400/80 mt-0.5">{filtered.length} remaining</p>
          </div>
          <button
            type="button"
            onClick={onShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:border-blue-500/40 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">No players in queue</p>
        ) : (
          filtered.map((p, i) => {
            const isLive = livePlayerId === p.id;
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-xl border p-3 cursor-pointer transition-all ${
                  isLive
                    ? "border-blue-400 bg-blue-600/15 shadow-[0_0_24px_rgba(59,130,246,0.35)]"
                    : "border-white/10 bg-slate-900/50 hover:border-blue-500/30"
                }`}
                onClick={() => onSetLive(p.id)}
              >
                {isLive && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 text-[9px] font-black bg-blue-500 text-white rounded-md uppercase">
                    LIVE
                  </span>
                )}
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg border border-blue-500/30 bg-[#1a2744] overflow-hidden shrink-0 flex items-center justify-center">
                    {p.photo_url && p.photo_url !== "placeholder" ? (
                      <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-black text-blue-400">{p.full_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-sm truncate">{p.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      #{p.jersey_number ?? "—"} · {p.base_price?.toLocaleString() ?? 0} pts
                    </p>
                    <span className="text-[9px] uppercase text-slate-500">{p.auction_status || "unsold"}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
