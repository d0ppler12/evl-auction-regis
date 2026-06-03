"use client";

import { useEffect, useState } from "react";
import { UserPlus, Plus, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

const emptyForm = {
  full_name: "",
  age: "",
  phone_number: "",
  wing_building: "",
  jersey_name: "",
  jersey_size: "M",
  jersey_number: "",
  playing_position: "",
  base_price: "0",
  status: "approved",
};

export default function PlayerManagement() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<any[]>("/api/admin/players");
      setPlayers(data);
    } catch {
      setPlayers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      full_name: p.full_name || "",
      age: String(p.age || ""),
      phone_number: p.phone_number || "",
      wing_building: p.wing_building || "",
      jersey_name: p.jersey_name || "",
      jersey_size: p.jersey_size || "M",
      jersey_number: String(p.jersey_number || ""),
      playing_position: p.playing_position || "",
      base_price: String(p.base_price ?? 0),
      status: p.status || "approved",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name) return alert("Name is required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: parseInt(form.age) || 0,
        jersey_number: form.jersey_number ? parseInt(form.jersey_number) : null,
        base_price: parseInt(form.base_price) ?? 0,
      };
      if (editingId) {
        await adminFetch(`/api/admin/players/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/api/admin/players", { method: "POST", body: JSON.stringify(payload) });
      }
      setShowForm(false);
      await loadPlayers();
    } catch (e: any) {
      alert(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    try {
      await adminFetch(`/api/admin/players/${id}`, { method: "DELETE" });
      await loadPlayers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white tracking-tight">PLAYER MANAGEMENT</h1>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> Add Player
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-lg font-bold text-white">{editingId ? "Edit Player" : "Add Player"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Phone" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Wing/Building" value={form.wing_building} onChange={(e) => setForm({ ...form, wing_building: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Jersey Name" value={form.jersey_name} onChange={(e) => setForm({ ...form, jersey_name: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <select value={form.jersey_size} onChange={(e) => setForm({ ...form, jersey_size: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white">
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
              <option value="4XL">4XL</option>
              <option value="5XL">5XL</option>
            </select>
            <input type="number" placeholder="Jersey Number" value={form.jersey_number} onChange={(e) => setForm({ ...form, jersey_number: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input placeholder="Position" value={form.playing_position} onChange={(e) => setForm({ ...form, playing_position: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
            <input type="number" placeholder="Base Price" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl">{saving ? "Saving..." : "Save Player"}</button>
            <button onClick={() => setShowForm(false)} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading players...</div>
      ) : players.length === 0 && !showForm ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 backdrop-blur-sm text-center">
          <UserPlus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Player Directory Empty</h3>
          <p className="text-slate-400">Add players manually or review registrations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <div key={p.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white">{p.full_name}</h3>
                  <p className="text-xs text-slate-400">{p.playing_position || "—"} · #{p.jersey_number || "—"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {p.auction_status === 'sold' ? (
                <p className="text-xs font-bold text-blue-400 uppercase">SOLD TO {p.teams?.name || 'TEAM'} · {p.sold_price?.toLocaleString()} pts</p>
              ) : (
                <p className="text-xs text-slate-500 uppercase">{p.status} · {p.base_price?.toLocaleString()} pts</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
