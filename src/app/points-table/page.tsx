"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Menu, X, AlertTriangle } from "lucide-react";
import Navbar from "@/components/navbar";

type Standing = {
  rank: number;
  team_id: string;
  name: string;
  color: string;
  logo_url: string | null;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  setDiff: number;
  points: number;
  group_name?: string;
};

export default function PointsTablePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerSession, setPlayerSession] = useState<any>(null);
  const seasonStarted = standings.some((s) => s.played > 0);

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
    async function fetchStandings() {
      try {
        const res = await fetch("/api/public/standings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setStandings(data);
        }
      } catch (e) {
        console.error("Failed to fetch standings", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-200 overflow-x-hidden font-sans selection:bg-blue-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] left-[-10%] w-[45%] h-[55%] bg-indigo-600/5 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Section */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-10">
        {/* Banner: Season Hasn't Started Yet */}
        {!loading && !seasonStarted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left shadow-[0_0_30px_rgba(245,158,11,0.05)] overflow-hidden"
          >
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 z-10">
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">SEASON STANDINGS PENDING</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                The season hasn&apos;t started yet. Match schedules and points table statistics will update automatically here once the auction concludes and tournament play begins. Check back soon!
              </p>
            </div>
          </motion.div>
        )}

        {/* Page Header */}
        <div className="text-center max-w-xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider">
            <Trophy className="w-4 h-4" /> LEAGUE STANDINGS
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">POINTS TABLE</h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            Track live team wins, losses, set differences, and overall points standing throughout the tournament.
          </p>
        </div>

        {/* Points Table - Group A */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white italic tracking-wider px-4">GROUP A</h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40 text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-wider">
                    <th className="py-5 px-6 text-center w-16">Rank</th>
                    <th className="py-5 px-4 min-w-[200px]">Franchise</th>
                    <th className="py-5 px-4 text-center w-20">Played</th>
                    <th className="py-5 px-4 text-center w-20">Won</th>
                    <th className="py-5 px-4 text-center w-20">Lost</th>
                    <th className="py-5 px-4 text-center w-24">Sets Won</th>
                    <th className="py-5 px-4 text-center w-24">Sets Lost</th>
                    <th className="py-5 px-4 text-center w-24">Set Diff</th>
                    <th className="py-5 px-6 text-center w-24 bg-blue-500/5">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-sm">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-5 px-6 text-center"><span className="inline-flex w-7 h-7 rounded-full bg-slate-800/80" /></td>
                        <td className="py-5 px-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-slate-800/80 shrink-0" /><div className="h-4 w-28 rounded bg-slate-800/80" /></div></td>
                        <td colSpan={7}></td>
                      </tr>
                    ))
                  ) : standings.filter(s => s.group_name === 'A').length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center text-slate-500 font-bold tracking-widest text-sm">NO STANDINGS FOR GROUP A</td></tr>
                  ) : (
                    standings.filter(s => s.group_name === 'A').map((team, index) => {
                      const teamColor = team.color || "#808080";
                      return (
                        <motion.tr key={team.team_id || team.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="hover:bg-white/5 transition-colors group">
                          <td className="py-5 px-6 text-center">
                            {index === 0 || index === 1 ? (
                              <span className="inline-flex w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 items-center justify-center font-black text-xs">{index + 1}</span>
                            ) : (
                              <span className="inline-flex w-7 h-7 rounded-full bg-slate-800 text-slate-300 items-center justify-center font-bold text-xs">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white overflow-hidden shrink-0" style={{ backgroundColor: `${teamColor}20`, border: `1px solid ${teamColor}`, boxShadow: `0 0 10px ${teamColor}33` }}>
                                {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> : team.name.charAt(0)}
                              </div>
                              <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{team.name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-center font-mono text-slate-400">{team.played}</td>
                          <td className="py-5 px-4 text-center font-mono text-emerald-400">{team.won}</td>
                          <td className="py-5 px-4 text-center font-mono text-rose-400">{team.lost}</td>
                          <td className="py-5 px-4 text-center font-mono text-slate-400">{team.setsWon}</td>
                          <td className="py-5 px-4 text-center font-mono text-slate-400">{team.setsLost}</td>
                          <td className={`py-5 px-4 text-center font-mono font-bold ${team.setDiff > 0 ? "text-emerald-400" : team.setDiff < 0 ? "text-rose-400" : "text-slate-400"}`}>{team.setDiff > 0 ? `+${team.setDiff}` : team.setDiff}</td>
                          <td className="py-5 px-6 text-center font-mono text-base font-black text-blue-400 bg-blue-500/5">{team.points}</td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Points Table - Group B */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white italic tracking-wider px-4">GROUP B</h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40 text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-wider">
                    <th className="py-5 px-6 text-center w-16">Rank</th>
                    <th className="py-5 px-4 min-w-[200px]">Franchise</th>
                    <th className="py-5 px-4 text-center w-20">Played</th>
                    <th className="py-5 px-4 text-center w-20">Won</th>
                    <th className="py-5 px-4 text-center w-20">Lost</th>
                    <th className="py-5 px-4 text-center w-24">Sets Won</th>
                    <th className="py-5 px-4 text-center w-24">Sets Lost</th>
                    <th className="py-5 px-4 text-center w-24">Set Diff</th>
                    <th className="py-5 px-6 text-center w-24 bg-blue-500/5">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-sm">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-5 px-6 text-center"><span className="inline-flex w-7 h-7 rounded-full bg-slate-800/80" /></td>
                        <td className="py-5 px-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-slate-800/80 shrink-0" /><div className="h-4 w-28 rounded bg-slate-800/80" /></div></td>
                        <td colSpan={7}></td>
                      </tr>
                    ))
                  ) : standings.filter(s => s.group_name === 'B').length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center text-slate-500 font-bold tracking-widest text-sm">NO STANDINGS FOR GROUP B</td></tr>
                  ) : (
                    standings.filter(s => s.group_name === 'B').map((team, index) => {
                      const teamColor = team.color || "#808080";
                      return (
                        <motion.tr key={team.team_id || team.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="hover:bg-white/5 transition-colors group">
                          <td className="py-5 px-6 text-center">
                            {index === 0 || index === 1 ? (
                              <span className="inline-flex w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 items-center justify-center font-black text-xs">{index + 1}</span>
                            ) : (
                              <span className="inline-flex w-7 h-7 rounded-full bg-slate-800 text-slate-300 items-center justify-center font-bold text-xs">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white overflow-hidden shrink-0" style={{ backgroundColor: `${teamColor}20`, border: `1px solid ${teamColor}`, boxShadow: `0 0 10px ${teamColor}33` }}>
                                {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> : team.name.charAt(0)}
                              </div>
                              <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{team.name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-center font-mono text-slate-400">{team.played}</td>
                          <td className="py-5 px-4 text-center font-mono text-emerald-400">{team.won}</td>
                          <td className="py-5 px-4 text-center font-mono text-rose-400">{team.lost}</td>
                          <td className="py-5 px-4 text-center font-mono text-slate-400">{team.setsWon}</td>
                          <td className="py-5 px-4 text-center font-mono text-slate-400">{team.setsLost}</td>
                          <td className={`py-5 px-4 text-center font-mono font-bold ${team.setDiff > 0 ? "text-emerald-400" : team.setDiff < 0 ? "text-rose-400" : "text-slate-400"}`}>{team.setDiff > 0 ? `+${team.setDiff}` : team.setDiff}</td>
                          <td className="py-5 px-6 text-center font-mono text-base font-black text-blue-400 bg-blue-500/5">{team.points}</td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
