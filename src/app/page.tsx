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
  { id: 1, name: "TITANS", captain: "Rohit Kumar", winRate: "75%", logo: "T" },
  { id: 2, name: "SPARTANS", captain: "Arjun Dev", winRate: "60%", logo: "S" },
  { id: 3, name: "PHOENIX", captain: "Karan Singh", winRate: "40%", logo: "P" },
  { id: 4, name: "WARRIORS", captain: "Vikram N.", winRate: "60%", logo: "W" },
  {
    id: 5,
    name: "STRIKERS",
    captain: "Aman Verma",
    winRate: "20%",
    logo: "ST",
  },
];

const pointsTable = [
  {
    pos: 1,
    team: "TITANS",
    p: 6,
    w: 5,
    l: 1,
    sw: 11,
    sl: 3,
    pts: 15,
    form: ["W", "W", "W", "W", "L"],
  },
  {
    pos: 2,
    team: "SPARTANS",
    p: 6,
    w: 4,
    l: 2,
    sw: 9,
    sl: 5,
    pts: 12,
    form: ["W", "W", "L", "W", "W"],
  },
  {
    pos: 3,
    team: "WARRIORS",
    p: 6,
    w: 4,
    l: 2,
    sw: 8,
    sl: 6,
    pts: 11,
    form: ["L", "W", "W", "W", "W"],
  },
  {
    pos: 4,
    team: "PHOENIX",
    p: 6,
    w: 2,
    l: 4,
    sw: 6,
    sl: 9,
    pts: 6,
    form: ["L", "L", "W", "L", "L"],
  },
  {
    pos: 5,
    team: "LEGENDS",
    p: 6,
    w: 1,
    l: 5,
    sw: 4,
    sl: 11,
    pts: 3,
    form: ["L", "L", "L", "W", "L"],
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
    <div className="min-h-screen overflow-x-hidden font-sans selection:bg-accent/30">
      {/* Background Ambient Glows - Lightened and Simplified */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-400/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <span className="font-black text-primary italic text-lg tracking-tighter">
                EVL
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">
              ETERNIA <span className="text-accent">VOLLEYBALL</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
            <Link href="/" className="text-primary">
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </div>

            {playerSession ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/players/profile"
                  className="text-sm font-bold text-accent hover:text-white transition-colors"
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
                  className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-red-500/20 text-slate-300 hover:text-red-400 text-sm font-bold transition-all"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/admin"
                  className="text-sm font-bold text-muted hover:text-primary transition-colors hidden sm:block"
                >
                  ADMIN
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-accent hover:bg-blue-400 text-sm font-bold text-background shadow-[0_0_20px_rgba(96,165,250,0.4)] transition-all hover:scale-105"
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
        {/* 1. HERO SECTION & LIVE BAR */}
        <section className="card-base relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 to-background/80 z-10"></div>
          {/* Background image placeholder - Softened opacity */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593786278855-87d21c0022d4?q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

          <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="inline-block px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-bold mb-6 tracking-wider">
                SEASON 1 <span className="text-muted mx-2">•</span> BEGINS MAY
                2024
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-primary leading-[1.1] tracking-tighter mb-6 italic">
                RISE.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-200">
                  SPIKE.
                </span>
                <br />
                DOMINATE.
              </h1>
              <p className="text-xl text-secondary font-medium mb-8 max-w-lg">
                India's Next Generation Volleyball League.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl bg-accent hover:bg-blue-400 text-background font-bold shadow-[0_0_30px_rgba(96,165,250,0.3)] transition-all hover:-translate-y-1"
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
                  className="px-8 py-4 rounded-xl bg-gold hover:bg-yellow-400 text-background font-bold shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all flex items-center gap-2 hover:-translate-y-1"
                >
                  <Play className="w-5 h-5 fill-current" /> WATCH LIVE
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[400px] md:max-w-none flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[320px] md:max-w-[420px] lg:max-w-[460px]">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-blue-500/20 rounded-full blur-3xl opacity-75 animate-pulse" />

                {/* 3D Floating transparent logo with hover animations */}
                <div className="relative w-full h-full flex items-center justify-center group transition-all duration-500 hover:scale-[1.05] hover:drop-shadow-[0_0_35px_rgba(96,165,250,0.3)]">
                  <img
                    src="/evl-hero.png"
                    alt="Eternia Volleyball League"
                    className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transform transition-transform duration-700 group-hover:rotate-[1deg]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Match Bar Attached to Bottom of Hero */}
          <div className="relative z-20 border-t border-white/5 bg-surface/40 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                <Radio className="w-4 h-4 animate-pulse" /> LIVE NOW
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-12 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-primary hidden sm:block">
                  {liveMatch ? liveMatch.team_a?.name : "TITANS"}
                </span>
                <div className="w-8 h-8 bg-surface rounded-full border border-white/10 flex items-center justify-center font-bold text-primary text-xs">
                  {liveMatch ? liveMatch.team_a?.name[0] : "T"}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary tracking-widest">
                  {liveMatch
                    ? `${liveMatch.sets_team_a || 0} - ${liveMatch.sets_team_b || 0}`
                    : "1 - 0"}
                </span>
                <span className="text-xs text-accent font-bold">
                  SET {liveMatch ? liveMatch.current_set : 2}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface rounded-full border border-white/10 flex items-center justify-center font-bold text-primary text-xs">
                  {liveMatch ? liveMatch.team_b?.name[0] : "S"}
                </div>
                <span className="font-bold text-lg text-primary hidden sm:block">
                  {liveMatch ? liveMatch.team_b?.name : "SPARTANS"}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                window.open(
                  "https://www.youtube.com/@EterniaVolleyball",
                  "_blank",
                )
              }
              className="text-accent hover:text-blue-300 font-bold text-sm flex items-center gap-1 w-full md:w-auto justify-center md:justify-end"
            >
              WATCH LIVE <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 2. DASHBOARD GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (Span 2) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Top Teams */}
            <section className="card-base p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-primary">
                  TOP TEAMS
                </h2>
                <Link
                  href="/teams"
                  className="text-xs font-bold text-accent hover:text-blue-300 uppercase tracking-wider flex items-center"
                >
                  View All Teams <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {topTeams.map((team) => (
                  <div
                    key={team.id}
                    className="card-base card-hover p-4 flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-surface rounded-full mb-3 flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-xl md:text-2xl font-black text-primary">
                        {team.logo}
                      </span>
                    </div>
                    <span className="font-bold text-primary text-xs md:text-sm mb-2">
                      {team.name}
                    </span>
                    <div className="w-full flex justify-between text-[10px] text-muted uppercase font-bold border-t border-white/5 pt-2">
                      <div className="flex flex-col items-start">
                        <span>Captain</span>
                        <span className="text-secondary">
                          {team.captain.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span>Win %</span>
                        <span className="text-accent">{team.winRate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Matches */}
            <section className="card-base p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-primary">
                  UPCOMING MATCHES
                </h2>
                <button className="text-xs font-bold text-accent hover:text-blue-300 uppercase tracking-wider flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredMatches.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className="card-base card-hover p-4 cursor-pointer group"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center w-1/3">
                        <div className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-surface rounded-full border border-white/10 flex items-center justify-center text-primary text-xs font-bold mb-1 group-hover:scale-110 transition-transform overflow-hidden">
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
                        <span className="text-[10px] font-bold text-secondary">
                          {match.team_a?.name || "TBD"}
                        </span>
                      </div>
                      <div className="text-center w-1/3">
                        <div className="text-[9px] md:text-[10px] text-accent font-bold mb-1">
                          {match.match_date || "TBD"}
                        </div>
                        <div className="text-xs md:text-sm font-black text-primary">
                          {match.match_time || "TBD"}
                        </div>
                      </div>
                      <div className="text-center w-1/3">
                        <div className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-surface rounded-full border border-white/10 flex items-center justify-center text-primary text-xs font-bold mb-1 group-hover:scale-110 transition-transform overflow-hidden">
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
                        <span className="text-[10px] font-bold text-secondary">
                          {match.team_b?.name || "TBD"}
                        </span>
                      </div>
                    </div>
                    <div className="text-center text-[10px] text-muted font-medium flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />{" "}
                      {match.venue || "Eternia Arena"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Span 1) */}
          <div className="xl:col-span-1">
            {/* Points Table */}
            <section className="card-base p-6 h-full overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-primary">
                  POINTS TABLE
                </h2>
                <div className="flex gap-2">
                  <Link href="/points-table">
                    <button className="px-3 py-1 bg-accent/20 border border-accent/30 text-accent text-[10px] font-bold rounded hover:bg-accent hover:text-background transition-colors">
                      ALL TEAMS
                    </button>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-muted uppercase font-bold border-b border-white/5">
                    <tr>
                      <th className="pb-3 px-2">Pos</th>
                      <th className="pb-3 px-2">Team</th>
                      <th className="pb-3 px-2 text-center">P</th>
                      <th className="pb-3 px-2 text-center">W</th>
                      <th className="pb-3 px-2 text-center">L</th>
                      <th className="pb-3 px-2 text-center">Pts</th>
                      <th className="pb-3 px-2">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointsTable.map((row) => (
                      <tr
                        key={row.pos}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-2 font-bold text-primary">
                          {row.pos}
                        </td>
                        <td className="py-3 px-2 font-bold flex items-center gap-2">
                          <div className="w-5 h-5 bg-surface rounded-full flex items-center justify-center text-[8px] border border-white/10 hidden sm:flex text-primary">
                            {row.team[0]}
                          </div>
                          <span className="truncate max-w-[80px] sm:max-w-none text-secondary">
                            {row.team}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-muted">
                          {row.p}
                        </td>
                        <td className="py-3 px-2 text-center text-muted">
                          {row.w}
                        </td>
                        <td className="py-3 px-2 text-center text-muted">
                          {row.l}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-accent">
                          {row.pts}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            {row.form.map((f, i) => (
                              <span
                                key={i}
                                className={`w-2 h-2 rounded-full ${f === "W" ? "bg-emerald-500" : "bg-red-500"}`}
                                title={f}
                              ></span>
                            ))}
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

        {/* 3. PLAYER SPOTLIGHT & LIVE CENTER */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Player Spotlight */}

          {/* Live Match Center */}
          <section className="xl:col-span-3 card-base p-6 flex flex-col relative overflow-hidden">
            {/* Diagonal accent lines */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold/5 to-transparent -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/5 to-transparent -rotate-45 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <button className="text-xs font-bold text-muted flex items-center hover:text-primary">
                <ChevronLeft className="w-4 h-4" /> BACK
              </button>
              <h2 className="text-xl font-black tracking-tight text-primary hidden sm:block">
                LIVE MATCH CENTER
              </h2>
              <div className="text-xs font-bold text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Eternia Arena
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 relative z-10 px-0 sm:px-4 md:px-12">
              <div className="flex flex-col items-center gap-3 w-1/3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-surface rounded-full border-2 border-accent shadow-[0_0_15px_rgba(96,165,250,0.3)] flex items-center justify-center font-bold text-primary text-xl">
                  {liveMatch ? liveMatch.team_a?.name[0] : "T"}
                </div>
                <span className="font-black text-primary text-sm md:text-lg">
                  {liveMatch ? liveMatch.team_a?.name : "TITANS"}
                </span>
              </div>

              <div className="flex flex-col items-center w-1/3">
                <span className="text-[10px] font-bold text-muted tracking-widest mb-1 border border-white/10 px-2 py-0.5 rounded-sm bg-surface/50">
                  SET {liveMatch ? liveMatch.current_set : 2}
                </span>
                <div className="text-4xl md:text-5xl font-black text-primary tracking-tighter mb-2 font-mono whitespace-nowrap">
                  {liveMatch
                    ? `${liveMatch.points_team_a || 0} - ${liveMatch.points_team_b || 0}`
                    : "24 - 21"}
                </div>
                <span className="text-[10px] md:text-xs font-bold text-accent whitespace-nowrap uppercase">
                  {liveMatch
                    ? `${liveMatch.team_a?.name} ${liveMatch.sets_team_a || 0} - ${liveMatch.sets_team_b || 0} ${liveMatch.team_b?.name}`
                    : "TITANS LEAD 1 - 0"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 w-1/3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-surface rounded-full border-2 border-gold shadow-[0_0_15px_rgba(250,204,21,0.3)] flex items-center justify-center font-bold text-primary text-xl">
                  {liveMatch ? liveMatch.team_b?.name[0] : "S"}
                </div>
                <span className="font-black text-primary text-sm md:text-lg">
                  {liveMatch ? liveMatch.team_b?.name : "SPARTANS"}
                </span>
              </div>
            </div>

            {/* Set Scores */}
            <div className="grid grid-cols-5 gap-2 border-y border-white/5 py-4 mb-8 relative z-10 text-center">
              <div>
                <div className="text-[10px] text-muted mb-1">SET 1</div>
                <div className="font-bold text-secondary text-sm">25-20</div>
              </div>
              <div>
                <div className="text-[10px] text-accent mb-1">SET 2</div>
                <div className="font-bold text-sm text-accent">24-21</div>
              </div>
              <div>
                <div className="text-[10px] text-muted mb-1">SET 3</div>
                <div className="font-bold text-sm text-muted">-</div>
              </div>
              <div>
                <div className="text-[10px] text-muted mb-1">SET 4</div>
                <div className="font-bold text-sm text-muted">-</div>
              </div>
              <div>
                <div className="text-[10px] text-muted mb-1">SET 5</div>
                <div className="font-bold text-sm text-muted">-</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 relative z-10 flex-grow">
              <div className="flex-1 bg-surface/50 rounded-xl border border-white/5 p-4 overflow-y-auto max-h-[150px] md:max-h-full text-sm">
                <div className="text-xs font-bold text-muted mb-3 sticky top-0 bg-surface/90 py-1">
                  LIVE FEED
                </div>
                <div className="space-y-3">
                  {liveMatch && liveMatch.live_feed ? (
                    liveMatch.live_feed.map((feed: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-muted font-mono text-xs">
                          {feed.score}
                        </span>
                        <span className="text-secondary">{feed.text}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <span className="text-muted font-mono text-xs">
                          24-21
                        </span>{" "}
                        <span className="text-secondary">
                          Arjun attacks out!
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-muted font-mono text-xs">
                          24-20
                        </span>{" "}
                        <span className="text-emerald-400 font-bold">
                          Aryan Mishra | Monster block!
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-muted font-mono text-xs">
                          23-20
                        </span>{" "}
                        <span className="text-gold">Timeout - Spartans</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-muted font-mono text-xs">
                          23-19
                        </span>{" "}
                        <span className="text-accent font-bold">
                          Ace! Rohit Kumar
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full md:w-48 flex flex-col justify-end gap-3">
                <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-sm text-primary transition-colors">
                  MATCH STATS
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/@EterniaVolleyball",
                      "_blank",
                    )
                  }
                  className="w-full py-3 rounded-xl bg-gold hover:bg-yellow-400 font-bold text-sm text-background flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> WATCH LIVE
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* 4. SCHEDULE & BOTTOM CTA */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-12">
          <section className="xl:col-span-2 card-base p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black tracking-tight text-primary">
                UPCOMING SCHEDULE
              </h2>
              <button className="text-xs font-bold text-accent hover:text-blue-300 uppercase tracking-wider hidden sm:block">
                View Full Schedule
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/5 mb-4 pb-2">
              {["SCHEDULED", "LIVE", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setScheduleTab(tab.toLowerCase())}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${scheduleTab === tab.toLowerCase() ? "bg-accent text-background" : "text-muted hover:text-primary hover:bg-white/5"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredMatches.length === 0 && (
                <div className="text-center py-8 text-muted font-bold text-sm">
                  No matches found for this status.
                </div>
              )}
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 card-base card-hover gap-4"
                >
                  <div className="w-full sm:w-1/4 text-center sm:text-left border-b sm:border-b-0 border-white/5 pb-2 sm:pb-0">
                    <div className="text-xs text-muted font-medium">
                      {match.match_date || "TBD"}
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {match.match_time || "TBD"}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 w-full sm:w-1/2">
                    <span className="font-bold text-sm hidden sm:block w-20 text-right text-secondary">
                      {match.team_a?.name || "TBD"}
                    </span>
                    <div className="w-8 h-8 bg-surface rounded-full border border-white/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
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
                    <span className="text-xs text-muted font-bold">VS</span>
                    <div className="w-8 h-8 bg-surface rounded-full border border-white/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
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
                    <span className="font-bold text-sm hidden sm:block w-20 text-left text-secondary">
                      {match.team_b?.name || "TBD"}
                    </span>
                  </div>
                  <div className="w-full sm:w-1/4 text-center sm:text-right">
                    <button className="w-full sm:w-auto px-6 py-2 bg-white/5 hover:bg-accent text-xs font-bold text-primary hover:text-background rounded-lg transition-colors border border-white/10">
                      VIEW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="xl:col-span-1 relative rounded-2xl overflow-hidden shadow-2xl border border-accent/30 group bg-surface">
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-surface z-10"></div>
            {/* CTA background image placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000')] bg-cover bg-center opacity-20 mix-blend-screen group-hover:scale-105 transition-transform duration-700"></div>

            <div className="relative z-20 p-8 flex flex-col items-center justify-center h-full text-center min-h-[300px]">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(96,165,250,0.6)]">
                <Trophy className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-3xl font-black text-primary italic mb-2">
                REGISTER NOW
              </h3>
              <p className="text-accent text-sm font-medium mb-8">
                BE PART OF EVL SEASON 1
              </p>
              <Link
                href="/register"
                className="w-full py-4 bg-gold hover:bg-yellow-400 text-background font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all hover:scale-105 active:scale-95 text-sm"
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
