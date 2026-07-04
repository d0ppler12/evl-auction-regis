"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import { ChevronRight, Filter, Users, X, Menu, Search, Trophy } from "lucide-react";
import Navbar from "@/components/navbar";

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
      <Navbar />

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
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                        style={{
                          backgroundColor: `${teamColor}1A`, // 10% opacity hex
                          border: `2px solid ${teamColor}`,
                          boxShadow: `0 0 15px ${teamColor}33`,
                        }}
                      >
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          team.name.charAt(0).toUpperCase()
                        )}
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
                                  Player
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
