"use client";

import { useEffect, useState } from "react";
import { Users, Gavel, CalendarDays, ClipboardList } from "lucide-react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    playersRegistered: 0,
    soldPlayers: 0,
    upcomingMatches: 0,
  });

  useEffect(() => {
    adminFetch<typeof stats>("/api/admin/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const statCards = [
    {
      label: "Total Teams",
      value: String(stats.totalTeams),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Players Registered",
      value: String(stats.playersRegistered),
      icon: ClipboardList,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Sold Players",
      value: String(stats.soldPlayers),
      icon: Gavel,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Upcoming Matches",
      value: String(stats.upcomingMatches),
      icon: CalendarDays,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white tracking-tight">
        DASHBOARD OVERVIEW
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-white font-mono">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-bold text-white mt-12 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/dashboard/matches"
          className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6 hover:bg-purple-600/30 transition-all group"
        >
          <CalendarDays className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">Update Matches</h3>
          <p className="text-sm text-slate-400">
            Record scores and update points table standings.
          </p>
        </Link>
      </div>
    </div>
  );
}
