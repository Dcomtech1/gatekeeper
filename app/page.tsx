import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="bg-background min-h-screen text-foreground overflow-x-hidden">

      {/* ═══ Nav ═══ */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 border-b border-border">
        <div className="font-display text-lg font-medium tracking-[0.2em] uppercase">Crenelle</div>
        <div className="flex gap-3 items-center">
          {user ? (
            <Link href="/events">
              <Button variant="signal" size="sm">DASHBOARD</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:flex">LOG IN</Button>
              </Link>
              <Link href="/login">
                <Button variant="signal" size="sm">GET STARTED</Button>
              </Link>
            </>
          )}
        </div>
      </nav>


      {/* ═══ Hero ═══ */}
      <section className="px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28 relative">
        {/* Subtle grid texture — architectural reference */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--foreground) 1px, transparent 1px),
              linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-end relative z-10">
          
          {/* Headline — takes 7 cols */}
          <div className="lg:col-span-7 flex flex-col">
            <h1 className="font-display font-medium uppercase leading-[0.88] tracking-tight">
              <span className="block text-[clamp(64px,12vw,140px)] text-foreground">No</span>
              <span className="block text-[clamp(64px,12vw,140px)] text-accent">Uninvited</span>
              <span className="block text-[clamp(64px,12vw,140px)] text-foreground">Guests.</span>
            </h1>
            
            <div className="mt-10 flex flex-col gap-6 max-w-md">
              <p className="text-muted-foreground text-base leading-relaxed">
                QR-coded entry cards. Real-time scanning. 
                Full control over who walks through your door.
              </p>
              <Link href="/login">
                <Button variant="signal" size="lg" className="w-fit group">
                  CREATE YOUR EVENT
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mock Entry Card — takes 5 cols */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="border border-border bg-card p-6 relative">
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

              <div className="flex justify-between items-start mb-5 pt-2">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Event Access Pass</p>
                  <h3 className="font-display text-2xl uppercase font-medium tracking-tight text-foreground">Underground Rave</h3>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest bg-admitted text-white px-2 py-1">LIVE</span>
              </div>

              <div className="h-px bg-border my-4" />

              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Guest</p>
                    <p className="font-mono text-xs text-foreground">Alex Harris — G048</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Venue</p>
                    <p className="font-mono text-xs text-foreground">Warehouse B, London</p>
                  </div>
                </div>
                {/* QR placeholder */}
                <div className="w-20 h-20 bg-foreground p-1 shrink-0">
                  <div className="grid grid-cols-8 w-full h-full">
                    {Array(64).fill(0).map((_, i) => (
                      <div key={i} className={cn("w-full h-full", Math.random() > 0.4 ? "bg-background" : "bg-transparent")} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Stamp */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] border-2 border-admitted text-admitted font-display text-4xl font-medium px-4 py-1 uppercase opacity-60 pointer-events-none select-none">
                Admit One
              </div>

              <div className="h-px bg-border mt-5 mb-2" />
              <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-muted-foreground">
                CRENELLE_ACCESS // VERIFIED
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ Crenelle Divider ═══ */}
      <div className="crenelle-divider" />


      {/* ═══ How It Works ═══ */}
      <section className="bg-secondary px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="font-display text-3xl md:text-4xl uppercase font-medium tracking-tight">
              How It Works
            </h2>
            <div className="h-px bg-accent flex-1 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
            {[
              { num: "01", title: "Create your event", desc: "Set the event name, date, venue, and total capacity in minutes." },
              { num: "02", title: "Add your guest list", desc: "Enter each guest with their party size and seat assignment. Crenelle generates their unique QR card automatically." },
              { num: "03", title: "Print & distribute cards", desc: "Download designed entry cards and print them. Hand-deliver or post them to your guests." },
              { num: "04", title: "Scan at the gate", desc: "Share a scanner link with your ushers. They scan every card at the entrance — green means in, red means out." }
            ].map((step) => (
              <div key={step.num} className="flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-accent font-medium">{step.num}</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <h3 className="font-display text-xl uppercase font-medium tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ Crenelle Divider ═══ */}
      <div className="crenelle-divider" />


      {/* ═══ Features ═══ */}
      <section className="px-6 md:px-12 py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-3">Features</p>
            <h2 className="font-display text-4xl md:text-5xl uppercase font-medium tracking-tight leading-[0.95]">
              Everything you need at the gate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                num: "01",
                title: "Personalised QR Entry Cards",
                desc: "Every guest gets a unique QR code tied to their name, party size, and seat. Printed and handed out before the event."
              },
              {
                num: "02",
                title: "Instant Gate Scanning",
                desc: "Ushers scan cards using their phone browser — no app download, no login. Entry confirmed in under two seconds."
              },
              {
                num: "03",
                title: "Live Attendance Dashboard",
                desc: "Watch arrivals in real time from any device. See who's in, who's pending, and your live headcount — all updating instantly."
              },
              {
                num: "04",
                title: "Zero Uninvited Guests",
                desc: "Every QR code works exactly once. Duplicates are flagged immediately. No valid card means no entry — no exceptions."
              }
            ].map((feature) => (
              <div key={feature.num} className="bg-card border border-border p-8 md:p-10 flex flex-col gap-4 group hover:border-accent/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-accent tracking-widest">{feature.num}</span>
                  <div className="w-8 h-0.5 bg-accent/30 group-hover:w-12 group-hover:bg-accent transition-all duration-300" />
                </div>
                <h3 className="font-display text-xl md:text-2xl uppercase font-medium tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ Crenelle Divider ═══ */}
      <div className="crenelle-divider-subtle" />


      {/* ═══ Built For ═══ */}
      <section className="py-20 bg-background overflow-hidden">
        <h2 className="px-6 md:px-12 font-display text-xl uppercase font-medium tracking-tight text-muted-foreground mb-10">
          Built For
        </h2>
        
        <div className="border-y border-border py-8 overflow-hidden flex">
          <div className="animate-marquee flex items-center">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex items-center">
                {["WEDDINGS", "CONFERENCES", "CHURCH PROGRAMS", "BIRTHDAY PARTIES", "GALAS", "PRIVATE DINNERS", "CONCERTS", "FESTIVALS", "WORKSHOPS"].map((useCase) => (
                  <span key={useCase} className="font-display text-4xl md:text-6xl text-foreground/10 mx-6 whitespace-nowrap uppercase font-medium">
                    {useCase}
                    <span className="text-accent/40 mx-6">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ CTA — always dark for contrast ═══ */}
      <section className="px-6 md:px-12 py-28 md:py-36 bg-[#141210] text-[#E8E4DC] relative">
        {/* Crenelle pattern at top */}
        <div className="absolute top-0 left-0 right-0 h-6px">
          <div className="w-full h-[6px]" style={{
            background: `
              repeating-linear-gradient(90deg, #C84630 0 8px, transparent 8px 14px) top / 100% 4px no-repeat,
              linear-gradient(#C84630, #C84630) bottom / 100% 2px no-repeat
            `
          }} />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase font-medium tracking-tight leading-[0.95] mb-6">
            Ready to take control of your event?
          </h2>
          <p className="text-[#9B9689] text-base md:text-lg mb-10 max-w-md mx-auto">
            Set up in minutes. No technical knowledge required.
          </p>
          <Link href="/login">
            <Button variant="signal" size="lg" className="group">
              CREATE FREE ACCOUNT
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>


      {/* ═══ Footer ═══ */}
      <footer className="px-6 md:px-12 py-10 bg-background border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="font-display text-base font-medium tracking-[0.2em] uppercase">Crenelle</div>
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
              © 2026 CRENELLE. BUILT FOR EVENTS THAT MATTER.
            </p>
          </div>
          
          <div className="flex gap-10">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] text-accent tracking-widest uppercase">Navigation</span>
              <div className="flex flex-col gap-1 text-xs uppercase text-muted-foreground">
                <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
                <Link href="/login" className="hover:text-foreground transition-colors">Register</Link>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] text-accent tracking-widest uppercase">Social</span>
              <div className="flex flex-col gap-1 text-xs uppercase text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
