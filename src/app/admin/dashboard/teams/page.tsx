"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

const emptyForm = {
  name: "",
  owner_name: "",
  is_playing_owner: false,
  total_purse: "100000",
  color_theme: "",
  logo_url: "",
};

export default function TeamsManagement() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<any[]>("/api/admin/teams");
      setTeams(data);
    } catch {
      setTeams([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
    setShowForm(true);
  };

  const openEdit = (team: any) => {
    setEditingId(team.id);
    setForm({
      name: team.name || "",
      owner_name: team.owner_name || "",
      is_playing_owner: !!team.is_playing_owner,
      total_purse: String(team.total_purse || 100000),
      color_theme: team.color_theme || "",
      logo_url: team.logo_url || "",
    });
    setLogoFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.owner_name) return alert("Name and owner are required");
    setSaving(true);
    try {
      let team: any;
      const payload = {
        name: form.name,
        owner_name: form.owner_name,
        is_playing_owner: form.is_playing_owner,
        total_purse: parseInt(form.total_purse),
        color_theme: form.color_theme || null,
        logo_url: form.logo_url || null,
      };
      if (editingId) {
        team = await adminFetch(`/api/admin/teams/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        team = await adminFetch("/api/admin/teams", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (logoFile && team?.id) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        team = await adminFetch(`/api/admin/teams/${team.id}/logo`, { method: "POST", body: fd });
      }

      setShowForm(false);
      await loadTeams();
    } catch (e: any) {
      alert(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    try {
      await adminFetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      await loadTeams();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReleasePlayer = async (teamId: string, playerId: string) => {
    if (!confirm("Are you sure you want to release this player? Their sold price will be refunded to the team and they will return to the auction pool.")) return;
    try {
      await adminFetch(`/api/admin/auction`, {
        method: "POST",
        body: JSON.stringify({ action: "release_player", player_id: playerId, team_id: teamId }),
      });
      await loadTeams();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white tracking-tight">TEAM MANAGEMENT</h1>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> Add Team
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-lg font-bold text-white">{editingId ? "Edit Team" : "Add Team"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Team Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Owner Name" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input type="number" placeholder="Total Purse" value={form.total_purse} onChange={(e) => setForm({ ...form, total_purse: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Color Theme (hex)" value={form.color_theme} onChange={(e) => setForm({ ...form, color_theme: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <label className="flex items-center gap-2 text-white text-sm col-span-full">
              <input type="checkbox" checked={form.is_playing_owner} onChange={(e) => setForm({ ...form, is_playing_owner: e.target.checked })} />
              Playing Owner
            </label>
            <div className="col-span-full">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Team Logo</label>
              <div className="space-y-3">
                <input 
                  placeholder="Logo URL (e.g., https://example.com/logo.png)" 
                  value={form.logo_url} 
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })} 
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" 
                />
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Or upload logo file:</span>
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-sm text-slate-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl">{saving ? "Saving..." : "Save Team"}</button>
            <button onClick={() => setShowForm(false)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading teams...</div>
      ) : teams.length === 0 && !showForm ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 backdrop-blur-sm text-center">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Teams Found</h3>
          <p className="text-slate-400">Add teams to start managing their squads and budgets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 font-black">{team.name?.charAt(0)}</div>
                  )}
                  <div>
                    <h3 className="font-bold text-white">{team.name}</h3>
                    <p className="text-xs text-slate-400">{team.owner_name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(team)} className="p-2 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(team.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-[10px] text-slate-500 uppercase">Purse Left</p>
                  <p className="font-mono font-bold text-emerald-400">{team.purse_remaining?.toLocaleString()} pts</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-[10px] text-slate-500 uppercase">Total</p>
                  <p className="font-mono font-bold text-white">{team.total_purse?.toLocaleString()} pts</p>
                </div>
              </div>

              {/* Roster Section */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Roster ({team.players?.length || 0})</p>
                {team.players && team.players.length > 0 ? (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {team.players.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{p.full_name}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{p.playing_position || 'Player'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-blue-400">{p.sold_price?.toLocaleString()} pts</span>
                          <button 
                            onClick={() => handleReleasePlayer(team.id, p.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                            title="Release player back to auction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-2">No players drafted yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}