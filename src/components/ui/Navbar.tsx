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
      <div className="max-w-7xl mx-auto glass-card rounded-2xl px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-display font-bold text-lg">V</span>
          </div>
          <span className="font-display font-bold text-xl text-heading tracking-wider">CVA</span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-surface rounded-xl p-1 border border-border">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-muted hover:text-heading hover:bg-elevated'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
        
        {/* Live Button */}
        <Link href="/auction/display">
          <div className="text-sm font-bold px-5 py-2.5 rounded-xl bg-danger text-white hover:bg-red-500 transition-colors shadow-lg">
            🔴 LIVE
          </div>
        </Link>
      </div>
    </nav>
  )
}
