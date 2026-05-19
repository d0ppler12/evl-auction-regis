"use client";

import Link from "next/link";
import { useState } from "react";
import { Trophy, Play, MapPin, Radio, ChevronRight, ChevronLeft } from "lucide-react";

// Fake Data for UI
const topTeams = [
  { id: 1, name: "TITANS", captain: "Rohit Kumar", winRate: "75%", logo: "T" },
  { id: 2, name: "SPARTANS", captain: "Arjun Dev", winRate: "60%", logo: "S" },
  { id: 3, name: "PHOENIX", captain: "Karan Singh", winRate: "40%", logo: "P" },
  { id: 4, name: "WARRIORS", captain: "Vikram N.", winRate: "60%", logo: "W" },
  { id: 5, name: "STRIKERS", captain: "Aman Verma", winRate: "20%", logo: "ST" },
];

const pointsTable = [
  { pos: 1, team: "TITANS", p: 6, w: 5, l: 1, sw: 11, sl: 3, pts: 15, form: ['W','W','W','W','L'] },
  { pos: 2, team: "SPARTANS", p: 6, w: 4, l: 2, sw: 9, sl: 5, pts: 12, form: ['W','W','L','W','W'] },
  { pos: 3, team: "WARRIORS", p: 6, w: 4, l: 2, sw: 8, sl: 6, pts: 11, form: ['L','W','W','W','W'] },
  { pos: 4, team: "PHOENIX", p: 6, w: 2, l: 4, sw: 6, sl: 9, pts: 6, form: ['L','L','W','L','L'] },
  { pos: 5, team: "LEGENDS", p: 6, w: 1, l: 5, sw: 4, sl: 11, pts: 3, form: ['L','L','L','W','L'] },
];

const upcomingMatches = [
  { id: 1, date: "MAY 12, 2024", time: "05:00 PM", teamA: "TITANS", teamB: "PHOENIX", venue: "Eternia Arena" },
  { id: 2, date: "MAY 12, 2024", time: "07:00 PM", teamA: "WARRIORS", teamB: "STRIKERS", venue: "Eternia Arena" },
  { id: 3, date: "MAY 13, 2024", time: "05:00 PM", teamA: "SPARTANS", teamB: "LEGENDS", venue: "Eternia Arena" },
];

