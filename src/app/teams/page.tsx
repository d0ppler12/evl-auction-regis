"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import { Trophy, Menu, X, Radio } from "lucide-react";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("*, players(*)")
          .order("name");

        if (error) throw error;
        setTeams(data || []);
      } catch (err) {
        console.error("Error fetching teams from database:", err);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

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
            <Link href="/teams" className="text-white">
              TEAMS
            </Link>
            <Link
              href="/players"
              className="hover:text-white transition-colors"
            >
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
                {/* <Link href="/admin" className="text-sm font-bold text-slate-400 hover:text-white transition-colors hidden sm:block">
                  ADMIN
                </Link> */}
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
                  className="block py-2 text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  TEAMS
                </Link>
                <Link
                  href="/players"
                  className="block py-2 hover:text-white transition-colors"
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
                      href="/admin"
                      className="block py-2 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ADMIN
                    </Link>
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
            <Trophy className="w-4 h-4" /> EVL SEASON 3 FRANCHISES
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
            MEET THE TEAMS
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed">
            Official EVL franchises from the live database. Explore team
            budgets, squad rosters, and franchise profiles.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team, idx) => {
              // Extract hex color theme (fallback to blue if invalid)
              const teamColor = team.color_theme || "#2563EB";

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative rounded-3xl overflow-hidden bg-slate-900/40 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
                >
                  {/* Decorative glowing gradient border/effect top */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: teamColor }}
                  />

                  {/* Gradient Card Banner */}
                  <div
                    className="h-32 bg-gradient-to-b opacity-15 absolute top-0 left-0 w-full pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, ${teamColor}, transparent)`,
                    }}
                  />

                  <div className="p-8 space-y-6">
                    {/* Header: Logo & Name */}
                    <div className="flex items-center gap-4 relative">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${teamColor}1A`, // 10% opacity hex
                          border: `2px solid ${teamColor}`,
                          boxShadow: `0 0 15px ${teamColor}33`,
                        }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white italic tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                          {team.name}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 tracking-wider">
                          OWNER:{" "}
                          <span className="text-slate-200">
                            {team.owner_name}
                          </span>
                        </p>
                      </div>

                      {team.is_playing_owner && (
                        <span className="absolute top-0 right-0 text-[9px] font-black tracking-widest bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                          Playing
                        </span>
                      )}
                    </div>

                    {/* Purse Budgets */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                          Purse Remaining
                        </span>
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          {team.purse_remaining?.toLocaleString()} pts
                        </span>
                      </div>
                      <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                          Total Budget
                        </span>
                        <span className="text-lg font-black text-white font-mono">
                          {team.total_purse?.toLocaleString()} pts
                        </span>
                      </div>
                    </div>

                    {/* Squad Roster */}
                    <div className="border-t border-white/10 pt-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">
                          SQUAD ROSTER ({team.players?.length || 0})
                        </h3>
                      </div>

                      {team.players && team.players.length > 0 ? (
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {team.players.map((player: any) => (
                            <div
                              key={player.id}
                              className="flex justify-between items-center p-3 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-900/60 transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white leading-tight">
                                  {player.full_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                                  {player.playing_position || "Player"}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-blue-400 font-mono">
                                {player.sold_price?.toLocaleString()} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 px-4 bg-slate-900/30 border border-dashed border-white/10 rounded-2xl">
                          <p className="text-xs font-semibold text-slate-500">
                            Draft pending. Players will appear here once
                            purchased in the auction.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
