import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] bg-secondary border-r-2 border-signal/20 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute inset-0 flex flex-wrap gap-8 p-8 rotate-[-20deg] scale-150 opacity-[0.03] pointer-events-none">
          {Array(60).fill(0).map((_, i) => (
            <span key={i} className="font-display text-3xl whitespace-nowrap text-foreground">GATEKEEP</span>
          ))}
        </div>

        <Link href="/" className="relative z-10">
          <div className="font-display text-5xl tracking-[0.3em] uppercase text-foreground">GATEKEEP</div>
        </Link>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="border-l-4 border-signal pl-6">
            <p className="font-display text-4xl uppercase text-foreground leading-tight">
              Every seat<br />accounted for.
            </p>
          </div>
          <p className="font-mono text-sm text-foreground/40 uppercase tracking-widest">
            QR-CODED ENTRY — REAL-TIME SCANNING — FULL CONTROL
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-background">
        {/* Mobile wordmark */}
        <Link href="/" className="lg:hidden mb-10">
          <div className="font-display text-4xl tracking-[0.3em] uppercase text-foreground">GATEKEEP</div>
        </Link>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
