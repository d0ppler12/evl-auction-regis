"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Trophy,
  Play,
  MapPin,
  Radio,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Fake Data for UI
const topTeams = [
  {
    id: 1,
    name: "STALLIONS",
    captain: "Tanish Gupta",
    winRate: "0%",
    logo: "ST",
  },
  {
    id: 2,
    name: "SPARTANS",
    captain: "Parth Thakker",
    winRate: "0%",
    logo: "SP",
  },
  {
    id: 3,
    name: "THUNDERBOLTZ",
    captain: "Nikhil Naik",
    winRate: "0%",
    logo: "TH",
  },
  {
    id: 4,
    name: "SHIVAAY",
    captain: "Karanjeet Singh",
    winRate: "0%",
    logo: "SH",
  },
  {
    id: 5,
    name: "PANTHERS",
    captain: "Yash Madhani",
    winRate: "0%",
    logo: "PA",
  },
];

const pointsTable = [
  {
    pos: 1,
    team: "STALLIONS",
    p: 0,
    w: 0,
    l: 0,
    sw: 0,
    sl: 0,
    pts: 0,
    form: [],
  },
  {
    pos: 2,
    team: "SPARTANS",
    p: 0,
    w: 0,
    l: 0,
    sw: 0,
    sl: 0,
    pts: 0,
    form: [],
  },
  {
    pos: 3,
    team: "THUNDERBOLTZ",
    p: 0,
    w: 0,
    l: 0,
    sw: 0,
    sl: 0,
    pts: 0,
    form: [],
  },
  { pos: 4, team: "SHIVAAY", p: 0, w: 0, l: 0, sw: 0, sl: 0, pts: 0, form: [] },
  {
    pos: 5,
    team: "PANTHERS",
    p: 0,
    w: 0,
    l: 0,
    sw: 0,
    sl: 0,
    pts: 0,
    form: [],
  },
];

// Dynamic matches are fetched from DB

