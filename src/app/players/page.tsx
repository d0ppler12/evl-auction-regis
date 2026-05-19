"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PlayerCard } from '@/components/ui/PlayerCard'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchPlayers() {
      const { data } = await supabase.from('players').select('*, teams(name)').eq('status', 'approved')
      if (data && data.length > 0) setPlayers(data)
      setLoading(false)
    }
    fetchPlayers()
  }, [])

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || p.auction_status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-heading tracking-tight uppercase mb-2">Auction Pool</h2>
          <p className="text-body">The official player draft registry.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <input 
            type="text" 
            placeholder="Search players..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:w-64 bg-surface border border-border rounded-xl px-4 py-3 text-heading placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-3 text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm min-w-[120px]"
          >
            <option value="all">All</option>
            <option value="unsold">Unsold</option>
            <option value="sold">Sold</option>
            <option value="in_auction">Live</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState title="No Players Found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredPlayers.map((player, idx) => (
            <PlayerCard key={player.id} player={player} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}
