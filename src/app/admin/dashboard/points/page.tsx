"use client";

import { useEffect, useState } from "react";
import { Trophy, Save } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function PointsManagement() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch current standings
      const data = await adminFetch<any[]>("/api/admin/standings");
      // Sort by points locally just in case
      const sorted = data.sort((a, b) => (b.points || 0) - (a.points || 0));
      setStandings(sorted);
    } catch {
      setStandings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (index: number, field: string, value: string) => {
    const newStandings = [...standings];
    newStandings[index] = {
      ...newStandings[index],
      [field]: parseInt(value) || 0
    };
    setStandings(newStandings);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminFetch("/api/admin/standings", { 
        method: "PUT",
        body: JSON.stringify(standings)
      });
      alert("Standings updated successfully!");
      await load();
    } catch (e: any) {
      alert(e.message);
    }
    setSaving(false);
  };

  const handleAutoCalculate = async () => {
    if (!confirm("This will overwrite your manual changes with automatically calculated standings from matches. Are you sure?")) return;
    setLoading(true);
    try {
      await adminFetch("/api/admin/standings", { method: "POST" });
      await load();
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white tracking-tight">MANUAL POINTS TABLE</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleAutoCalculate}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors border border-white/10"
          >
            Auto-Calculate from Matches
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading standings...</div>
      ) : standings.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 backdrop-blur-sm text-center">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Standings Empty</h3>
          <p className="text-slate-400">Add teams to the database first.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {['A', 'B'].map((group) => (
            <div key={group} className="space-y-4">
              <h2 className="text-xl font-bold text-white">GROUP {group}</h2>
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-xs">
                      <th className="text-left p-4">Pos</th>
                      <th className="text-left p-4">Team</th>
                      <th className="text-center p-4">Played</th>
                      <th className="text-center p-4">Wins</th>
                      <th className="text-center p-4">Losses</th>
                      <th className="text-center p-4">Sets Won</th>
                      <th className="text-center p-4">Sets Lost</th>
                      <th className="text-center p-4 bg-blue-900/20">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings
                      .map((row, idx) => ({ ...row, originalIndex: idx }))
                      .filter(row => (row.team?.group_name || 'A') === group)
                      .map((row, groupIdx) => (
                        <tr key={row.team_id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4 font-mono text-slate-400">{groupIdx + 1}</td>
                          <td className="p-4 font-bold text-white whitespace-nowrap">{row.team?.name || "—"}</td>
                          <td className="p-2 text-center">
                            <input 
                              type="number" 
                              value={row.played} 
                              onChange={(e) => handleChange(row.originalIndex, 'played', e.target.value)}
                              className="w-16 bg-slate-800 border border-white/10 rounded px-2 py-1 text-center text-white"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="number" 
                              value={row.wins} 
                              onChange={(e) => handleChange(row.originalIndex, 'wins', e.target.value)}
                              className="w-16 bg-slate-800 border border-emerald-500/30 rounded px-2 py-1 text-center text-emerald-400"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="number" 
                              value={row.losses} 
                              onChange={(e) => handleChange(row.originalIndex, 'losses', e.target.value)}
                              className="w-16 bg-slate-800 border border-red-500/30 rounded px-2 py-1 text-center text-red-400"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="number" 
                              value={row.sets_won} 
                              onChange={(e) => handleChange(row.originalIndex, 'sets_won', e.target.value)}
                              className="w-16 bg-slate-800 border border-white/10 rounded px-2 py-1 text-center text-white"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="number" 
                              value={row.sets_lost} 
                              onChange={(e) => handleChange(row.originalIndex, 'sets_lost', e.target.value)}
                              className="w-16 bg-slate-800 border border-white/10 rounded px-2 py-1 text-center text-white"
                            />
                          </td>
                          <td className="p-2 text-center bg-blue-900/10">
                            <input 
                              type="number" 
                              value={row.points} 
                              onChange={(e) => handleChange(row.originalIndex, 'points', e.target.value)}
                              className="w-16 bg-blue-900/50 border border-blue-500/30 rounded px-2 py-1 text-center font-bold text-blue-400"
                            />
                          </td>
                        </tr>
                      ))}
                    {standings.filter(row => (row.team?.group_name || 'A') === group).length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 italic">No teams in Group {group}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
