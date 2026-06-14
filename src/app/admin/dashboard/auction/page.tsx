"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { adminFetch } from "@/lib/admin-fetch";
import { AuctionQueuePanel } from "@/components/auction/AuctionQueuePanel";
import { AuctionStagePanel } from "@/components/auction/AuctionStagePanel";
import { AuctionTeamsPanel } from "@/components/auction/AuctionTeamsPanel";

export default function AuctionControlRoom() {
  const [auctionState, setAuctionState] = useState<any>({ current_bid: 0, is_active: false });
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [queueSearch, setQueueSearch] = useState("");
  const [banner, setBanner] = useState<"sold" | "unsold" | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await adminFetch<any>("/api/admin/auction");
      setPlayers(data.players || []);
      setTeams(data.teams || []);
      setAuctionState(data.auctionState || { current_bid: 0, is_active: false });
      setCurrentPlayer(data.currentPlayer || null);
      // Removed the forced overriding of selectedTeamId here so you can select a new team without it reverting on the next poll.
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    
    const channel = supabase.channel('admin_auction_room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, (payload) => {
        setAuctionState(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
        setTeams((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name));
          if (payload.eventType === 'DELETE') return prev.filter((t) => t.id !== payload.old.id);
          return prev.map((t) => t.id === payload.new.id ? payload.new : t);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, (payload) => {
        setPlayers((prev) => {
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
  }, [refresh]);

  const auctionAction = async (body: Record<string, unknown>) => {
    await adminFetch("/api/admin/auction", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  const handleSetPlayer = async (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    setCurrentPlayer(player);
    setBanner(null);
    await auctionAction({ action: "set_player", player_id: playerId });
  };

  const handleIncrementBid = async (increment: number) => {
    if (!selectedTeamId) return alert("Select a bidding team from the right panel.");
    if (auctionState?.current_bid_team_id === selectedTeamId) {
      return alert("This franchise already holds the highest bid.");
    }
    await auctionAction({ action: "bid", team_id: selectedTeamId, increment });
  };

  const handleCustomBid = async () => {
    if (!selectedTeamId || !bidAmount) return;
    if (auctionState?.current_bid_team_id === selectedTeamId) {
      return alert("This franchise already holds the highest bid.");
    }
    await auctionAction({
      action: "bid",
      team_id: selectedTeamId,
      amount: parseInt(bidAmount, 10),
    });
    setBidAmount("");
  };

  const handleMarkSold = async () => {
    if (!currentPlayer || !auctionState.current_bid_team_id) return alert("No active bid.");
    setBanner("sold");
    await auctionAction({ action: "sold" });
    setTimeout(() => setBanner(null), 2200);
    setCurrentPlayer(null);
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;
    setBanner("unsold");
    await auctionAction({ action: "unsold" });
    setTimeout(() => setBanner(null), 2200);
    setCurrentPlayer(null);
  };

  const handleShufflePool = async () => {
    if (!confirm("Shuffle the remaining player queue?")) return;
    await auctionAction({ action: "shuffle_pool" });
    await refresh(); // Force refresh for auction_order changes
  };

  const livePlayerId = currentPlayer?.id ?? auctionState.current_player_id ?? null;

  return (
    <div className="space-y-4 -m-2 p-2">
      {/* Broadcast header */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-2 py-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#0f1a2e] to-[#0b1121] shadow-[0_0_30px_rgba(37,99,235,0.12)]">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-[0.15em]">
              Auction Control Room
            </h1>
            <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest">EVL Mega Draft · Live</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Broadcast clock</p>
          <p className="text-lg font-mono font-bold text-slate-200 tabular-nums">
            {time}
          </p>
        </div>
      </header>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-5 min-h-0">
        <div className="md:col-span-1 xl:col-span-3 order-2 md:order-1 xl:order-1">
          <AuctionQueuePanel
            players={players}
            livePlayerId={livePlayerId}
            search={queueSearch}
            onSearchChange={setQueueSearch}
            onSetLive={handleSetPlayer}
            onShuffle={handleShufflePool}
          />
        </div>

        <div className="md:col-span-1 xl:col-span-6 order-1 md:order-2 xl:order-2">
          <AuctionStagePanel
            currentPlayer={currentPlayer}
            auctionState={auctionState}
            teams={teams}
            selectedTeamId={selectedTeamId}
            bidAmount={bidAmount}
            banner={banner}
            onBidAmountChange={setBidAmount}
            onIncrement={handleIncrementBid}
            onCustomBid={handleCustomBid}
            onSold={handleMarkSold}
            onUnsold={handleMarkUnsold}
            onPause={() => auctionAction({ action: "pause" })}
            onResume={() => auctionAction({ action: "resume" })}
            onResetLot={() => auctionAction({ action: "reset_lot" })}
          />
        </div>

        <div className="md:col-span-2 xl:col-span-3 order-3">
          <AuctionTeamsPanel
            teams={teams}
            activeTeamId={auctionState.current_bid_team_id ?? null}
            selectedTeamId={selectedTeamId}
            onSelectTeam={setSelectedTeamId}
            currentBid={auctionState.current_bid}
          />
        </div>
      </div>
    </div>
  );
}
