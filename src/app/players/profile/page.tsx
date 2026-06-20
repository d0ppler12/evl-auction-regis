"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Trophy,
  ShieldCheck,
  LogOut,
  Shirt,
  Hash,
  Layout,
  Award,
  CreditCard,
  ChevronRight,
  Activity,
} from "lucide-react";

export default function PlayerProfilePage() {
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/players/me");
        if (res.ok) {
          const data = await res.json();
          setPlayer(data.player);
        } else {
          router.push("/players/login");
        }
      } catch (err) {
        router.push("/players/login");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/players/logout", { method: "POST" });
      if (res.ok) {
        router.push("/players/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!player) return null;

  const isSold = player.auction_status === "sold";
  const inAuction = player.auction_status === "in_auction";
  const isUnsold = player.auction_status === "unsold" || !player.auction_status;

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-200 overflow-x-hidden font-sans selection:bg-blue-500/30">
      {/* Background Neon Glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full" />
        {isSold && (
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full" />
        )}
        {!isSold && (
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-indigo-600/10 blur-[110px] rounded-full" />
        )}
      </div>

      {/* Profile Navbar */}
      <nav className="border-b border-white/5 bg-[#0B1121]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                <img
                  src="/evl-hero.png"
                  alt="EVL Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </Link>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              PLAYER <span className="text-blue-400">DASHBOARD</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <Link href="/teams" className="hover:text-white transition-colors">
              TEAMS
            </Link>
            <Link
              href="/players"
              className="hover:text-white transition-colors"
            >
              PLAYER POOL
            </Link>
            <Link
              href="/points-table"
              className="hover:text-white transition-colors"
            >
              POINTS TABLE
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 bg-white/5 border border-white/10 hover:border-red-500/30 rounded-full transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Space */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Top Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Column 1: Visually stunning Athlete Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`relative rounded-3xl overflow-hidden p-6 border ${
                isSold
                  ? "border-yellow-500/30 bg-gradient-to-b from-[#1b1a13] to-[#0d0d0c]"
                  : "border-blue-500/20 bg-slate-900/40"
              } backdrop-blur-md hover:border-white/20 transition-all shadow-2xl relative flex flex-col items-center text-center`}
            >
              {/* Premium Glow elements */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${isSold ? "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]" : "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"}`}
              />
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Approved
                </span>
              </div>

              {/* Player Image Frame */}
              <div className="mt-8 mb-6 relative">
                <div
                  className={`w-32 h-32 rounded-full overflow-hidden border-2 ${
                    isSold
                      ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                      : "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  } bg-slate-800 flex items-center justify-center`}
                >
                  {player.photo_url && player.photo_url !== "placeholder" ? (
                    <img
                      src={player.photo_url}
                      alt={player.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Athlete Name & Position */}
              <h2 className="text-2xl font-black text-white italic tracking-tight uppercase leading-tight">
                {player.full_name}
              </h2>

              {/* Roster stats shortcut */}
              <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-5 mb-2 text-left">
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                    Base Price
                  </span>
                  <span className="text-base font-black text-white font-mono">
                    {player.base_price ?? 0} PTS
                  </span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                    Jersey Size
                  </span>
                  <span className="text-base font-black text-white font-mono">
                    {player.jersey_size || "M"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Column 2 & 3: Roster and Roster Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Draft Status Card (DYNAMIC) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden p-6 lg:p-8 bg-slate-900/40 border border-white/10 backdrop-blur-md shadow-xl"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-white/5 to-transparent -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Auction Draft
                Status
              </h3>

              {isSold && player.teams && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl flex items-center justify-center font-black text-xl text-yellow-400 shadow-md overflow-hidden">
                        {player.teams.logo_url ? (
                          <img
                            src={player.teams.logo_url}
                            alt={player.teams.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          player.teams.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-yellow-500 text-slate-950 px-2 py-0.5 rounded mb-1">
                          Drafted & Sold
                        </span>
                        <h4 className="text-2xl font-black text-white italic uppercase">
                          {player.teams.name}
                        </h4>
                        <p className="text-xs font-medium text-slate-400">
                          Team Franchise Owner:{" "}
                          <span className="text-slate-300 font-bold">
                            {player.teams.owner_name}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                        Purchase Bid
                      </span>
                      <span className="text-3xl font-black text-yellow-400 font-mono">
                        ₹{player.sold_price}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Congratulations! You have been successfully drafted into the
                    **{player.teams.name}** roster for EVL Season 1. Your
                    training slot schedules and matches details will update
                    directly here.
                  </p>
                </div>
              )}

              {inAuction && (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      Live in Auction Block
                    </div>
                    <h4 className="text-xl font-black text-white italic uppercase mt-2">
                      Active Roster Bidding
                    </h4>
                    <p className="text-xs text-slate-400">
                      Teams are currently bidding on your profile. Watch the
                      Live Center page!
                    </p>
                  </div>
                  <Link href="/">
                    <button className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      Go To Live Center
                    </button>
                  </Link>
                </div>
              )}

              {isUnsold && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <span className="inline-flex items-center text-[10px] font-black tracking-wider bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded mb-1">
                        Active Pool
                      </span>
                      <h4 className="text-xl font-black text-white italic uppercase mt-1">
                        Ready for Auction Pool
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        You are now eligible for EVL’s Monsoon Smash auction and
                        team selection process!
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                        Opening Bid
                      </span>
                      <span className="text-2xl font-black text-blue-400 font-mono">
                        {player.base_price ?? 0} PTS
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Profile Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card A: Athletic & Personal Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl"
              >
                <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Personal & Athletic
                  Specs
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Age
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {player.age || "—"} Years
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Location Wing/Flat
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {player.wing_building || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Phone Number
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {player.phone_number || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Email Address
                    </span>
                    <span className="text-slate-200 font-semibold truncate max-w-[180px]">
                      {player.email || "—"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Card B: Jersey & Experience Specs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl"
              >
                <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-5 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-blue-500" /> Jersey Specs
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Jersey Back Name
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {player.jersey_name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Jersey Chosen Size
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {player.jersey_size || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      Jersey Number
                    </span>
                    <span className="text-slate-200 font-semibold font-mono">
                      #{player.jersey_number || "—"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom experience logs banner */}
            {(player.volleyball_experience ||
              player.previous_tournament_experience) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="p-6 rounded-3xl bg-slate-900/30 border border-white/5 backdrop-blur-md space-y-2 text-sm text-slate-300"
              >
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-500" /> Career &
                  Tournament Experience
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                      Playing Experience
                    </span>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      {player.volleyball_experience || "No profile logs"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
