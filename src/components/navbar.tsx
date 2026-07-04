"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [playerSession, setPlayerSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/players/me");
        if (res.ok) {
          const data = await res.json();
          setPlayerSession(data.player);
        }
      } catch (e) {
        // ignore
      }
    };
    checkSession();
  }, []);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "text-primary hover:text-accent transition-colors relative after:absolute after:bottom-[-26px] after:left-0 after:w-full after:h-0.5 after:bg-accent";
    }
    return "text-slate-400 hover:text-primary transition-colors";
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 transition-all duration-300 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center relative">
            <Image
              src="/evl-hero.png"
              alt="EVL Logo"
              fill
              className="object-contain filter drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]"
              sizes="40px"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">
            ETERNIA{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400 font-extrabold">
              VOLLEYBALL
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold">
          <Link href="/" className={getLinkClass("/")}>
            HOME
          </Link>
          <Link href="/teams" className={getLinkClass("/teams")}>
            TEAMS
          </Link>
          <Link href="/players" className={getLinkClass("/players")}>
            PLAYERS
          </Link>
          <Link href="/points-table" className={getLinkClass("/points-table")}>
            POINTS TABLE
          </Link>
          <Link href="/fixtures" className={getLinkClass("/fixtures")}>
            FIXTURES
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 text-xs font-black tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE
          </div>

          {playerSession ? (
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/players/profile"
                className="text-sm font-black text-accent hover:text-white transition-colors tracking-wide"
              >
                MY PROFILE
              </Link>
              <button
                onClick={async () => {
                  const res = await fetch("/api/players/logout", {
                    method: "POST",
                  });
                  if (res.ok) {
                    setPlayerSession(null);
                    window.location.reload();
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 text-sm font-bold transition-all"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              href="/players/login"
              className="hidden sm:inline-block px-5 py-2 rounded-full bg-slate-800 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-bold text-white transition-all hover:scale-105"
            >
              LOGIN
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 md:hidden text-white ml-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-slate-950 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-3 font-bold text-slate-400 text-sm">
              <Link
                href="/"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/teams"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                TEAMS
              </Link>
              <Link
                href="/players"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                PLAYERS
              </Link>
              <Link
                href="/points-table"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                POINTS TABLE
              </Link>
              <Link
                href="/fixtures"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FIXTURES
              </Link>
              
              {playerSession ? (
                <>
                  <Link
                    href="/players/profile"
                    className="block py-2 text-accent hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    MY PROFILE
                  </Link>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/players/logout", {
                        method: "POST",
                      });
                      if (res.ok) {
                        setPlayerSession(null);
                        setIsMobileMenuOpen(false);
                        window.location.reload();
                      }
                    }}
                    className="w-full text-left py-2 text-red-400 hover:text-red-350 transition-colors"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
                  <Link
                    href="/players/login"
                    className="block py-2 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    LOGIN
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