export default function Home() {
  const [scheduleTab, setScheduleTab] = useState("scheduled");
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [playerSession, setPlayerSession] = useState<any>(null);

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
      <nav className="glass-panel sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/evl-hero.png"
                alt="EVL Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">
              ETERNIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400 font-extrabold">VOLLEYBALL</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <Link href="/" className="text-primary hover:text-accent transition-colors relative after:absolute after:bottom-[-26px] after:left-0 after:w-full after:h-0.5 after:bg-accent">
              HOME
            </Link>
            <Link
              href="/teams"
              className="hover:text-primary transition-colors"
            >
              TEAMS
            </Link>
            <Link
              href="/players"
              className="hover:text-primary transition-colors"
            >
              PLAYERS
            </Link>
            <Link
              href="/points-table"
              className="hover:text-primary transition-colors"
            >
              POINTS TABLE
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 text-xs font-black tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </div>

            {playerSession ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/players/profile"
                  className="text-sm font-black text-accent hover:text-white transition-colors tracking-wide"
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
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-accent to-blue-500 hover:from-blue-400 hover:to-blue-600 text-sm font-extrabold text-background shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all hover:scale-105"
                >
                  REGISTER
                </Link>
                <Link
                  href="/players/login"
                  className="px-5 py-2 rounded-full bg-slate-800 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-bold text-white transition-all hover:scale-105"
                >
                  LOGIN
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 1. HERO SECTION */}
        <section className="card-base relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl p-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/30 z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593786278855-87d21c0022d4?q=80&w=2000')] bg-cover bg-center opacity-15 mix-blend-overlay z-0" />

          <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-black mb-6 tracking-widest shadow-lg shadow-accent/5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 inline-block rounded-full bg-accent animate-ping mr-2"></span>
                SEASON 3 <span className="text-slate-500 mx-1.5">•</span> BEGINS 25 JULY 2026
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-primary leading-[1.05] tracking-tighter mb-6 italic uppercase">
                RISE.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
                  SPIKE.
                </span>
                <br />
                DOMINATE.
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-medium mb-8 max-w-lg leading-relaxed">
                Eternia's premier competitive volleyball league. Elevate your game, represent your team, and spike your way to glory.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-blue-600 hover:from-blue-400 hover:to-blue-700 text-slate-950 font-extrabold shadow-[0_0_30px_rgba(96,165,250,0.3)] hover:shadow-[0_0_45px_rgba(96,165,250,0.5)] transition-all duration-300 hover:-translate-y-1 transform hover:scale-[1.02]"
                >
                  REGISTER AS PLAYER
                </Link>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/@EterniaVolleyball",
                      "_blank",
                    )
                  }
                  className="px-8 py-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-gold hover:text-yellow-300 font-bold border border-gold/30 hover:border-gold/60 shadow-[0_0_20px_rgba(250,204,21,0.1)] hover:shadow-[0_0_35px_rgba(250,204,21,0.25)] transition-all duration-300 flex items-center gap-2 hover:-translate-y-1 transform hover:scale-[1.02]"
                >
                  <Play className="w-5 h-5 fill-current" /> WATCH LIVE
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[400px] md:max-w-none flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[320px] md:max-w-[420px] lg:max-w-[460px]">
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
                {topTeams.map((team) => (
                  <div
                    key={team.id}
                    className="card-base card-hover p-5 flex flex-col items-center text-center cursor-pointer group hover:border-accent/40 bg-slate-900/30 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-slate-800/80 to-slate-900 rounded-2xl mb-4 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-105 group-hover:border-accent/30 group-hover:shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all duration-300">
                      <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 group-hover:from-white group-hover:to-accent transition-all">
                        {team.logo}
                      </span>
                    </div>
                    <span className="font-extrabold text-white text-xs md:text-sm tracking-wide mb-3 uppercase group-hover:text-accent transition-colors">
                      {team.name}
                    </span>
                    <div className="w-full flex justify-between text-[10px] text-slate-500 uppercase font-bold border-t border-white/5 pt-3">
                      <div className="flex flex-col items-start">
                        <span className="text-slate-500 font-semibold">Captain</span>
                        <span className="text-slate-300 font-extrabold mt-0.5">
                          {team.captain.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-slate-500 font-semibold">Win %</span>
                        <span className="text-accent font-black mt-0.5">{team.winRate}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{match.team_a?.name?.[0] || "T"}</span>
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
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{match.team_b?.name?.[0] || "T"}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider truncate max-w-[80px]">
                          {match.team_b?.name || "TBD"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1.5 border-t border-white/5 pt-3">
                      <MapPin className="w-3.5 h-3.5 text-accent" />{" "}
                      <span className="truncate">{match.venue || "Eternia Arena"}</span>
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
                    {pointsTable.map((row) => (
                      <tr
                        key={row.pos}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <td className="py-3.5 px-2">
                          {row.pos === 1 ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/35 text-yellow-500 text-xs font-black">1</span>
                          ) : row.pos === 2 ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-300/10 border border-slate-300/35 text-slate-300 text-xs font-black">2</span>
                          ) : row.pos === 3 ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-700/10 border border-amber-700/35 text-amber-500 text-xs font-black">3</span>
                          ) : (
                            <span className="text-slate-400 font-bold ml-1.5">{row.pos}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 font-bold flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] border border-white/5 hidden sm:flex text-slate-300 group-hover:border-accent/30 transition-colors font-black">
                            {row.team[0]}
                          </div>
                          <span className="truncate max-w-[80px] sm:max-w-none text-slate-200 group-hover:text-white transition-colors">
                            {row.team}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center font-bold text-slate-400 font-mono">
                          {row.p}
                        </td>
                        <td className="py-3.5 px-2 text-center font-bold text-slate-400 font-mono">
                          {row.w}
                        </td>
                        <td className="py-3.5 px-2 text-center font-bold text-slate-400 font-mono">
                          {row.l}
                        </td>
                        <td className="py-3.5 px-2 text-center font-black text-accent font-mono text-base">
                          {row.pts}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex gap-1 justify-end">
                            {row.form.length === 0 ? (
                              <span className="text-[10px] text-slate-500 font-medium italic">-</span>
                            ) : (
                              row.form.map((f, i) => (
                                <span
                                  key={i}
                                  className={`w-2.5 h-2.5 rounded-full ${f === "W" ? "bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]"}`}
                                  title={f}
                                ></span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    <span className="text-[10px] text-accent font-black tracking-widest px-2.5 py-1 rounded bg-accent/10 border border-accent/20">VS</span>
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
                REGISTER NOW
              </h3>
              <p className="text-accent text-xs font-black tracking-widest mb-8 uppercase">
                BE PART OF EVL SEASON 3
              </p>
              <Link
                href="/register"
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:shadow-[0_0_30px_rgba(250,204,21,0.45)] transition-all hover:scale-105 active:scale-95 text-sm"
              >
                REGISTER AS PLAYER
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