export default function Home() {
  const [scheduleTab, setScheduleTab] = useState('upcoming');

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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-black text-white italic text-lg tracking-tighter">EVL</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              ETERNIA <span className="text-blue-400">VOLLEYBALL</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <Link href="/" className="text-white">HOME</Link>
            <Link href="/teams" className="hover:text-white transition-colors">TEAMS</Link>
            <Link href="/players" className="hover:text-white transition-colors">PLAYERS</Link>
            <Link href="/auction" className="hover:text-white transition-colors">POINTS TABLE</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </div>
            <Link href="/admin" className="text-sm font-bold text-slate-400 hover:text-white transition-colors hidden sm:block">
              ADMIN
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
            >
              REGISTER
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* 1. HERO SECTION & LIVE BAR */}
        <section className="relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-slate-900/90 z-10"></div>
          {/* Background image placeholder */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593786278855-87d21c0022d4?q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          
          <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold mb-6 tracking-wider">
                SEASON 1 <span className="text-white/50 mx-2">•</span> BEGINS MAY 2024
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6 italic">
                RISE.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">SPIKE.</span><br/>
                DOMINATE.
              </h1>
              <p className="text-xl text-slate-300 font-medium mb-8 max-w-lg">
                India's Next Generation Volleyball League.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1">
                  REGISTER AS PLAYER
                </Link>
                <button className="px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all flex items-center gap-2 hover:-translate-y-1">
                  <Play className="w-5 h-5 fill-current" /> WATCH LIVE
                </button>
              </div>
            </div>
          </div>

          {/* Live Match Bar Attached to Bottom of Hero */}
          <div className="relative z-20 border-t border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                <Radio className="w-4 h-4 animate-pulse" /> LIVE NOW
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 md:gap-12 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg hidden sm:block">TITANS</span>
                <div className="w-8 h-8 bg-slate-800 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs">T</div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white tracking-widest">1 - 0</span>
                <span className="text-xs text-blue-400 font-bold">SET 2</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs">S</div>
                <span className="font-bold text-lg hidden sm:block">SPARTANS</span>
              </div>
            </div>

            <button className="text-blue-400 hover:text-blue-300 font-bold text-sm flex items-center gap-1 w-full md:w-auto justify-center md:justify-end">
              WATCH LIVE <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 2. DASHBOARD GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column (Span 2) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Top Teams */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-white">TOP TEAMS</h2>
                <Link href="/teams" className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center">
                  View All Teams <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {topTeams.map((team) => (
                  <div key={team.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/10 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-full mb-3 flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-xl md:text-2xl font-black">{team.logo}</span>
                    </div>
                    <span className="font-bold text-white text-xs md:text-sm mb-2">{team.name}</span>
                    <div className="w-full flex justify-between text-[10px] text-slate-400 uppercase font-bold border-t border-white/10 pt-2">
                      <div className="flex flex-col items-start">
                        <span>Captain</span>
                        <span className="text-slate-200">{team.captain.split(' ')[0]}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span>Win %</span>
                        <span className="text-blue-400">{team.winRate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Matches */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-white">UPCOMING MATCHES</h2>
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center w-1/3">
                        <div className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-slate-900 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold mb-1 group-hover:scale-110 transition-transform">{match.teamA[0]}</div>
                        <span className="text-[10px] font-bold text-slate-300">{match.teamA}</span>
                      </div>
                      <div className="text-center w-1/3">
                        <div className="text-[9px] md:text-[10px] text-blue-400 font-bold mb-1">{match.date}</div>
                        <div className="text-xs md:text-sm font-black text-white">{match.time}</div>
                      </div>
                      <div className="text-center w-1/3">
                        <div className="w-8 h-8 md:w-10 md:h-10 mx-auto bg-slate-900 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold mb-1 group-hover:scale-110 transition-transform">{match.teamB[0]}</div>
                        <span className="text-[10px] font-bold text-slate-300">{match.teamB}</span>
                      </div>
                    </div>
                    <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" /> {match.venue}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Span 1) */}
          <div className="xl:col-span-1">
            {/* Points Table */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-full overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-white">POINTS TABLE</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-[10px] font-bold rounded text-white hover:bg-blue-500 transition-colors">ALL TEAMS</button>
                </div>
              </div>
              
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 uppercase font-bold border-b border-white/10">
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
                      <tr key={row.pos} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 font-bold text-white">{row.pos}</td>
                        <td className="py-3 px-2 font-bold flex items-center gap-2">
                          <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[8px] border border-white/20 hidden sm:flex">{row.team[0]}</div>
                          <span className="truncate max-w-[80px] sm:max-w-none">{row.team}</span>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300">{row.p}</td>
                        <td className="py-3 px-2 text-center text-slate-300">{row.w}</td>
                        <td className="py-3 px-2 text-center text-slate-300">{row.l}</td>
                        <td className="py-3 px-2 text-center font-bold text-blue-400">{row.pts}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            {row.form.map((f, i) => (
                              <span key={i} className={`w-2 h-2 rounded-full ${f === 'W' ? 'bg-emerald-500' : 'bg-red-500'}`} title={f}></span>
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
          <section className="xl:col-span-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
              <h2 className="text-xl font-black tracking-tight text-white">PLAYER SPOTLIGHT</h2>
              <Link href="/players" className="text-[10px] font-bold text-blue-400 uppercase hover:text-blue-300">View Profile</Link>
            </div>
            <div className="relative p-6 flex-grow flex flex-col justify-end min-h-[300px]">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/20 blur-[50px] rounded-full"></div>
              {/* Silhouette Placeholder - fallback if no player image */}
              <div className="absolute bottom-0 right-4 w-40 h-56 bg-gradient-to-t from-slate-900 to-transparent opacity-50 mix-blend-screen pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-4xl font-black text-slate-700 italic leading-none">#10</span>
                  <h3 className="text-3xl font-black text-white italic leading-none">ARYAN<br/>MISHRA</h3>
                </div>
                <p className="text-blue-400 font-bold text-sm mb-6 uppercase tracking-widest">Outside Hitter</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 mb-6 border-l-2 border-blue-500 pl-4">
                  <div>AGE <span className="text-white block text-sm">22</span></div>
                  <div>HEIGHT <span className="text-white block text-sm">198 CM</span></div>
                  <div>HAND <span className="text-white block text-sm">RIGHT</span></div>
                  <div>MVP <span className="text-white block text-sm">3</span></div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1">ATTACK %</div>
                    <div className="font-bold text-white">48.6</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1">BLOCKS</div>
                    <div className="font-bold text-white">32</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1">ACES</div>
                    <div className="font-bold text-white">18</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-1">DIGS</div>
                    <div className="font-bold text-white">125</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Match Center */}
          <section className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col relative overflow-hidden">
             {/* Diagonal accent lines */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/5 to-transparent -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-transparent -rotate-45 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <button className="text-xs font-bold text-slate-400 flex items-center hover:text-white"><ChevronLeft className="w-4 h-4"/> BACK</button>
              <h2 className="text-xl font-black tracking-tight text-white hidden sm:block">LIVE MATCH CENTER</h2>
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> Eternia Arena</div>
            </div>

            <div className="flex justify-between items-center mb-8 relative z-10 px-0 sm:px-4 md:px-12">
              <div className="flex flex-col items-center gap-3 w-1/3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-full border-2 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center font-bold text-xl">T</div>
                <span className="font-black text-white text-sm md:text-lg">TITANS</span>
              </div>

              <div className="flex flex-col items-center w-1/3">
                <span className="text-[10px] font-bold text-slate-400 tracking-widest mb-1 border border-slate-600 px-2 py-0.5 rounded-sm">SET 2</span>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-mono whitespace-nowrap">24 - 21</div>
                <span className="text-[10px] md:text-xs font-bold text-blue-400 whitespace-nowrap">TITANS LEAD 1 - 0</span>
              </div>

              <div className="flex flex-col items-center gap-3 w-1/3">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-full border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center justify-center font-bold text-xl">S</div>
                <span className="font-black text-white text-sm md:text-lg">SPARTANS</span>
              </div>
            </div>

            {/* Set Scores */}
            <div className="grid grid-cols-5 gap-2 border-y border-white/10 py-4 mb-8 relative z-10 text-center">
              <div><div className="text-[10px] text-slate-400 mb-1">SET 1</div><div className="font-bold text-sm">25-20</div></div>
              <div><div className="text-[10px] text-blue-400 mb-1">SET 2</div><div className="font-bold text-sm text-blue-400">24-21</div></div>
              <div><div className="text-[10px] text-slate-500 mb-1">SET 3</div><div className="font-bold text-sm text-slate-600">-</div></div>
              <div><div className="text-[10px] text-slate-500 mb-1">SET 4</div><div className="font-bold text-sm text-slate-600">-</div></div>
              <div><div className="text-[10px] text-slate-500 mb-1">SET 5</div><div className="font-bold text-sm text-slate-600">-</div></div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 relative z-10 flex-grow">
               <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/5 p-4 overflow-y-auto max-h-[150px] md:max-h-full text-sm">
                 <div className="text-xs font-bold text-slate-400 mb-3 sticky top-0 bg-[#0B1121]/90 py-1">LIVE FEED</div>
                 <div className="space-y-3">
                   <div className="flex gap-3"><span className="text-slate-500 font-mono text-xs">24-21</span> <span className="text-slate-300">Arjun attacks out!</span></div>
                   <div className="flex gap-3"><span className="text-slate-500 font-mono text-xs">24-20</span> <span className="text-emerald-400 font-bold">Aryan Mishra | Monster block!</span></div>
                   <div className="flex gap-3"><span className="text-slate-500 font-mono text-xs">23-20</span> <span className="text-orange-400">Timeout - Spartans</span></div>
                   <div className="flex gap-3"><span className="text-slate-500 font-mono text-xs">23-19</span> <span className="text-blue-400 font-bold">Ace! Rohit Kumar</span></div>
                 </div>
               </div>
               
               <div className="w-full md:w-48 flex flex-col justify-end gap-3">
                  <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 font-bold text-sm text-white transition-colors">MATCH STATS</button>
                  <button className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
                    <Play className="w-4 h-4 fill-current"/> WATCH LIVE
                  </button>
               </div>
            </div>
          </section>
        </div>

        {/* 4. SCHEDULE & BOTTOM CTA */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-12">
          
          <section className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-white">UPCOMING SCHEDULE</h2>
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider hidden sm:block">
                  View Full Schedule
                </button>
            </div>
            
            <div className="flex gap-2 border-b border-white/10 mb-4 pb-2">
              {['UPCOMING', 'LIVE', 'COMPLETED'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setScheduleTab(tab.toLowerCase())}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${scheduleTab === tab.toLowerCase() ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5 hover:bg-slate-800/80 transition-colors gap-4">
                  <div className="w-full sm:w-1/4 text-center sm:text-left border-b sm:border-b-0 border-white/5 pb-2 sm:pb-0">
                    <div className="text-xs text-slate-400 font-medium">{match.date}</div>
                    <div className="text-sm font-bold text-white">{match.time}</div>
                  </div>
                  <div className="flex items-center justify-center gap-4 w-full sm:w-1/2">
                    <span className="font-bold text-sm hidden sm:block w-20 text-right">{match.teamA}</span>
                    <div className="w-8 h-8 bg-slate-900 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold">{match.teamA[0]}</div>
                    <span className="text-xs text-slate-500 font-bold">VS</span>
                    <div className="w-8 h-8 bg-slate-900 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold">{match.teamB[0]}</div>
                    <span className="font-bold text-sm hidden sm:block w-20 text-left">{match.teamB}</span>
                  </div>
                  <div className="w-full sm:w-1/4 text-center sm:text-right">
                    <button className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-blue-600 text-xs font-bold text-white rounded-lg transition-colors">VIEW</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="xl:col-span-1 relative rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30 group bg-slate-900">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900 z-10"></div>
             {/* CTA background image placeholder */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-screen group-hover:scale-105 transition-transform duration-700"></div>
             
             <div className="relative z-20 p-8 flex flex-col items-center justify-center h-full text-center min-h-[300px]">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-white italic mb-2">REGISTER NOW</h3>
                <p className="text-blue-200 text-sm font-medium mb-8">BE PART OF EVL SEASON 1</p>
                <Link href="/register" className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95 text-sm">
                  REGISTER AS PLAYER
                </Link>
             </div>
          </section>

        </div>

      </main>
    </div>
  );
}
