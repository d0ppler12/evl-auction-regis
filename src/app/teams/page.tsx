"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import { ChevronRight, Filter, Users, X, Menu, Search, Trophy, History } from "lucide-react";
import Navbar from "@/components/navbar";

const formatDate = (dateString: string) => {
  if (!dateString) return "TBD";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "TBD";
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    if (hours >= 12) {
      const pmHours = hours === 12 ? 12 : hours - 12;
      return `${pmHours.toString().padStart(2, '0')}:${minutes} PM`;
    }
    if (hours >= 1 && hours <= 11) {
      return `${hours.toString().padStart(2, '0')}:${minutes} PM`;
    }
    if (hours === 0) return `12:${minutes} AM`;
  }
  return timeStr;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [playerSession, setPlayerSession] = useState<any>(null);

  const [selectedRecordTeam, setSelectedRecordTeam] = useState<any>(null);
  const [teamRecords, setTeamRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const fetchTeamRecords = async (team: any) => {
    setSelectedRecordTeam(team);
    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/public/fixtures?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // Filter matches where this team is playing
      const matches = data.filter((m: any) => m.team_a_id === team.id || m.team_b_id === team.id);
      setTeamRecords(matches || []);
    } catch (err) {
      console.error("Error fetching team records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

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
                        <button
                          onClick={() => fetchTeamRecords(team)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-black transition-colors border border-white/10 tracking-widest uppercase shadow-sm"
                        >
                          <History className="w-3.5 h-3.5 text-blue-400" />
                          RECORD
                        </button>
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

      {/* Record Modal */}
      <AnimatePresence>
        {selectedRecordTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedRecordTeam(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div
                className="h-2 w-full"
                style={{ backgroundColor: selectedRecordTeam.color_theme || "#2563EB" }}
              />
              
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-slate-800/50">
                <div className="flex items-center gap-4">
                  {selectedRecordTeam.logo_url ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800">
                      <img src={selectedRecordTeam.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">
                      {selectedRecordTeam.name}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
                      Match Record
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecordTeam(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-4">
                {loadingRecords ? (
                  <div className="flex justify-center py-10">
                    <Loader />
                  </div>
                ) : teamRecords.length > 0 ? (
                  <div className="space-y-4">
                    {teamRecords.map((match) => {
                      const isTeamA = match.team_a_id === selectedRecordTeam.id;
                      const opponent = isTeamA ? match.team_b : match.team_a;
                      const mySets = isTeamA ? match.sets_team_a : match.sets_team_b;
                      const oppSets = isTeamA ? match.sets_team_b : match.sets_team_a;
                      
                      let resultClass = "border-white/10 bg-slate-800/50";
                      let resultText = "VS";
                      if (match.status === "completed") {
                         if (mySets > oppSets) {
                           resultClass = "border-emerald-500/30 bg-emerald-500/10";
                           resultText = "WON";
                         } else if (mySets < oppSets) {
                           resultClass = "border-red-500/30 bg-red-500/10";
                           resultText = "LOST";
                         } else {
                           resultClass = "border-yellow-500/30 bg-yellow-500/10";
                           resultText = "DRAW";
                         }
                      }

                      return (
                        <div key={match.id} className={`flex items-center justify-between p-4 rounded-2xl border ${resultClass}`}>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              {formatDate(match.match_date)} {match.match_time && `• ${formatTime(match.match_time)}`}
                            </span>
                            <div className="flex items-center gap-3">
                              {opponent.logo_url && (
                                <img src={opponent.logo_url} className="w-8 h-8 rounded-lg object-cover bg-slate-800" />
                              )}
                              <span className="text-lg font-black text-white uppercase tracking-tight">
                                {opponent.name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-black tracking-widest uppercase ${match.status === 'completed' ? (resultText === 'WON' ? 'text-emerald-400' : resultText === 'LOST' ? 'text-red-400' : 'text-yellow-400') : 'text-slate-400'}`}>
                              {match.status === 'completed' ? resultText : match.status}
                            </span>
                            {match.status !== 'scheduled' && (
                              <div className="flex items-center gap-2 text-xl font-black font-mono">
                                <span className="text-white">{mySets}</span>
                                <span className="text-slate-500 text-sm">-</span>
                                <span className="text-slate-400">{oppSets}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-slate-400 font-bold">No matches scheduled yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
