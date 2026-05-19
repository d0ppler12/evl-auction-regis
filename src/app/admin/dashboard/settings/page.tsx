"use client";

import { Settings } from "lucide-react";

export default function SettingsManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white tracking-tight">SYSTEM SETTINGS</h1>
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 backdrop-blur-sm text-center">
        <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Admin Configuration</h3>
        <p className="text-slate-400">Configure global tournament rules and permissions here.</p>
      </div>
    </div>
  );
}
