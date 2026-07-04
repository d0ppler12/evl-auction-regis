"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

const emptyForm = {
  team_a_id: "",
  team_b_id: "",
  match_date: "",
  match_time: "",
  venue: "Eternia Arena",
  status: "scheduled",
  sets_team_a: "0",
  sets_team_b: "0",
  match_type: "league",
  bracket_round: "",
};

export default function MatchManagement() {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([
        adminFetch<any[]>("/api/admin/matches"),
        adminFetch<any[]>("/api/admin/teams"),
      ]);
      setMatches(m);
      setTeams(t);
    } catch {
      setMatches([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (match: any) => {
    setEditingId(match.id);
    setForm({
      team_a_id: match.team_a_id,
      team_b_id: match.team_b_id,
      match_date: match.match_date || "",
      match_time: match.match_time || "",
      venue: match.venue || "Eternia Arena",
      status: match.status || "scheduled",
      sets_team_a: String(match.sets_team_a || 0),
      sets_team_b: String(match.sets_team_b || 0),
      match_type: match.match_type || "league",
      bracket_round: match.bracket_round || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.team_a_id || !form.team_b_id) return alert("Select both teams");
    setSaving(true);
    try {
      const payload = {
        ...form,
        sets_team_a: parseInt(form.sets_team_a),
        sets_team_b: parseInt(form.sets_team_b),
        match_type: form.match_type,
        bracket_round: form.bracket_round || null,
      };
      if (editingId) {
        await adminFetch(`/api/admin/matches/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/api/admin/matches", { method: "POST", body: JSON.stringify(payload) });
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await adminFetch(`/api/admin/matches/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white tracking-tight">MATCH FIXTURES</h1>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> Create Fixture
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={form.team_a_id} onChange={(e) => setForm({ ...form, team_a_id: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white">
              <option value="">Team A</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={form.team_b_id} onChange={(e) => setForm({ ...form, team_b_id: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white">
              <option value="">Team B</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="date" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Time (e.g. 05:00 PM)" value={form.match_time} onChange={(e) => setForm({ ...form, match_time: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white">
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
            <select value={form.match_type} onChange={(e) => setForm({ ...form, match_type: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white">
              <option value="league">League Match</option>
              <option value="knockout">Knockout Match</option>
            </select>
            {form.match_type === 'knockout' && (
              <select value={form.bracket_round} onChange={(e) => setForm({ ...form, bracket_round: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white">
                <option value="">Select Round</option>
                <option value="quarter_final">Quarter Final</option>
                <option value="semi_final">Semi Final</option>
                <option value="final">Final</option>
              </select>
            )}
            <input type="number" placeholder="Sets Team A" value={form.sets_team_a} onChange={(e) => setForm({ ...form, sets_team_a: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input type="number" placeholder="Sets Team B" value={form.sets_team_b} onChange={(e) => setForm({ ...form, sets_team_b: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl">{saving ? "Saving..." : "Save Fixture"}</button>
            <button onClick={() => setShowForm(false)} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading matches...</div>
      ) : matches.length === 0 && !showForm ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 backdrop-blur-sm text-center">
          <CalendarDays className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Matches Scheduled</h3>
          <p className="text-slate-400">Create the first fixture to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{m.team_a?.name || "TBD"} vs {m.team_b?.name || "TBD"}</p>
                <div className="flex gap-2 items-center mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${m.match_type === 'knockout' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {m.match_type === 'knockout' ? (m.bracket_round?.replace('_', ' ') || 'Knockout') : 'League'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${m.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 border border-white/10'}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{m.match_date} {m.match_time} · {m.venue}</p>
                {(m.status === "completed" || m.status === "live") && (
                  <p className="text-lg font-mono text-emerald-400 mt-1">{m.sets_team_a} - {m.sets_team_b}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(m)} className="p-2 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
