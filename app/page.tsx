import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const useCases = [
    "WEDDINGS", "CONFERENCES", "CHURCH PROGRAMS", "BIRTHDAY PARTIES", 
    "GALAS", "PRIVATE DINNERS", "CONCERTS", "FESTIVALS", "WORKSHOPS"
  ]

  return (
    <div className="bg-background min-h-screen text-foreground overflow-x-hidden font-mono selection:bg-signal selection:text-void">
      {/* Background Texture: Repeating Diagonal "GATEKEEP" */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.04]">
        <div className="absolute inset-0 flex flex-wrap gap-x-12 gap-y-8 p-10 rotate-[-15deg] scale-150">
          {Array(200).fill(0).map((_, i) => (
            <span key={i} className="font-display text-4xl whitespace-nowrap">GATEKEEP</span>
          ))}
        </div>
      </div>

      {/* Top Nav */}
      <nav className="relative z-10 border-b-2 border-foreground/20 flex items-center justify-between px-6 py-6 md:px-12 bg-background/80 backdrop-blur-sm">
        <div className="font-display text-4xl tracking-[0.3em] uppercase">GATEKEEP</div>
        <div className="flex gap-4 items-center">
          {user ? (
            <Link href="/events">
              <Button variant="signal" size="lg">DASHBOARD</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden md:flex">LOG IN</Button>
              </Link>
              <Link href="/login">
                <Button variant="signal" size="lg">GET STARTED</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex flex-col justify-center px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col items-start">
            <h1 className="font-display uppercase leading-[0.85] tracking-tighter flex flex-col">
              <span className="text-[clamp(80px,15vw,160px)] text-foreground">NO</span>
              <span className="text-[clamp(80px,15vw,160px)] text-signal">UNINVITED</span>
              <span className="text-[clamp(80px,15vw,160px)] text-foreground">GUESTS.</span>
            </h1>
            
            <p className="mt-8 text-foreground/90 text-lg md:text-xl max-w-[480px] leading-tight">
              QR-coded entry cards. Real-time scanning. <br/>
              Full control over your door.
            </p>

            <Link href="/login" className="mt-12">
              <Button variant="signal" size="lg" className="h-16 px-10 text-2xl">
                CREATE YOUR EVENT →
              </Button>
            </Link>
          </div>

          {/* Desktop Only: Mock Entry Card */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-[420px] bg-background border-2 border-signal p-8 flex flex-col gap-6 shadow-[20px_20px_0px_0px_rgba(255,214,0,0.15)]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-signal/80 mb-1">EVENT_ACCESS_PASS</span>
                  <div className="font-display text-4xl uppercase text-foreground leading-none">UNDERGROUND_RAVE</div>
                </div>
                <div className="bg-signal text-void font-display text-xl px-2">LIVE</div>
              </div>

              <div className="border-t border-dashed border-signal/60 my-2" />

              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-signal/70">GUEST_IDENTITY</span>
                    <span className="font-mono text-sm text-foreground">ALEX_HARRIS // G048</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-signal/70">VENUE_STATION</span>
                    <span className="font-mono text-sm text-foreground">WAREHOUSE_B_LOND</span>
                  </div>
                </div>

                {/* Fake QR Code Grid */}
                <div className="grid grid-cols-8 w-24 h-24 bg-foreground/90 p-1 border-2 border-background shrink-0">
                  {Array(64).fill(0).map((_, i) => (
                    <div key={i} className={cn("w-full h-full", Math.random() > 0.4 ? "bg-background" : "bg-transparent")} />
                  ))}
                </div>
              </div>

              {/* Red Stamp */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-4 border-denied text-denied font-display text-6xl px-6 py-2 uppercase opacity-80 pointer-events-none select-none">
                ADMIT ONE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="bg-foreground text-background py-24 md:py-32 px-6 md:px-12 border-y-4 border-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="font-display text-6xl md:text-8xl uppercase leading-none inline-block relative">
              HOW IT WORKS
              <div className="absolute -bottom-2 left-0 w-full h-1 md:h-2 bg-signal" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-background">
            {[
              { num: "01", title: "CREATE YOUR EVENT", desc: "Define your capacity and generate access link tokens." },
              { num: "02", title: "INVITE YOUR GUESTS", desc: "Send secure QR-coded boarding passes via SMS or email." },
              { num: "03", title: "SCAN AT THE DOOR", desc: "Use any mobile device to admit guests in under 0.5 seconds." }
            ].map((step, i) => (
              <div key={step.num} className={cn("flex flex-col gap-4 py-8 md:py-0", i === 0 ? "md:pr-12" : i === 1 ? "md:px-12" : "md:pl-12")}>
                <span className="font-display text-5xl text-signal">{step.num}</span>
                <h3 className="font-display text-4xl uppercase leading-none">{step.title}</h3>
                <p className="font-mono text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Use Cases Ticker */}
      <section className="py-24 bg-background">
        <h2 className="px-6 md:px-12 font-display text-4xl uppercase text-foreground mb-10 tracking-widest">BUILT FOR</h2>
        
        <div className="border-y-2 border-foreground/40 py-8 bg-secondary overflow-hidden flex">
          <div className="animate-marquee flex items-center">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex items-center">
                {useCases.map((useCase) => (
                  <span key={useCase} className="font-display text-6xl md:text-8xl text-signal mx-8 whitespace-nowrap">
                    {useCase} ·
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground/40 py-12 px-6 md:px-12 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display text-3xl tracking-[0.3em] uppercase text-foreground">GATEKEEP</div>
          <p className="font-mono text-xs text-foreground/70 uppercase tracking-widest text-center md:text-right">
            Built for organizers who mean business. <br/>
            © 2026 GATEKEEP SYSTEMS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  )
}

