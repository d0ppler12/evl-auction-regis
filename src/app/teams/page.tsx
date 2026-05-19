"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeams() {
      const { data } = await supabase.from('teams').select('*, players(*)')
      if (data && data.length > 0) setTeams(data)
      setLoading(false)
    }
    fetchTeams()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-black text-heading tracking-tight uppercase mb-3">Franchises</h2>
        <p className="text-body max-w-lg mx-auto">The official teams competing in the championship tournament.</p>
      </div>

      {loading ? (
        <Loader />
      ) : teams.length === 0 ? (
        <EmptyState title="No Franchises Yet" description="Teams will appear here once they are registered by the organizers." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="card-elevated rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1"
            >
              {/* Team Banner */}
              <div className="h-24 bg-gradient-to-r from-surface to-elevated relative border-b border-border">
                <div className="absolute -bottom-6 left-6 w-14 h-14 bg-surface rounded-xl border-2 border-border flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-display font-black text-primary">{team.name.charAt(0)}</span>
                </div>
              </div>
              
              <div className="pt-10 pb-6 px-6">
                {/* Team Name */}
                <h3 className="text-xl font-display font-bold text-heading mb-1">{team.name}</h3>
                <p className="text-sm text-muted mb-4">
                  Owner: <span className="text-body font-medium">{team.owner_name}</span>
                  {team.is_playing_owner && (
                    <span className="ml-2 text-[11px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-md">PLAYING</span>
                  )}
                </p>

                {/* Purse Info */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-surface rounded-xl p-3 border border-border">
                    <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Remaining</p>
                    <p className="text-lg font-bold text-gold font-mono">₹{(team.purse_remaining / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-border">
                    <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Total</p>
                    <p className="text-lg font-bold text-heading font-mono">₹{(team.total_purse / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                {/* Roster */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Roster ({team.players?.length || 0})</h4>
                  {team.players?.length > 0 ? (
                    <div className="space-y-2">
                      {team.players.slice(0, 3).map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-surface border border-border">
                          <span className="font-bold text-body text-sm">{p.full_name}</span>
                          <span className="text-primary font-mono text-sm font-bold">₹{(p.sold_price / 1000).toFixed(1)}k</span>
                        </div>
                      ))}
                      {team.players.length > 3 && <p className="text-xs text-center text-muted mt-2">+ {team.players.length - 3} more</p>}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted bg-surface rounded-xl border border-dashed border-border">
                      Draft pending...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
