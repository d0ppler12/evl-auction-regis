"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Trophy, MapPin, PlayCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Team = {
  id: string;
  name: string;
  logo_url: string | null;
  color_theme: string | null;
};

type Match = {
  id: string;
  team_a: Team;
  team_b: Team;
  match_date: string;
  match_time: string;
  venue: string;
  status: string; // 'scheduled', 'live', 'completed'
  sets_team_a: number;
  sets_team_b: number;
  points_team_a: number;
  points_team_b: number;
  current_set?: number;
  match_type: string; // 'league', 'knockout'
  bracket_round: string | null;
};

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = () => {
    fetch(`/api/public/fixtures?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setMatches(data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMatches();

    // Subscribe to realtime changes on the matches table
    const channel = supabase
      .channel("evl_fixtures_sync")
      .on(
        "broadcast",
        { event: "match_updated" },
        (payload) => {
          console.log("Realtime match broadcast received!", payload);
          // Re-fetch matches to get the latest joined data when any match updates
          fetchMatches();
        },
      )
      .subscribe((status) => {
        console.log("Supabase Realtime Fixtures Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const {
    liveMatch,
    upcomingMatches,
    completedMatches,
    knockoutMatches,
    quarterFinals,
    semiFinals,
    finals,
  } = useMemo(() => {
    const live = matches.find((m) => m.status === "live");
    const upcoming = matches.filter((m) => m.status === "scheduled");
    const completed = matches.filter((m) => m.status === "completed").reverse();
    const knockout = matches.filter((m) => m.match_type === "knockout");
    return {
      liveMatch: live,
      upcomingMatches: upcoming,
      completedMatches: completed,
      knockoutMatches: knockout,
      quarterFinals: knockout.filter((m) => m.bracket_round === "quarter_final"),
      semiFinals: knockout.filter((m) => m.bracket_round === "semi_final"),
      finals: knockout.filter((m) => m.bracket_round === "final"),
    };
  }, [matches]);

  const MatchCard = ({ m }: { m: Match }) => {
    const isCompleted = m.status === "completed";
    const teamAColor = m.team_a?.color_theme || "#808080";
    const teamBColor = m.team_b?.color_theme || "#808080";

    return (
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all">
        {/* Top bar info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5" /> {m.match_date}
            </span>
            <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" /> {m.match_time}
            </span>
          </div>
          {m.match_type === "knockout" && (
            <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {m.bracket_round?.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Teams Matchup */}
        <div className="flex items-center justify-between">
          {/* Team A */}
          <div className="flex flex-col items-center gap-3 w-[40%] text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white overflow-hidden shadow-xl"
              style={{
                backgroundColor: `${teamAColor}20`,
                border: `1px solid ${teamAColor}`,
              }}
            >
              {m.team_a?.logo_url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={m.team_a.logo_url}
                    alt={m.team_a.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                m.team_a?.name?.charAt(0) || "?"
              )}
            </div>
            <h3 className="font-bold text-white leading-tight">
              {m.team_a?.name || "TBD"}
            </h3>
          </div>

          {/* VS or Score */}
          <div className="flex flex-col items-center justify-center w-[20%]">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-2xl font-black font-mono">
                <span
                  className={
                    m.sets_team_a > m.sets_team_b
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }
                >
                  {m.sets_team_a}
                </span>
                <span className="text-slate-600">-</span>
                <span
                  className={
                    m.sets_team_b > m.sets_team_a
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }
                >
                  {m.sets_team_b}
                </span>
              </div>
            ) : (
              <span className="text-sm font-black text-slate-500 italic">
                VS
              </span>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-3 w-[40%] text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white overflow-hidden shadow-xl"
              style={{
                backgroundColor: `${teamBColor}20`,
                border: `1px solid ${teamBColor}`,
              }}
            >
              {m.team_b?.logo_url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={m.team_b.logo_url}
                    alt={m.team_b.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                m.team_b?.name?.charAt(0) || "?"
              )}
            </div>
            <h3 className="font-bold text-white leading-tight">
              {m.team_b?.name || "TBD"}
            </h3>
          </div>
        </div>
      </div>
    );
  };

  const BracketNode = ({ match, title, isCenter }: { match?: Match, title: string, isCenter?: boolean }) => {
    return (
      <div className={`w-48 bg-slate-900 border ${isCenter ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10'} rounded-lg p-2 text-xs flex flex-col gap-1 relative z-10 shadow-xl`}>
        <div className={`text-[10px] font-bold uppercase text-center mb-1 ${isCenter ? 'text-yellow-500' : 'text-slate-500'}`}>{title}</div>
        {/* Team A */}
        <div className="flex justify-between items-center bg-slate-800/50 rounded p-1">
          <span className="truncate max-w-[100px] text-white font-bold">{match?.team_a?.name || "TBD"}</span>
          <span className="text-emerald-400 font-mono">{match?.sets_team_a ?? '-'}</span>
        </div>
        {/* Team B */}
        <div className="flex justify-between items-center bg-slate-800/50 rounded p-1">
          <span className="truncate max-w-[100px] text-white font-bold">{match?.team_b?.name || "TBD"}</span>
          <span className="text-emerald-400 font-mono">{match?.sets_team_b ?? '-'}</span>
        </div>
      </div>
    )
  };

  const ChampionshipBracket = () => {
    return (
      <div className="space-y-6 pt-12 pb-8 overflow-x-auto custom-scrollbar">
        <h2 className="text-2xl font-black text-white tracking-wider px-2 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" /> CHAMPIONSHIP BRACKET
        </h2>
        <div className="min-w-[900px] p-4 flex justify-center items-center gap-0">
          {/* Round 1 (QF Left) */}
          <div className="flex flex-col justify-around h-[400px] w-48 z-10">
            <BracketNode match={quarterFinals[0]} title="Quarter Final 1" />
            <BracketNode match={quarterFinals[1]} title="Quarter Final 2" />
          </div>

          {/* Connecting Line QF Left -> SF Left */}
          <div className="flex flex-col justify-center h-[400px] w-8 relative">
             <div className="border-r-2 border-t-2 border-b-2 border-slate-700/50 h-[50%] w-full rounded-r-xl absolute top-1/4" />
             <div className="border-b-2 border-slate-700/50 w-full absolute top-1/2 right-0" />
          </div>

          {/* Round 2 (SF Left) */}
          <div className="flex flex-col justify-center h-[400px] w-48 z-10">
            <BracketNode match={semiFinals[0]} title="Semi Final 1" />
          </div>

          {/* Connecting Line SF Left -> Final */}
          <div className="flex flex-col justify-center h-[400px] w-8 relative">
             <div className="border-b-2 border-slate-700/50 w-full" />
          </div>

          {/* Center (Final) */}
          <div className="flex flex-col justify-center h-[400px] w-56 mx-4 z-10">
            <BracketNode match={finals[0]} title="Championship Final" isCenter />
          </div>

          {/* Connecting Line Final <- SF Right */}
          <div className="flex flex-col justify-center h-[400px] w-8 relative">
             <div className="border-b-2 border-slate-700/50 w-full" />
          </div>

          {/* Round 2 (SF Right) */}
          <div className="flex flex-col justify-center h-[400px] w-48 z-10">
            <BracketNode match={semiFinals[1]} title="Semi Final 2" />
          </div>

          {/* Connecting Line SF Right <- QF Right */}
          <div className="flex flex-col justify-center h-[400px] w-8 relative">
             <div className="border-l-2 border-t-2 border-b-2 border-slate-700/50 h-[50%] w-full rounded-l-xl absolute top-1/4" />
             <div className="border-b-2 border-slate-700/50 w-full absolute top-1/2 left-0" />
          </div>

          {/* Round 1 (QF Right) */}
          <div className="flex flex-col justify-around h-[400px] w-48 z-10">
            <BracketNode match={quarterFinals[2]} title="Quarter Final 3" />
            <BracketNode match={quarterFinals[3]} title="Quarter Final 4" />
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden font-sans selection:bg-accent/30 relative">
      {/* Cyber Grid Background Overlay */}
      <div className="fixed inset-0 grid-overlay -z-10 opacity-70 pointer-events-none" />

      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[50%] bg-accent/10 blur-[160px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[60%] bg-blue-500/5 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[65%] h-[40%] bg-indigo-600/10 blur-[160px] rounded-full mix-blend-screen" />
      </div>

      {/* Navigation */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-12 space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Calendar className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight italic">
            Tournament{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Fixtures
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Follow the journey to the championship. Live match updates, knockout
            brackets, and match schedules.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-bold animate-pulse">
            LOADING FIXTURES...
          </div>
        ) : (
          <>
            {/* Live Match Hero Section */}
            {liveMatch && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-red-500/10 rounded-3xl blur-xl group-hover:bg-red-500/20 transition-all duration-500"></div>
                <div className="relative bg-slate-900/80 border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white font-black px-6 py-2 rounded-full text-sm tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    LIVE NOW
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-6 md:gap-0">
                    <div className="w-full md:w-[35%] flex flex-col items-center gap-2 md:gap-4">
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center overflow-hidden bg-slate-800 border-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        style={{
                          borderColor: liveMatch.team_a?.color_theme || "#333",
                        }}
                      >
                        {liveMatch.team_a?.logo_url ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={liveMatch.team_a.logo_url}
                              alt="Team A Logo"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 80px, 96px"
                            />
                          </div>
                        ) : (
                          <span className="text-3xl md:text-4xl font-black">
                            {liveMatch.team_a?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white text-center tracking-tight">
                        {liveMatch.team_a?.name}
                      </h2>
                    </div>

                    <div className="w-full md:w-[30%] flex flex-col items-center">
                      <p className="text-[10px] md:text-xs font-black text-slate-300 mb-2 tracking-widest uppercase bg-slate-800/80 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
                        Set {liveMatch.current_set || 1}
                      </p>

                      {/* Points Display */}
                      <div className="text-6xl md:text-7xl font-black font-mono text-white flex justify-center items-center gap-3 md:gap-6 mb-3">
                        <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                          {liveMatch.points_team_a || 0}
                        </span>
                        <span className="text-slate-600 text-4xl">:</span>
                        <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                          {liveMatch.points_team_b || 0}
                        </span>
                      </div>

                      {/* Sets Display */}
                      <div className="text-sm font-bold text-slate-400 flex justify-center gap-6 border-t border-white/10 pt-3 w-full max-w-[180px]">
                        <span className="flex flex-col items-center">
                          <span className="text-xl text-white">
                            {liveMatch.sets_team_a}
                          </span>
                          Sets
                        </span>
                        <span className="flex flex-col items-center">
                          <span className="text-xl text-white">
                            {liveMatch.sets_team_b}
                          </span>
                          Sets
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-[35%] flex flex-col items-center gap-2 md:gap-4">
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center overflow-hidden bg-slate-800 border-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        style={{
                          borderColor: liveMatch.team_b?.color_theme || "#333",
                        }}
                      >
                        {liveMatch.team_b?.logo_url ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={liveMatch.team_b.logo_url}
                              alt="Team B Logo"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 80px, 96px"
                            />
                          </div>
                        ) : (
                          <span className="text-3xl md:text-4xl font-black">
                            {liveMatch.team_b?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white text-center tracking-tight">
                        {liveMatch.team_b?.name}
                      </h2>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Championship Bracket */}
            <ChampionshipBracket />

            {/* Upcoming & Completed Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
              {/* Upcoming Matches */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white tracking-wider px-2 flex items-center gap-3">
                  <PlayCircle className="w-6 h-6 text-blue-400" /> UPCOMING
                  MATCHES
                </h2>
                {upcomingMatches.length === 0 ? (
                  <div className="p-12 text-center border border-white/5 border-dashed rounded-3xl text-slate-500 font-bold">
                    NO UPCOMING MATCHES
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMatches.map((m) => (
                      <MatchCard key={m.id} m={m} />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Matches */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white tracking-wider px-2 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-slate-400" /> COMPLETED
                  MATCHES
                </h2>
                {completedMatches.length === 0 ? (
                  <div className="p-12 text-center border border-white/5 border-dashed rounded-3xl text-slate-500 font-bold">
                    NO COMPLETED MATCHES
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedMatches.map((m) => (
                      <MatchCard key={m.id} m={m} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
