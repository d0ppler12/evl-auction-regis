"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { ClipboardList, Search, CheckCircle, XCircle, Edit, Shield, User } from "lucide-react";

export default function RegistrationsManagement() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<any[]>('/api/admin/players');
      setPlayers(data);
    } catch { setPlayers([]); }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    try {
      await adminFetch(`/api/admin/players/${id}/approve`, { method: 'POST' });
      setPlayers(players.map(p => p.id === id ? { ...p, status: 'approved' } : p));
      if (selectedPlayer?.id === id) setSelectedPlayer({ ...selectedPlayer, status: 'approved' });
    } catch (e: any) { alert(e.message); }
  };

  const handleReject = async (id: string) => {
    try {
      await adminFetch(`/api/admin/players/${id}/reject`, { method: 'POST' });
      setPlayers(players.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
      if (selectedPlayer?.id === id) setSelectedPlayer({ ...selectedPlayer, status: 'rejected' });
    } catch (e: any) { alert(e.message); }
  };

  const handleSaveEdit = async () => {
    if (!selectedPlayer) return;
    try {
      const { id, created_at, ...updates } = editData;
      await adminFetch(`/api/admin/players/${selectedPlayer.id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setPlayers(players.map(p => p.id === selectedPlayer.id ? { ...p, ...editData } : p));
      setSelectedPlayer({ ...selectedPlayer, ...editData });
      alert("Changes saved!");
    } catch (e: any) { alert(e.message); }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.phone_number?.includes(searchTerm);
    const playerStatus = p.status || 'pending';
    const matchesStatus = statusFilter === "all" || playerStatus === statusFilter ||
      (statusFilter === 'pending' && ['pending', 'pending_payment', 'pending_approval'].includes(playerStatus));
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    if (status === 'approved') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (status === 'rejected') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-blue-500" />
          REGISTRATION REVIEW
        </h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Statuses</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Player List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading registrations...</div>
          ) : filteredPlayers.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 text-center">
              <p className="text-slate-400">No players found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlayers.map(player => (
                <div 
                  key={player.id} 
                  onClick={() => { setSelectedPlayer(player); setEditData(player); }}
                  className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all ${selectedPlayer?.id === player.id ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{player.full_name}</h3>
                        <p className="text-xs text-slate-400">{player.phone_number}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(player.status || 'pending')}`}>
                      {player.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-4 border-t border-white/5 pt-3">
                    <div><span className="text-slate-500 block text-[10px]">AGE</span> {player.age || '—'}</div>
                    <div><span className="text-slate-500 block text-[10px]">BUILDING</span> {player.wing_building || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected Player Details */}
        <div className="lg:col-span-1">
          {selectedPlayer ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Player Profile</h2>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(selectedPlayer.status || 'pending')}`}>
                  {selectedPlayer.status || 'pending'}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" value={editData.full_name || ''} onChange={e => setEditData({...editData, full_name: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Age</label>
                    <input type="number" value={editData.age || ''} onChange={e => setEditData({...editData, age: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                    <input type="text" value={editData.phone_number || ''} onChange={e => setEditData({...editData, phone_number: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Wing / Building</label>
                  <input type="text" value={editData.wing_building || ''} onChange={e => setEditData({...editData, wing_building: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                
                <div className="border-t border-white/10 my-4 pt-4">
                  <h3 className="text-xs font-bold text-white mb-3">JERSEY DETAILS</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jersey Name</label>
                      <input type="text" value={editData.jersey_name || ''} onChange={e => setEditData({...editData, jersey_name: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Size</label>
                        <select value={editData.jersey_size || ''} onChange={e => setEditData({...editData, jersey_size: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none">
                          <option value="S">Small</option>
                          <option value="M">Medium</option>
                          <option value="L">Large</option>
                          <option value="XL">X-Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Number</label>
                        <input type="number" value={editData.jersey_number || ''} onChange={e => setEditData({...editData, jersey_number: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={handleSaveEdit} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
                  <Edit className="w-4 h-4" /> Save Edits
                </button>
              </div>

              {['pending', 'pending_payment', 'pending_approval'].includes(selectedPlayer.status) || !selectedPlayer.status ? (
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                  <button onClick={() => handleApprove(selectedPlayer.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleReject(selectedPlayer.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              ) : null}
              {selectedPlayer.status === 'rejected' && (
                <div className="pt-4 border-t border-white/10">
                   <button onClick={() => handleApprove(selectedPlayer.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                    <CheckCircle className="w-4 h-4" /> Re-Approve
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-12 text-center sticky top-8">
              <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Select a player from the list to review their registration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
