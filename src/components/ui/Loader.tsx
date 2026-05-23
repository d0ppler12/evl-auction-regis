export function Loader({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-16 ${className || ''}`}>
      <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin mb-4"></div>
      <p className="text-sm font-bold text-blue-500 tracking-widest uppercase animate-pulse">Loading...</p>
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`card p-6 animate-pulse ${className || ''}`}>
      <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-4" />
      <div className="h-5 w-3/4 bg-slate-800 rounded mx-auto mb-3" />
      <div className="h-4 w-1/2 bg-slate-800 rounded mx-auto mb-6" />
      <div className="h-4 w-full bg-slate-800 rounded mb-2" />
      <div className="h-4 w-full bg-slate-800 rounded" />
    </div>
  )
}
