import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QrCode, Zap, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react'

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
            
            <p className="mt-8 text-foreground/90 text-lg md:text-xl max-w-120 leading-tight">
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
            <div className="relative w-105 bg-background border-2 border-signal p-8 flex flex-col gap-6 shadow-[20px_20px_0px_0px_rgba(255,214,0,0.15)]">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {[
              { num: "01", title: "Create your event", desc: "Set the event name, date, venue, and total capacity in minutes." },
              { num: "02", title: "Add your guest list", desc: "Enter each guest with their party size and seat assignment. GateKeep generates their unique QR card automatically." },
              { num: "03", title: "Print & distribute cards", desc: "Download beautifully designed entry cards and print them. Hand-deliver or post them to your guests." },
              { num: "04", title: "Scan at the gate", desc: "Share a scanner link with your ushers. They scan every card at the entrance — green means in, red means out." }
            ].map((step, i) => (
              <div key={step.num} className="flex flex-col gap-4">
                <span className="font-display text-5xl text-signal">{step.num}</span>
                <h3 className="font-display text-3xl uppercase leading-tight">{step.title}</h3>
                <p className="font-mono text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Features */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-background relative overflow-hidden border-b-2 border-foreground/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-signal font-display text-2xl tracking-[0.2em] uppercase mb-4">FEATURES</h3>
            <h2 className="font-display text-5xl md:text-8xl uppercase leading-none mb-8">Everything you need at the gate</h2>
            <p className="font-mono text-foreground/70 max-w-2xl mx-auto text-lg md:text-xl leading-tight">
              Built specifically for the challenges of Nigerian events — and any event where access control matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <QrCode className="w-10 h-10" />,
                title: "Personalised QR Entry Cards",
                desc: "Every guest gets a unique QR code tied to their name, party size, and seat. Printed and handed out before the event."
              },
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Instant Gate Scanning",
                desc: "Ushers scan cards using their phone browser — no app download, no login. Entry confirmed in under two seconds."
              },
              {
                icon: <BarChart3 className="w-10 h-10" />,
                title: "Live Attendance Dashboard",
                desc: "Watch arrivals in real time from any device. See who's in, who's pending, and your live headcount — all updating instantly."
              },
              {
                icon: <ShieldCheck className="w-10 h-10" />,
                title: "Zero Uninvited Guests",
                desc: "Every QR code works exactly once. Duplicates are flagged immediately. No valid card means no entry — no exceptions."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 border-2 border-foreground/10 bg-secondary/30 hover:border-signal transition-colors flex flex-col gap-6 relative">
                <div className="text-signal group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-display text-3xl uppercase leading-tight">{feature.title}</h3>
                <p className="font-mono text-sm text-foreground/80 leading-relaxed">{feature.desc}</p>
                <div className="absolute top-4 right-4 text-[10px] font-mono text-foreground/20 group-hover:text-signal/40">
                  REF_{i+1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Use Cases Ticker */}
      <section className="py-24 bg-background border-b-2 border-foreground/20">
        <h2 className="px-6 md:px-12 font-display text-4xl uppercase text-foreground mb-10 tracking-widest text-center md:text-left">BUILT FOR</h2>
        
        <div className="border-y-2 border-foreground/40 py-8 bg-secondary/10 overflow-hidden flex">
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

      {/* Section 5: CTA */}
      <section className="py-32 px-6 md:px-12 bg-void border-b-4 border-signal text-center relative overflow-hidden">
        {/* Background Noise/Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-display text-6xl md:text-9xl uppercase leading-none mb-8 tracking-tighter">
            Ready to take <br/> control of your event?
          </h2>
          <p className="font-mono text-xl md:text-2xl text-signal/90 mb-12 uppercase tracking-wide">
            Set up in minutes. No technical knowledge required.
          </p>
          <Link href="/login">
            <Button variant="signal" size="lg" className="h-20 px-12 text-3xl group">
              CREATE FREE ACCOUNT 
              <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 border-4 border-signal/20 rotate-45" />
        <div className="absolute -top-10 -right-10 w-40 h-40 border-4 border-signal/20 -rotate-12" />
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-background border-t-2 border-foreground/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-display text-4xl tracking-[0.3em] uppercase text-foreground">GATEKEEP</div>
            <p className="font-mono text-[10px] text-foreground/50 uppercase tracking-[0.2em]">
              © 2026 GATEKEEP. BUILT FOR EVENTS THAT MATTER.
            </p>
          </div>
          
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="font-display text-xs text-signal tracking-widest uppercase">Navigation</span>
              <div className="flex flex-col gap-1 font-mono text-sm uppercase">
                <Link href="/login" className="hover:text-signal transition-colors">Login</Link>
                <Link href="/login" className="hover:text-signal transition-colors">Register</Link>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-display text-xs text-signal tracking-widest uppercase">Social</span>
              <div className="flex flex-col gap-1 font-mono text-sm uppercase">
                <a href="#" className="hover:text-signal transition-colors">Twitter</a>
                <a href="#" className="hover:text-signal transition-colors">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

