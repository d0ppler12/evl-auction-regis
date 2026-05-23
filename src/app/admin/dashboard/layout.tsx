"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Gavel, CalendarDays, Trophy, ClipboardList, Settings, LogOut, Radio } from "lucide-react";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Teams", icon: Users, href: "/admin/dashboard/teams" },
    { name: "Players", icon: UserPlus, href: "/admin/dashboard/players" },
    { name: "Auction Room", icon: Gavel, href: "/admin/dashboard/auction" },
    { name: "Matches", icon: CalendarDays, href: "/admin/dashboard/matches" },
    { name: "Live Controller", icon: Radio, href: "/admin/dashboard/live" },
    { name: "Points Table", icon: Trophy, href: "/admin/dashboard/points" },
    { name: "Registrations", icon: ClipboardList, href: "/admin/dashboard/registrations" },
    { name: "Settings", icon: Settings, href: "/admin/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#0B1121] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Sidebar - Strictly Contained Glow & Blur */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col h-full z-40 overflow-hidden bg-slate-900/60 backdrop-blur-2xl relative">
        
        {/* Contained Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[40%] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="p-6 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-black text-white italic text-xs tracking-tighter">EVL</span>
            </div>
            <span className="text-white font-bold tracking-tight text-lg">ADMIN</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium border border-transparent'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 relative z-10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left font-bold text-sm">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
