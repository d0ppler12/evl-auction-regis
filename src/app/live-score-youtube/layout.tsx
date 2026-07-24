export default function YouTubeLiveScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans overflow-hidden">
      {/* 
        This style tag forces the global body to become transparent 
        ONLY on this specific page, overriding the default bg-slate-900
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        body { background-color: transparent !important; }
      `}} />
      {children}
    </div>
  );
}
