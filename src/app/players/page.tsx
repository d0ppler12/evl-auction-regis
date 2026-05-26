"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Loader } from "@/components/ui/Loader";
import { PlayerPoolCard, type PlayerPoolItem } from "@/components/players/PlayerPoolCard";
import { PlayerDetailModal, type PlayerDetail } from "@/components/players/PlayerDetailModal";

type RawPlayer = PlayerDetail & {
  team_id?: string | null;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<RawPlayer[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [auctionState, setAuctionState] = useState<{ current_player_id?: string; current_bid?: number } | null>(null);
  const [teamMatchCounts, setTeamMatchCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [playersRes, teamsRes, auctionRes, matchesRes] = await Promise.all([
        supabase
          .from("players")
          .select("*, teams(id, name, logo_url, owner_name)")
          .eq("status", "approved")
          .order("full_name"),
        supabase.from("teams").select("id, name").order("name"),
        supabase.from("auction_state").select("current_player_id, current_bid").eq("id", 1).single(),
        supabase.from("matches").select("team_a_id, team_b_id").eq("status", "completed"),
      ]);

      if (playersRes.data) setPlayers(playersRes.data as RawPlayer[]);
      if (teamsRes.data) setTeams(teamsRes.data);
      if (auctionRes.data) setAuctionState(auctionRes.data);

      const counts: Record<string, number> = {};
      if (!matchesRes.error) matchesRes.data?.forEach((m) => {
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
      else if (filter === "unsold") matchesStatus = p.auction_status === "unsold";
      else if (filter === "available") matchesStatus = p.auction_status === "unsold" || p.auction_status === "in_auction";

      const matchesTeam =
        teamFilter === "all" || p.team_id === teamFilter || p.teams?.id === teamFilter;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [enrichedPlayers, searchTerm, filter, teamFilter]);

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-200">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div>
            <p className="text-blue-400 text-xs font-black uppercase tracking-[0.25em] mb-2">EVL Season Registry</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">
              Auction Pool
            </h1>
            <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-md">
              The official player draft registry. Premium roster cards for every approved EVL athlete.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f1a2e]/80 border border-blue-500/20 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/60 focus:ring-1 focus:ring-blue-500/30 text-sm"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#0f1a2e]/80 border border-blue-500/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-400/60 text-sm min-w-[130px]"
            >
              <option value="all">All</option>
              <option value="sold">Sold</option>
              <option value="unsold">Unsold</option>
              <option value="available">Available</option>
            </select>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-[#0f1a2e]/80 border border-blue-500/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-400/60 text-sm min-w-[150px]"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <Loader />
        ) : filteredPlayers.length === 0 ? (
          <div className="bg-[#0f1a2e]/50 border border-white/5 rounded-3xl p-16 sm:p-20 text-center backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-3xl font-black text-blue-500/50 font-display">EVL</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No players available in the EVL auction pool.</h3>
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
      </div>

      <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
