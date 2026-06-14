"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Trophy, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import {
  PlayerPoolCard,
  type PlayerPoolItem,
} from "@/components/players/PlayerPoolCard";
import {
  PlayerDetailModal,
  type PlayerDetail,
} from "@/components/players/PlayerDetailModal";

type RawPlayer = PlayerDetail & {
  team_id?: string | null;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<RawPlayer[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [auctionState, setAuctionState] = useState<{
    current_player_id?: string;
    current_bid?: number;
  } | null>(null);
  const [teamMatchCounts, setTeamMatchCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(
    null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [playerSession, setPlayerSession] = useState<any>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/players/me");
        if (res.ok) {
          const data = await res.json();
          setPlayerSession(data.player);
        }
      } catch (e) {
        // ignore
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [playersRes, teamsRes, auctionRes, matchesRes] = await Promise.all([
        supabase
          .from("players")
          .select("*, teams(id, name, logo_url, owner_name)")
          .eq("status", "approved")
          .order("full_name"),
        supabase.from("teams").select("id, name").order("name"),
        supabase
          .from("auction_state")
          .select("current_player_id, current_bid")
          .eq("id", 1)
          .single(),
        supabase
          .from("matches")
          .select("team_a_id, team_b_id")
          .eq("status", "completed"),
      ]);

      if (playersRes.data) setPlayers(playersRes.data as RawPlayer[]);
      if (teamsRes.data) setTeams(teamsRes.data);
      if (auctionRes.data) setAuctionState(auctionRes.data);

      const counts: Record<string, number> = {};
      if (!matchesRes.error)
        matchesRes.data?.forEach((m) => {
          if (m.team_a_id) counts[m.team_a_id] = (counts[m.team_a_id] || 0) + 1;
          if (m.team_b_id) counts[m.team_b_id] = (counts[m.team_b_id] || 0) + 1;
        });
      setTeamMatchCounts(counts);
      setLoading(false);
    }
    fetchData();
  }, []);

  const enrichedPlayers: PlayerPoolItem[] = useMemo(() => {
    return players.map((p) => {
      let currentBid: number | null = null;
      if (p.auction_status === "sold" && p.sold_price != null) {
        currentBid = p.sold_price;
      } else if (
        p.auction_status === "in_auction" &&
        auctionState?.current_player_id === p.id &&
        auctionState.current_bid != null
      ) {
        currentBid = auctionState.current_bid;
      }
      const teamId = p.team_id ?? p.teams?.id;
      return {
        ...p,
        currentBid,
        matchesPlayed: teamId ? teamMatchCounts[teamId] || 0 : 0,
      };
    });
  }, [players, auctionState, teamMatchCounts]);

  const filteredPlayers = useMemo(() => {
    return enrichedPlayers.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.full_name?.toLowerCase().includes(q) ||
        p.teams?.name?.toLowerCase().includes(q) ||
        String(p.jersey_number || "").includes(q);

      let matchesStatus = true;
      if (filter === "sold") matchesStatus = p.auction_status === "sold";
      else if (filter === "unsold")
        matchesStatus = p.auction_status === "unsold";
      else if (filter === "available")
        matchesStatus =
          p.auction_status === "unsold" || p.auction_status === "in_auction";

      const matchesTeam =
        teamFilter === "all" ||
        p.team_id === teamFilter ||
        p.teams?.id === teamFilter;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [enrichedPlayers, searchTerm, filter, teamFilter]);

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-200 overflow-x-hidden font-sans selection:bg-blue-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-400/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#0B1121]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/evl-hero.png"
                alt="EVL Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              ETERNIA <span className="text-blue-400">VOLLEYBALL</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <Link href="/teams" className="hover:text-white transition-colors">
              TEAMS
            </Link>
            <Link href="/players" className="text-white">
              PLAYERS
            </Link>
            <Link
              href="/points-table"
              className="hover:text-white transition-colors"
            >
              POINTS TABLE
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </div>

            {playerSession ? (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/players/profile"
                  className="text-sm font-bold text-blue-400 hover:text-white transition-colors"
                >
                  MY PROFILE
                </Link>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/players/logout", {
                      method: "POST",
                    });
                    if (res.ok) {
                      setPlayerSession(null);
                      window.location.reload();
                    }
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 text-sm font-bold transition-all"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 hidden sm:block"
                >
                  REGISTER
                </Link>
                <Link
                  href="/players/login"
                  className="px-5 py-2 rounded-full bg-slate-800 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 hidden sm:block"
                >
                  LOGIN
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 md:hidden text-white"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0B1121] overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-3 font-bold text-slate-400 text-sm">
                <Link
                  href="/"
                  className="block py-2 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  HOME
                </Link>
                <Link
                  href="/teams"
                  className="block py-2 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  TEAMS
                </Link>
                <Link
                  href="/players"
                  className="block py-2 text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  PLAYERS
                </Link>
                <Link
                  href="/points-table"
                  className="block py-2 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  POINTS TABLE
                </Link>
                {playerSession ? (
                  <>
                    <Link
                      href="/players/profile"
                      className="block py-2 text-blue-400 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      MY PROFILE
                    </Link>
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/players/logout", {
                          method: "POST",
                        });
                        if (res.ok) {
                          setPlayerSession(null);
                          setIsMobileMenuOpen(false);
                          window.location.reload();
                        }
                      }}
                      className="w-full text-left py-2 text-red-400 hover:text-red-350 transition-colors"
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
                    <Link
                      href="/players/login"
                      className="block py-2 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      PLAYER LOGIN
                    </Link>
                    <Link
                      href="/register"
                      className="inline-block px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-center text-sm text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      REGISTER AS PLAYER
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Section */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider">
            <Trophy className="w-4 h-4" /> EVL SEASON 1 REGISTRY
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
            AUCTION POOL
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed">
            The official player draft registry. Premium roster cards for every
            approved EVL athlete.
          </p>
        </div>

        {/* Filter & Search Panel */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1a2e]/80 border border-blue-500/20 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/60 focus:ring-1 focus:ring-blue-500/30 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#0f1a2e]/80 border border-blue-500/20 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-blue-400/60 text-sm min-w-[130px]"
            >
              <option value="all">All Status</option>
              <option value="sold">Sold</option>
              <option value="unsold">Unsold</option>
              <option value="available">Available</option>
            </select>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#0f1a2e]/80 border border-blue-500/20 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-blue-400/60 text-sm min-w-[150px]"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="bg-[#0f1a2e]/50 border border-white/5 rounded-3xl p-16 sm:p-20 text-center backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-3xl font-black text-blue-500/50 font-display">
                EVL
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No players available in the EVL auction pool.
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {players.length === 0
                ? "Approved players will appear here once registrations are confirmed."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player, idx) => (
              <PlayerPoolCard
                key={player.id}
                player={player}
                index={idx}
                onClick={() => setSelectedPlayer(player as PlayerDetail)}
              />
            ))}
          </div>
        )}
      </main>

      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}
