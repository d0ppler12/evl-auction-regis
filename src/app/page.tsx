"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import {
  Trophy,
  Play,
  MapPin,
  Radio,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Dynamic data is fetched from DB

// Dynamic matches are fetched from DB

export default function Home() {
  const [scheduleTab, setScheduleTab] = useState("scheduled");
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [playerSession, setPlayerSession] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  useEffect(() => {
    const fetchLiveMatch = async () => {
      try {
        const res = await fetch("/api/live");
        const data = await res.json();
        if (data.liveMatch) {
          setLiveMatch(data.liveMatch);
        }
      } catch (e) {
        console.error("Failed to fetch live match", e);
      }
    };

    fetchLiveMatch();
    const interval = setInterval(fetchLiveMatch, 5000);

    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/public/matches", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data)) setMatches(data);
      } catch (e) {
        console.error("Failed to fetch matches", e);
      }
    };
    fetchMatches();

    const fetchHomeData = async () => {
      try {
        const res = await fetch("/api/public/home", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.teams)) setTeams(data.teams);
          if (Array.isArray(data.standings)) setStandings(data.standings);
        }
      } catch (e) {
        console.error("Failed to fetch home data", e);
      }
    };
    fetchHomeData();

    const checkSession = async () => {
      try {
        const res = await fetch("/api/players/me");
        if (res.ok) {
          const data = await res.json();
          setPlayerSession(data.player);
        }
      } catch (e) {
        // ignore
      }
    };
    checkSession();

    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter((m) => m.status === scheduleTab);

  return (
    <div className="min-h-screen overflow-x-hidden font-sans selection:bg-accent/30 relative">
      {/* Cyber Grid Background Overlay */}
      <div className="fixed inset-0 grid-overlay -z-10 opacity-70 pointer-events-none" />

      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[50%] bg-accent/10 blur-[160px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[60%] bg-blue-500/5 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[65%] h-[40%] bg-indigo-600/10 blur-[160px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar */}
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 1. HERO SECTION */}
        <section className="card-base relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl p-0">
          {/* Dark cloudy thunder background */}
          <div className="absolute inset-0 bg-[url('/storm.png')] bg-cover bg-center z-0" />

          {/* Darkening overlay so the clouds don't overpower the white logos - Reduced to keep Namhra visible */}
          <div className="absolute inset-0 bg-slate-950/30 z-0" />

          {/* Lightning Flash Effect (optional subtle addition) */}
          <div className="absolute inset-0 bg-blue-300 mix-blend-overlay z-0 pointer-events-none animate-lightning" />

          {/* Very subtle gradient overlay just to keep bottom text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent z-10" />

          <div className="relative z-20 p-4 pt-2 md:p-6 md:pt-4 lg:px-6 lg:pb-6 lg:pt-2 flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8">
            <div className="flex-[1.2] max-w-3xl flex flex-col items-center md:items-start text-center md:text-left">
              <div className="relative w-full max-w-[900px] -mt-6 mb-3 group">
                {/* Subtle white glow targeted specifically at the bottom half for Enser/Namhra */}
                <div className="absolute bottom-[5%] left-[15%] right-[15%] h-[30%] bg-white/10 blur-3xl rounded-[100px] z-0 pointer-events-none" />

                <img
                  src="/sponsors.png"
                  alt="EVL 3.0 Sponsors"
                  className="relative z-10 w-full max-h-[450px] object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] transition-all duration-500 group-hover:scale-[1.02] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                />
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-[34px] font-black leading-none tracking-tighter mb-4 italic uppercase flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                <span className="text-[#f59e0b] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  RISE.
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-blue-500 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">
                  SPIKE.
                </span>
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  DOMINATE.
                </span>
              </h1>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  href="/teams"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 hover:from-blue-400 hover:to-blue-700 text-slate-950 text-base font-extrabold shadow-[0_0_30px_rgba(96,165,250,0.3)] hover:shadow-[0_0_45px_rgba(96,165,250,0.5)] transition-all duration-300 hover:-translate-y-1 transform hover:scale-[1.02]"
                >
                  VIEW TEAMS
                </Link>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/@EterniaVolleyball",
                      "_blank",
                    )
                  }
                  className="px-8 py-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-gold hover:text-yellow-300 text-base font-bold border border-gold/30 hover:border-gold/60 shadow-[0_0_20px_rgba(250,204,21,0.1)] hover:shadow-[0_0_35px_rgba(250,204,21,0.25)] transition-all duration-300 flex items-center gap-2 hover:-translate-y-1 transform hover:scale-[1.02]"
                >
                  <Play className="w-5 h-5 fill-current" /> WATCH LIVE
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[400px] md:max-w-none flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[380px] md:max-w-[480px] lg:max-w-[520px] drop-shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-indigo-500/10 rounded-full blur-3xl opacity-75 animate-pulse" />

                {/* 3D Floating transparent logo with hover animations */}
                <div className="relative w-full h-full flex items-center justify-center group transition-all duration-500 hover:scale-[1.05] hover:drop-shadow-[0_0_35px_rgba(96,165,250,0.35)] animate-float-slow">
                  <img
                    src="/evl-hero.png"
                    alt="Eternia Volleyball League"
                    className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DASHBOARD GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (Span 2) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Top Teams */}
            <section className="card-base p-6 border border-white/5 bg-slate-900/30 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black tracking-tight text-white uppercase italic">
                  TOP FRANCHISES
                </h2>
                <Link
                  href="/teams"
                  className="text-xs font-black text-accent hover:text-blue-300 uppercase tracking-widest flex items-center gap-0.5"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {teams.length === 0
                  ? // Skeleton placeholders while loading
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="card-base p-5 flex flex-col items-center text-center bg-slate-900/30 rounded-2xl animate-pulse"
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-800/60 rounded-2xl mb-4" />
                        <div className="h-3 w-16 bg-slate-800/60 rounded mb-3" />
                        <div className="w-full border-t border-white/5 pt-3 flex justify-between">
                          <div className="h-3 w-10 bg-slate-800/60 rounded" />
                          <div className="h-3 w-10 bg-slate-800/60 rounded" />
                        </div>
                      </div>
                    ))
                  : teams.slice(0, 5).map((team) => {
                      const teamColor = team.color_theme || "#3b82f6";
                      // Get win rate from standings
                      const standing = standings.find(
                        (s: any) => s.team?.id === team.id,
                      );
                      const played = standing?.played || 0;
                      const wins = standing?.wins || 0;
                      const winRate =
                        played > 0
                          ? `${Math.round((wins / played) * 100)}%`
                          : "0%";
                      return (
                        <Link
                          key={team.id}
                          href="/teams"
                          className="card-base card-hover p-5 flex flex-col items-center text-center cursor-pointer group hover:border-accent/40 bg-slate-900/30 rounded-2xl relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div
                            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl mb-4 flex items-center justify-center border overflow-hidden shadow-inner group-hover:scale-105 transition-all duration-300"
                            style={{
                              backgroundColor: `${teamColor}1A`,
                              borderColor: `${teamColor}60`,
                              boxShadow: `0 0 0 0 ${teamColor}33`,
                            }}
                          >
                            {team.logo_url ? (
                              <img
                                src={team.logo_url}
                                alt={team.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl md:text-2xl font-black text-white">
                                {team.name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-white text-xs md:text-sm tracking-wide mb-3 uppercase group-hover:text-accent transition-colors">
                            {team.name}
                          </span>
                          <div className="w-full flex justify-between text-[10px] text-slate-500 uppercase font-bold border-t border-white/5 pt-3">
                            <div className="flex flex-col items-start">
                              <span className="text-slate-500 font-semibold">
                                Owner
                              </span>
                              <span className="text-slate-300 font-extrabold mt-0.5">
                                {team.owner_name?.split(" ")[0] || "—"}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-slate-500 font-semibold">
                                Win %
                              </span>
                              <span className="text-accent font-black mt-0.5">
                                {winRate}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
              </div>
            </section>

            {/* Upcoming Matches */}
            <section className="card-base p-6 border border-white/5 bg-slate-900/30 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black tracking-tight text-white uppercase italic">
                  UPCOMING CLASHES
                </h2>
                <button className="text-xs font-black text-accent hover:text-blue-300 uppercase tracking-widest flex items-center gap-0.5">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredMatches.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className="card-base card-hover p-5 cursor-pointer group hover:border-accent/40 bg-slate-900/30 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex justify-between items-center mb-5">
                      <div className="text-center w-1/3 flex flex-col items-center">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center text-primary text-xs font-black mb-2 shadow-md group-hover:scale-105 group-hover:border-accent/30 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.15)] transition-all duration-300 overflow-hidden">
                          {match.team_a?.logo_url ? (
                            <img
                              src={match.team_a.logo_url}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                              {match.team_a?.name?.[0] || "T"}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider truncate max-w-[80px]">
                          {match.team_a?.name || "TBD"}
                        </span>
                      </div>

                      <div className="text-center w-1/3">
                        <div className="inline-block px-2.5 py-0.5 rounded bg-accent/15 border border-accent/20 text-[9px] text-accent font-extrabold uppercase mb-2 tracking-widest">
                          {match.match_date || "TBD"}
                        </div>
                        <div className="text-xs md:text-sm font-black text-white font-mono tracking-tight">
                          {match.match_time || "TBD"}
                        </div>
                      </div>

                      <div className="text-center w-1/3 flex flex-col items-center">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center text-primary text-xs font-black mb-2 shadow-md group-hover:scale-105 group-hover:border-accent/30 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.15)] transition-all duration-300 overflow-hidden">
                          {match.team_b?.logo_url ? (
                            <img
                              src={match.team_b.logo_url}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                              {match.team_b?.name?.[0] || "T"}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider truncate max-w-[80px]">
                          {match.team_b?.name || "TBD"}
                        </span>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1.5 border-t border-white/5 pt-3">
                      <MapPin className="w-3.5 h-3.5 text-accent" />{" "}
                      <span className="truncate">
                        {match.venue || "Eternia Arena"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Span 1) */}
          <div className="xl:col-span-1">
            {/* Points Table */}
            <section className="card-base p-6 border border-white/5 bg-slate-900/30 rounded-2xl relative overflow-hidden h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black tracking-tight text-white uppercase italic">
                  LEADERBOARD
                </h2>
                <Link href="/points-table">
                  <button className="px-3.5 py-1.5 bg-accent/15 border border-accent/30 text-accent text-[10px] font-extrabold rounded-lg hover:bg-accent hover:text-slate-950 transition-colors uppercase tracking-wider">
                    FULL TABLE
                  </button>
                </Link>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 uppercase font-black tracking-wider border-b border-white/5">
                    <tr>
                      <th className="pb-3 px-2">Pos</th>
                      <th className="pb-3 px-2">Team</th>
                      <th className="pb-3 px-2 text-center">P</th>
                      <th className="pb-3 px-2 text-center">W</th>
                      <th className="pb-3 px-2 text-center">L</th>
                      <th className="pb-3 px-2 text-center">Pts</th>
                      <th className="pb-3 px-2 text-right">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-slate-500 text-xs font-bold tracking-widest"
                        >
                          NO STANDINGS DATA
                        </td>
                      </tr>
                    ) : (
                      standings.slice(0, 5).map((row: any, index: number) => {
                        const team = row.team || {};
                        return (
                          <tr
                            key={row.team_id || index}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                          >
                            <td className="py-3.5 px-2">
                              {index === 0 ? (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/35 text-yellow-500 text-xs font-black">
                                  1
                                </span>
                              ) : index === 1 ? (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-300/10 border border-slate-300/35 text-slate-300 text-xs font-black">
                                  2
                                </span>
                              ) : index === 2 ? (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-700/10 border border-amber-700/35 text-amber-500 text-xs font-black">
                                  3
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold ml-1.5">
                                  {index + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-2 font-bold">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-[10px] border border-white/5 hidden sm:flex text-slate-300 group-hover:border-accent/30 transition-colors font-black shrink-0">
                                  {team.logo_url ? (
                                    <img
                                      src={team.logo_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    (team.name || "?")[0]
                                  )}
                                </div>
                                <span className="truncate max-w-[80px] sm:max-w-none text-slate-200 group-hover:text-white transition-colors">
                                  {team.name || "Unknown"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-center font-bold text-slate-400 font-mono">
                              {row.played || 0}
                            </td>
                            <td className="py-3.5 px-2 text-center font-bold text-slate-400 font-mono">
                              {row.wins || 0}
                            </td>
                            <td className="py-3.5 px-2 text-center font-bold text-slate-400 font-mono">
                              {row.losses || 0}
                            </td>
                            <td className="py-3.5 px-2 text-center font-black text-accent font-mono text-base">
                              {row.points || 0}
                            </td>
                            <td className="py-3.5 px-2">
                              <span className="text-[10px] text-slate-500 font-medium italic">
                                -
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        {/* 4. SCHEDULE & BOTTOM CTA */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-12">
          <section className="xl:col-span-2 card-base p-6 border border-white/5 bg-slate-900/30 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black tracking-tight text-white uppercase italic">
                UPCOMING SCHEDULE
              </h2>
              <button className="text-xs font-black text-accent hover:text-blue-300 uppercase tracking-widest hidden sm:block">
                View Full
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/5 mb-6 pb-3">
              {["SCHEDULED", "LIVE", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setScheduleTab(tab.toLowerCase())}
                  className={`px-4.5 py-1.5 text-xs font-black rounded-full transition-all duration-300 tracking-wider ${scheduleTab === tab.toLowerCase() ? "bg-accent text-slate-950 shadow-[0_0_15px_rgba(96,165,250,0.35)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredMatches.length === 0 && (
                <div className="text-center py-12 text-slate-500 font-extrabold text-sm tracking-widest">
                  COMING SOON
                </div>
              )}
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 card-base card-hover gap-4 bg-slate-900/20 border-white/5 hover:border-accent/25 hover:bg-slate-900/40"
                >
                  <div className="w-full sm:w-1/4 text-center sm:text-left border-b sm:border-b-0 border-white/5 pb-2 sm:pb-0">
                    <div className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-400 font-black mb-1">
                      {match.match_date || "TBD"}
                    </div>
                    <div className="text-sm font-black text-white font-mono">
                      {match.match_time || "TBD"}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 w-full sm:w-1/2">
                    <span className="font-extrabold text-xs md:text-sm hidden sm:block w-24 text-right text-slate-200 group-hover:text-white truncate">
                      {match.team_a?.name || "TBD"}
                    </span>
                    <div className="w-9 h-9 bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center text-primary text-xs font-bold overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                      {match.team_a?.logo_url ? (
                        <img
                          src={match.team_a.logo_url}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        match.team_a?.name?.[0] || "T"
                      )}
                    </div>
                    <span className="text-[10px] text-accent font-black tracking-widest px-2.5 py-1 rounded bg-accent/10 border border-accent/20">
                      VS
                    </span>
                    <div className="w-9 h-9 bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center text-primary text-xs font-bold overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                      {match.team_b?.logo_url ? (
                        <img
                          src={match.team_b.logo_url}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        match.team_b?.name?.[0] || "T"
                      )}
                    </div>
                    <span className="font-extrabold text-xs md:text-sm hidden sm:block w-24 text-left text-slate-200 group-hover:text-white truncate">
                      {match.team_b?.name || "TBD"}
                    </span>
                  </div>
                  <div className="w-full sm:w-1/4 text-center sm:text-right">
                    <button className="w-full sm:w-auto px-6 py-2 bg-slate-900/60 hover:bg-accent border border-white/5 hover:border-accent/40 text-xs font-extrabold text-slate-300 hover:text-slate-950 rounded-xl transition-all shadow-inner">
                      DETAILS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="xl:col-span-1 relative rounded-3xl overflow-hidden shadow-2xl border border-accent/20 group bg-slate-900/40 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/75 to-slate-900/40 z-10"></div>
            {/* CTA background image placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000')] bg-cover bg-center opacity-10 mix-blend-screen group-hover:scale-105 transition-transform duration-700"></div>

            <div className="relative z-20 p-8 flex flex-col items-center justify-center h-full text-center min-h-[300px]">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(96,165,250,0.5)] transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <Trophy className="w-8 h-8 text-slate-950" />
              </div>
              <h3 className="text-3xl font-black text-white italic mb-2 tracking-tight">
                REGISTRATIONS CLOSED
              </h3>
              <p className="text-accent text-xs font-black tracking-widest mb-8 uppercase">
                CHECK PLAYER LIST OF EVL SEASON 3
              </p>
              <Link
                href="/players"
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:shadow-[0_0_30px_rgba(250,204,21,0.45)] transition-all hover:scale-105 active:scale-95 text-sm"
              >
                VIEW PLAYERS POOL
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
