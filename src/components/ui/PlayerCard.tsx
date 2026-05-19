"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PlayerCardProps {
  player: any
  index?: number
  className?: string
  onClick?: () => void
}

export function PlayerCard({ player, index = 0, className, onClick }: PlayerCardProps) {
  const isSold = player.auction_status === 'sold'
  const isLive = player.auction_status === 'in_auction'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer group rounded-2xl overflow-hidden transition-all",
        isLive 
          ? "card-elevated ring-2 ring-primary" 
          : "card hover:border-border-light",
        className
      )}
    >
      <div className="p-5 flex flex-col items-center">
        
        {/* Status Badge */}
        {isSold && (
          <div className="self-end mb-2 bg-danger text-white text-[11px] font-bold px-3 py-1 rounded-lg">
            SOLD
          </div>
        )}
        {isLive && (
          <div className="self-end mb-2 bg-success text-white text-[11px] font-bold px-3 py-1 rounded-lg animate-pulse-soft">
            LIVE
          </div>
        )}

        {/* Player Image */}
        <div className="w-20 h-20 rounded-full bg-elevated border-2 border-border mb-4 overflow-hidden flex items-center justify-center">
          <span className="text-muted text-xs font-bold uppercase">Photo</span>
        </div>

        {/* Player Name */}
        <h3 className="text-lg font-display font-bold text-heading mb-1 text-center">
          {player.full_name}
        </h3>
        
        {/* Role Badge */}
        <div className="px-3 py-1 bg-primary/20 rounded-lg border border-primary/30 mb-4">
          <p className="text-xs text-primary-light font-bold tracking-wide uppercase">
            {player.playing_position}
          </p>
        </div>
        
        {/* Price Info */}
        <div className="w-full pt-4 border-t border-border space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted text-xs uppercase tracking-wider font-bold">Base</span>
            <span className="font-mono font-bold text-heading">₹{player.base_price?.toLocaleString() || 0}</span>
          </div>
          
          {isSold && player.teams && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted text-xs uppercase tracking-wider font-bold">Team</span>
                <span className="font-bold text-heading text-xs bg-elevated px-2 py-1 rounded-lg truncate max-w-[120px]">
                  {player.teams.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted text-xs uppercase tracking-wider font-bold">Sold</span>
                <span className="font-bold text-gold font-mono text-base">
                  ₹{player.sold_price?.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
