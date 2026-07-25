"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

type Match = {
  id: string;
  team_a: { name: string; logo_url: string; color_theme: string };
  team_b: { name: string; logo_url: string; color_theme: string };
  sets_team_a: number;
  sets_team_b: number;
  points_team_a: number;
  points_team_b: number;
  current_set: number;
  status: string;
};

// Sponsor Rotation Component
const RotatingSponsors = () => {
  const sponsors = [
    "/enser_logo.png",
    "/namhra_logo.png",
    "/wendys_logo.png"
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sponsors.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, [sponsors.length]);

  return (
    <div className="absolute top-4 right-4 w-64 h-40 flex items-center justify-center p-2 overflow-hidden drop-shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <img src={sponsors[index]} alt="Sponsor" className="max-w-full max-h-full object-contain" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function YouTubeLiveScorePage() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);

  const fetchLiveMatch = () => {
    fetch(`/api/public/fixtures?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const live = (data || []).find((m: Match) => m.status === "live");
        setLiveMatch(live || null);
      })
      .catch((err) => console.error("Error fetching live match:", err));
  };

  useEffect(() => {
    fetchLiveMatch();

    const pollInterval = window.setInterval(() => {
      fetchLiveMatch();
    }, 5000);

    const channel = supabase
      .channel("evl_fixtures_sync")
      .on("broadcast", { event: "match_updated" }, () => {
        fetchLiveMatch();
      })
      .subscribe();

    return () => {
      window.clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (!liveMatch) return null; // Fully transparent if no live match

  const currentSet = liveMatch.current_set || 1;
  const isEvenSet = currentSet % 2 === 0;
  
  const leftTeam = isEvenSet ? liveMatch.team_b : liveMatch.team_a;
  const rightTeam = isEvenSet ? liveMatch.team_a : liveMatch.team_b;
  
  const leftSets = isEvenSet ? liveMatch.sets_team_b : liveMatch.sets_team_a;
  const rightSets = isEvenSet ? liveMatch.sets_team_a : liveMatch.sets_team_b;
  
  const leftPoints = isEvenSet ? liveMatch.points_team_b : liveMatch.points_team_a;
  const rightPoints = isEvenSet ? liveMatch.points_team_a : liveMatch.points_team_b;

  const leftKey = isEvenSet ? 'b' : 'a';
  const rightKey = isEvenSet ? 'a' : 'b';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      
      {/* BOTTOM SCOREBOARD */}
      <div className="absolute bottom-8 inset-x-0 h-[50px] flex justify-center items-end drop-shadow-2xl">
        
        {/* LEFT TEAM SIDE */}
        <div className="flex h-full items-end drop-shadow-xl">
          {/* Logo Box (Overlapping Top) */}
          <div className="h-[70px] w-[100px] bg-white relative z-20 flex items-center justify-center shadow-lg border-b-[6px]" style={{ borderBottomColor: leftTeam?.color_theme || '#475569' }}>
             {leftTeam?.logo_url ? (
                <div className="absolute -top-6 w-24 h-24 drop-shadow-xl">
                  <Image src={leftTeam.logo_url} alt="Left Team" fill className="object-contain" />
                </div>
              ) : (
                <span className="text-2xl font-black text-black">{leftTeam?.name?.charAt(0)}</span>
              )}
          </div>
          
          {/* Name Box */}
          <div className="h-full bg-black/90 backdrop-blur px-6 flex items-center w-[250px] border-b-[6px]" style={{ borderBottomColor: leftTeam?.color_theme || '#475569' }}>
             <span className="text-xl font-black text-white uppercase truncate tracking-tight">{leftTeam?.name}</span>
          </div>

          {/* Sets Box */}
          <div className="h-full bg-slate-900 w-[80px] flex flex-col justify-center items-center text-yellow-500 border-b-[6px] border-slate-950">
            <span className="text-[11px] font-black tracking-widest uppercase leading-none mt-1">SETS</span>
            <span className="text-2xl font-black leading-none mt-0.5">{leftSets}</span>
          </div>

          {/* Points Box */}
          <div className="h-full bg-gradient-to-b from-[#E5C058] to-[#B8860B] w-[90px] flex justify-center items-center text-white border-b-[6px] border-[#8B6508]">
            <motion.span 
              key={`pts-${leftKey}-${leftPoints}`}
              initial={{ scale: 1.5 }} animate={{ scale: 1 }}
              className="text-4xl font-black font-mono drop-shadow-md leading-none"
            >
              {leftPoints}
            </motion.span>
          </div>
        </div>

        {/* CENTER EVL LOGO */}
        <div className="h-[60px] w-[120px] bg-slate-900 relative z-30 flex items-center justify-center shadow-2xl border-x-2 border-slate-800 drop-shadow-2xl">
          <div className="absolute -top-5 w-12 h-12 drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
            <Image src="/evl-hero.png" alt="EVL Logo" fill className="object-contain" />
          </div>
          <div className="absolute bottom-1 text-[#D4AF37] font-black text-[10px] tracking-[0.2em]">
            SET {currentSet}
          </div>
        </div>

        {/* RIGHT TEAM SIDE */}
        <div className="flex h-full items-end drop-shadow-xl">
          {/* Points Box */}
          <div className="h-full bg-gradient-to-b from-[#E5C058] to-[#B8860B] w-[90px] flex justify-center items-center text-white border-b-[6px] border-[#8B6508]">
            <motion.span 
              key={`pts-${rightKey}-${rightPoints}`}
              initial={{ scale: 1.5 }} animate={{ scale: 1 }}
              className="text-4xl font-black font-mono drop-shadow-md leading-none"
            >
              {rightPoints}
            </motion.span>
          </div>

          {/* Sets Box */}
          <div className="h-full bg-slate-900 w-[80px] flex flex-col justify-center items-center text-yellow-500 border-b-[6px] border-slate-950">
            <span className="text-[11px] font-black tracking-widest uppercase leading-none mt-1">SETS</span>
            <span className="text-2xl font-black leading-none mt-0.5">{rightSets}</span>
          </div>
          
          {/* Name Box */}
          <div className="h-full bg-black/90 backdrop-blur px-6 flex items-center justify-end w-[250px] border-b-[6px]" style={{ borderBottomColor: rightTeam?.color_theme || '#475569' }}>
             <span className="text-xl font-black text-white uppercase truncate tracking-tight">{rightTeam?.name}</span>
          </div>

          {/* Logo Box (Overlapping Top) */}
          <div className="h-[70px] w-[100px] bg-white relative z-20 flex items-center justify-center shadow-lg border-b-[6px]" style={{ borderBottomColor: rightTeam?.color_theme || '#475569' }}>
             {rightTeam?.logo_url ? (
                <div className="absolute -top-6 w-24 h-24 drop-shadow-xl">
                  <Image src={rightTeam.logo_url} alt="Right Team" fill className="object-contain" />
                </div>
              ) : (
                <span className="text-2xl font-black text-black">{rightTeam?.name?.charAt(0)}</span>
              )}
          </div>
        </div>

      </div>
    </div>
  );
}
