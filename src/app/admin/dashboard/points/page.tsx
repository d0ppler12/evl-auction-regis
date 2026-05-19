"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function PointsManagement() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      await adminFetch("/api/admin/standings", { method: "POST" });
      const data = await adminFetch<any[]>("/api/admin/standings");
      setStandings(data);
    } catch {
      setStandings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white tracking-tight">POINTS TABLE</h1>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Calculating standings...</div>
      ) : standings.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 backdrop-blur-sm text-center">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Standings Empty</h3>
          <p className="text-slate-400">Play matches to populate the points table.</p>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-xs">
                <th className="text-left p-4">Pos</th>
                <th className="text-left p-4">Team</th>
                <th className="text-center p-4">P</th>
                <th className="text-center p-4">W</th>
                <th className="text-center p-4">L</th>
                <th className="text-center p-4">SW</th>
                <th className="text-center p-4">SL</th>
                <th className="text-center p-4">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => (
                <tr key={row.team_id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-4 font-bold text-white">{row.team?.name || "—"}</td>
                  <td className="p-4 text-center text-slate-300">{row.played}</td>
                  <td className="p-4 text-center text-emerald-400">{row.wins}</td>
                  <td className="p-4 text-center text-red-400">{row.losses}</td>
                  <td className="p-4 text-center text-slate-300">{row.sets_won}</td>
                  <td className="p-4 text-center text-slate-300">{row.sets_lost}</td>
                  <td className="p-4 text-center font-bold text-blue-400">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
