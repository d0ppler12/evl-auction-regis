"use client"
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-display font-bold tracking-wide rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
  
  const variants: Record<string, string> = {
    primary: "bg-accent text-background hover:bg-blue-400 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-surface/50 text-primary border border-white/5 hover:bg-surface hover:border-white/10 hover:-translate-y-0.5",
    danger: "bg-red-500 text-white hover:bg-red-400 shadow-lg",
    ghost: "bg-transparent text-muted hover:text-primary hover:bg-surface/50",
  }

  const sizes: Record<string, string> = {
    sm: "h-10 px-5 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}
