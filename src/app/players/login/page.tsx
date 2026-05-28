"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function PlayerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isApprovedError, setIsApprovedError] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setIsApprovedError(false)

    try {
      const res = await fetch('/api/players/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      setIsSubmitting(false)

      if (res.ok) {
        // Redirect to player profile
        router.push('/players/profile')
        router.refresh()
      } else {
        if (res.status === 403 && data.error === 'account not approved yet') {
          setIsApprovedError(true)
        } else {
          setErrorMsg(data.error || 'Invalid credentials or login failure.')
        }
      }
    } catch (err) {
      setIsSubmitting(false)
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B1121] overflow-hidden selection:bg-blue-500/30">
      
      {/* Left Visual Banner Section */}
      <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-screen flex flex-col justify-center p-8 lg:p-16 overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-[#0B1121]/80 to-transparent z-10 lg:bg-gradient-to-r lg:from-[#0B1121] lg:via-[#0B1121]/50 lg:to-transparent" />
          <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay z-10" />
          <img 
            src="https://images.unsplash.com/photo-1593786278855-87d21c0022d4?q=80&w=2000" 
            alt="Volleyball court neon" 
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
        </div>

        {/* Ambient Glows */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col h-full justify-center max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer hover:scale-105 transition-all">
                  <span className="font-black text-white italic text-xl tracking-tighter">EVL</span>
                </div>
              </Link>
              <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Season 1 Draft</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter mb-4 italic uppercase">
              Athlete<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">PORTAL.</span>
            </h1>
            
            <p className="text-base lg:text-lg text-slate-300 font-medium mb-8 max-w-sm">
              Log in to view your verified draft profile, monitor your auction standing, and customize your roster configuration.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 z-20 bg-[#0B1121] lg:bg-transparent shadow-[-20px_0_50px_rgba(0,0,0,0.5)] min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
           
           {/* Card Frame with dynamic glassmorphism */}
           <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
             
             {/* Card ambient glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

             <div className="relative z-10 space-y-6">
               
               {/* Header */}
               <div className="mb-6 border-b border-white/10 pb-5">
                 <h3 className="text-2xl font-black text-white tracking-tight mb-1">Player Login</h3>
                 <p className="text-xs text-slate-400">Enter your credentials to access your athlete workspace.</p>
               </div>

               {/* Banner Alerts */}
               <AnimatePresence>
                 {isApprovedError && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0, y: -10 }}
                     animate={{ opacity: 1, height: 'auto', y: 0 }}
                     exit={{ opacity: 0, height: 0, y: -10 }}
                     className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 text-amber-400"
                   >
                     <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                     <div className="text-xs leading-relaxed">
                       <span className="font-bold block uppercase tracking-wider text-[10px] mb-0.5">Approval Pending</span>
                       account not approved yet. Please wait for the tournament administrators to verify your payment and registration.
                     </div>
                   </motion.div>
                 )}

                 {errorMsg && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0, y: -10 }}
                     animate={{ opacity: 1, height: 'auto', y: 0 }}
                     exit={{ opacity: 0, height: 0, y: -10 }}
                     className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 text-red-400"
                   >
                     <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                     <div className="text-xs font-semibold leading-relaxed">
                       <span className="font-bold block uppercase tracking-wider text-[10px] mb-0.5">Authorization Error</span>
                       {errorMsg}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Login Form */}
               <form onSubmit={handleLogin} className="space-y-5">
                 
                  {/* Email/Phone Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address or Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-slate-500" />
                      </div>
                      <input 
                        required 
                        type="text" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com or 10-digit phone" 
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner text-sm" 
                      />
                    </div>
                  </div>

                 {/* Password Input */}
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                   </div>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock className="w-5 h-5 text-slate-500" />
                     </div>
                     <input 
                       required 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="••••••••" 
                       className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner text-sm" 
                     />
                   </div>
                 </div>

                 {/* Submit Button */}
                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                 >
                   {isSubmitting ? (
                     <span className="animate-pulse">Authenticating...</span>
                   ) : (
                     <>Sign In <ArrowRight className="w-5 h-5" /></>
                   )}
                 </button>
               </form>

               {/* Footer Links */}
               <div className="text-center pt-4 border-t border-white/5 flex flex-col gap-2 text-xs">
                 <p className="text-slate-400 font-medium">
                   Don't have an account yet?{' '}
                   <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-all">
                     Register as Player
                   </Link>
                 </p>
                 <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors font-semibold mt-2">
                   ← Back to Home
                 </Link>
               </div>

             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
