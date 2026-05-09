import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] bg-secondary flex-col justify-between p-12 relative overflow-hidden">
        {/* Crenelle pattern at top */}
        <div className="absolute top-0 left-0 right-0 crenelle-divider" />

        <Link href="/" className="relative z-10 mt-4">
          <div className="font-display text-xl font-medium tracking-[0.2em] uppercase text-foreground">Crenelle</div>
        </Link>

        <div className="relative z-10 flex flex-col gap-4">
          <h2 className="font-display text-4xl uppercase font-medium tracking-tight text-foreground leading-[0.95]">
            Every seat<br />accounted for.
          </h2>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            QR-CODED ENTRY — REAL-TIME SCANNING — FULL CONTROL
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-background">
        {/* Mobile wordmark */}
        <Link href="/" className="lg:hidden mb-10">
          <div className="font-display text-lg font-medium tracking-[0.2em] uppercase text-foreground">Crenelle</div>
        </Link>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
