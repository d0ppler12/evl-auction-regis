"use client";

import { useEffect, useState } from "react";
import { Radio, Plus, Minus, Send, CheckCircle2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function LiveMatchController() {
  const [matches, setMatches] = useState<any[]>([]);
  const [liveMatchId, setLiveMatchId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [feedText, setFeedText] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadMatches = async () => {
    try {
      const data = await adminFetch<any[]>("/api/admin/matches");
      setMatches((prev) => {
        // Skip state update if data is identical — avoids unnecessary re-renders
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        const live = data.find(m => m.status === 'live');
        if (live && !liveMatchId) {
          setLiveMatchId(live.id);
        }
        return data;
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 10000); // Reduced from 5s to 10s to halve egress
    return () => clearInterval(interval);
  }, []);

  const activeMatch = matches.find(m => m.id === liveMatchId);

  const updateMatch = async (updates: any) => {
    if (!activeMatch) return;
    setUpdating(true);
    try {
      await adminFetch(`/api/admin/matches/${activeMatch.id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      await loadMatches();
    } catch (e: any) {
      alert(e.message);
    }
    setUpdating(false);
  };

  const updatePoints = (team: 'a' | 'b', delta: number) => {
    if (!activeMatch) return;
    const currentA = activeMatch.points_team_a || 0;
    const currentB = activeMatch.points_team_b || 0;
    
    if (team === 'a') {
      updateMatch({ points_team_a: Math.max(0, currentA + delta) });
    } else {
      updateMatch({ points_team_b: Math.max(0, currentB + delta) });
    }
  };

  const updateSets = (team: 'a' | 'b', delta: number) => {
    if (!activeMatch) return;
    const currentA = activeMatch.sets_team_a || 0;
    const currentB = activeMatch.sets_team_b || 0;
    
    if (team === 'a') {
      updateMatch({ sets_team_a: Math.max(0, currentA + delta) });
    } else {
      updateMatch({ sets_team_b: Math.max(0, currentB + delta) });
    }
  };

  const addFeedEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedText.trim() || !activeMatch) return;
    
    const newEvent = {
      id: Date.now().toString(),
      text: feedText,
      score: `${activeMatch.points_team_a || 0}-${activeMatch.points_team_b || 0}`,
      timestamp: new Date().toISOString()
    };
    
    const currentFeed = activeMatch.live_feed || [];
    updateMatch({ live_feed: [newEvent, ...currentFeed] });
    setFeedText("");
  };

  if (loading && !matches.length) {
    return <div className="text-center text-slate-400 p-12">Loading Live Matches...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Radio className="w-8 h-8 text-red-500 animate-pulse" /> 
          LIVE CONTROLLER
        </h1>
        <select 
          value={liveMatchId} 
          onChange={(e) => setLiveMatchId(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Match to Control --</option>
          {matches.map(m => (
            <option key={m.id} value={m.id}>
              {m.status === 'live' ? '🔴 ' : ''}{m.team_a?.name} vs {m.team_b?.name} ({m.status})
            </option>
          ))}
        </select>
      </div>

      {!activeMatch ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 text-center text-slate-400">
          Select a match from the dropdown above to start live tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Controller Board */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
            {updating && (
              <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Syncing...
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-4 bg-slate-800 rounded-full px-6 py-2 border border-white/5">
                <button 
                  onClick={() => updateMatch({ current_set: Math.max(1, (activeMatch.current_set || 1) - 1) })}
                  className="text-slate-400 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-white tracking-widest text-sm">SET {activeMatch.current_set || 1}</span>
                <button 
                  onClick={() => updateMatch({ current_set: (activeMatch.current_set || 1) + 1 })}
                  className="text-slate-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => {
                  if(confirm("Swap teams (Toss)? This will swap Team A and Team B in the database.")) {
                    updateMatch({ 
                      team_a_id: activeMatch.team_b_id || activeMatch.team_b?.id, 
                      team_b_id: activeMatch.team_a_id || activeMatch.team_a?.id,
                      points_team_a: activeMatch.points_team_b,
                      points_team_b: activeMatch.points_team_a,
                      sets_team_a: activeMatch.sets_team_b,
                      sets_team_b: activeMatch.sets_team_a,
                    });
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider rounded-full transition-all border border-white/10 text-xs flex items-center gap-2 mr-4"
              >
                Swap Teams (Toss)
              </button>

              {activeMatch.status !== 'live' ? (
                <button 
                  onClick={() => {
                    if(confirm("Start broadcasting this match as LIVE?")) {
                      updateMatch({ status: 'live' });
                    }
                  }}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all animate-pulse flex items-center gap-2"
                >
                  <Radio className="w-4 h-4" /> Go Live
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if(confirm("End this match and mark as completed?")) {
                      updateMatch({ status: 'completed' });
                    }
                  }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> End Match
                </button>
              )}
            </div>

            {(() => {
              const currentSet = activeMatch.current_set || 1;
              const isEvenSet = currentSet % 2 === 0;
              const leftKey = isEvenSet ? 'b' : 'a';
              const rightKey = isEvenSet ? 'a' : 'b';
              const leftTeam = isEvenSet ? activeMatch.team_b : activeMatch.team_a;
              const rightTeam = isEvenSet ? activeMatch.team_a : activeMatch.team_b;
              const leftSets = isEvenSet ? activeMatch.sets_team_b : activeMatch.sets_team_a;
              const rightSets = isEvenSet ? activeMatch.sets_team_a : activeMatch.sets_team_b;
              const leftPoints = isEvenSet ? activeMatch.points_team_b : activeMatch.points_team_a;
              const rightPoints = isEvenSet ? activeMatch.points_team_a : activeMatch.points_team_b;
              const leftColor = isEvenSet ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]' : 'border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]';
              const rightColor = isEvenSet ? 'border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]';
              const leftBtnClass = isEvenSet ? 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20';
              const rightBtnClass = isEvenSet ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/20';
              
              return (
                <div className="grid grid-cols-2 gap-12">
                  {/* Left Team */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">{leftTeam?.name}</div>
                      <div className="text-sm font-bold text-slate-400">Sets Won: {leftSets || 0}</div>
                      <div className="flex gap-2 mt-2 justify-center">
                        <button onClick={() => updateSets(leftKey, -1)} className="p-1 bg-slate-800 rounded text-slate-400"><Minus className="w-3 h-3"/></button>
                        <button onClick={() => updateSets(leftKey, 1)} className="p-1 bg-slate-800 rounded text-emerald-400"><Plus className="w-3 h-3"/></button>
                      </div>
                    </div>
                    
                    <div className={`w-full aspect-square max-w-[200px] bg-slate-800 rounded-3xl border-2 flex items-center justify-center relative ${leftColor}`}>
                      <span className="text-8xl font-black text-white font-mono">{leftPoints || 0}</span>
                    </div>
                    
                    <div className="flex gap-4 w-full justify-center">
                      <button onClick={() => updatePoints(leftKey, -1)} className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700 flex items-center justify-center text-2xl font-black transition-colors">-1</button>
                      <button onClick={() => updatePoints(leftKey, 1)} className={`flex-1 h-16 rounded-2xl text-white flex items-center justify-center text-3xl font-black shadow-lg transition-all active:scale-95 ${leftBtnClass}`}>+1</button>
                    </div>
                  </div>

                  {/* Right Team */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">{rightTeam?.name}</div>
                      <div className="text-sm font-bold text-slate-400">Sets Won: {rightSets || 0}</div>
                      <div className="flex gap-2 mt-2 justify-center">
                        <button onClick={() => updateSets(rightKey, -1)} className="p-1 bg-slate-800 rounded text-slate-400"><Minus className="w-3 h-3"/></button>
                        <button onClick={() => updateSets(rightKey, 1)} className="p-1 bg-slate-800 rounded text-emerald-400"><Plus className="w-3 h-3"/></button>
                      </div>
                    </div>
                    
                    <div className={`w-full aspect-square max-w-[200px] bg-slate-800 rounded-3xl border-2 flex items-center justify-center relative ${rightColor}`}>
                      <span className="text-8xl font-black text-white font-mono">{rightPoints || 0}</span>
                    </div>
                    
                    <div className="flex gap-4 w-full justify-center">
                      <button onClick={() => updatePoints(rightKey, -1)} className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700 flex items-center justify-center text-2xl font-black transition-colors">-1</button>
                      <button onClick={() => updatePoints(rightKey, 1)} className={`flex-1 h-16 rounded-2xl text-white flex items-center justify-center text-3xl font-black shadow-lg transition-all active:scale-95 ${rightBtnClass}`}>+1</button>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <div className="mt-8 flex justify-center">
               <button 
                  onClick={() => {
                    if(confirm("Are you sure you want to reset the current set points to 0-0?")) {
                      updateMatch({ points_team_a: 0, points_team_b: 0 });
                    }
                  }}
                  className="px-6 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-bold rounded-full transition-colors border border-white/5"
               >
                 RESET SET POINTS TO 0-0
               </button>
            </div>
          </div>

          {/* Live Feed Commentary */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 flex flex-col h-[600px]">
            <h2 className="text-xl font-black text-white mb-4">LIVE FEED UPDATE</h2>
            
            <form onSubmit={addFeedEvent} className="mb-6 flex gap-2">
              <input 
                type="text" 
                value={feedText}
                onChange={(e) => setFeedText(e.target.value)}
                placeholder="e.g., Monster block by Aryan!"
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
              <button type="submit" disabled={!feedText.trim() || updating} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-xl flex items-center justify-center transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {!(activeMatch.live_feed?.length) ? (
                <div className="text-center text-slate-500 mt-10 text-sm">No live feed events yet.</div>
              ) : (
                activeMatch.live_feed.map((event: any) => (
                  <div key={event.id} className="bg-slate-800/80 rounded-xl p-3 border border-white/5 relative group">
                    <button 
                      onClick={() => {
                        const newFeed = activeMatch.live_feed.filter((e: any) => e.id !== event.id);
                        updateMatch({ live_feed: newFeed });
                      }}
                      className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                    <div className="text-xs font-mono text-blue-400 mb-1">Score: {event.score}</div>
                    <div className="text-sm text-white">{event.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
