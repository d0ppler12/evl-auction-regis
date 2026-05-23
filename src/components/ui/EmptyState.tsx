"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-slate-900/60 border border-dashed border-white/10 rounded-3xl ${className || ''}`}
    >
      {icon && (
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mx-auto mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
