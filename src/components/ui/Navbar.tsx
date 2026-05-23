"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()
  
  if (pathname === '/auction/display') return null

  const links = [
    { href: '/', label: 'Home' },
    { href: '/teams', label: 'Teams' },
    { href: '/players', label: 'Pool' },
    { href: '/register', label: 'Register' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-8 py-4 flex justify-between items-center shadow-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-background font-display font-black text-lg italic">V</span>
          </div>
          <span className="font-display font-black text-xl text-primary tracking-wider italic">EVL</span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-surface/50 rounded-xl p-1 border border-white/5">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-accent text-background shadow-md' 
                    : 'text-muted hover:text-primary hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
        
        {/* Live Button */}
        <Link href="/auction/display">
          <div className="text-sm font-bold px-5 py-2.5 rounded-xl bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE
          </div>
        </Link>
      </div>
    </nav>
  )
}
