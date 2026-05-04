import { cn } from "@/lib/utils"

interface EventCardProps {
  name: string
  date: string
  time: string
  guestCount: number
  capacity: number
  status: "OPEN" | "CLOSED" | "LIVE" | "PUBLISHED" | "DRAFT"
  className?: string
}

export function EventCard({
  name,
  date,
  time,
  guestCount,
  capacity,
  status,
  className,
}: EventCardProps) {
  const percentage = Math.min((guestCount / capacity) * 100, 100)

  const statusColors: Record<string, string> = {
    LIVE:      "bg-admitted text-void",
    PUBLISHED: "bg-signal text-void",
    DRAFT:     "bg-foreground/15 text-foreground/60",
    OPEN:      "bg-signal text-void",
    CLOSED:    "bg-denied text-void",
  }

  return (
    <div
      className={cn(
        "relative w-full border-2 border-foreground bg-background flex overflow-hidden rounded-none",
        className
      )}
    >
      {/* Physical Boarding Pass Left Edge */}
      <div className="w-2 md:w-3 bg-signal shrink-0" />

      {/* Main Stub Content */}
      <div className="flex-1 flex flex-col divide-y-2 divide-foreground/20">
        {/* Top Section: Event Identity */}
        <div className="p-5 flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-[0.8] tracking-tighter text-foreground">
              {name}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-foreground/80 border border-foreground/40 px-2 py-0.5">
              MANIFEST NO. {Math.floor(Math.random() * 9000) + 1000}
            </span>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-foreground/80">
              {date} // {time}
            </span>
          </div>
        </div>

        {/* Middle: The Tear Line */}
        <div className="relative py-3 px-5 bg-background flex items-center">
          <div className="border-t-2 border-dashed border-foreground/30 w-full h-0" />
          <div className="absolute -left-1 w-2 h-2 bg-foreground rotate-45" />
          <div className="absolute -right-1 w-2 h-2 bg-foreground rotate-45" />
        </div>

        {/* Bottom Strip: Metrics & Status */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            {/* Guest Metrics */}
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase text-foreground/70 mb-1">
                GUEST_COUNT
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl text-foreground leading-none">
                  {guestCount.toString().padStart(3, "0")}
                </span>
                <span className="font-mono text-xs text-foreground/60">
                  / {capacity}
                </span>
              </div>
            </div>

            {/* Capacity Visualizer */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
              <span className="font-mono text-[10px] uppercase text-foreground/70">
                CAPACITY_LOAD
              </span>
              <div className="w-full h-5 border-2 border-foreground/40 bg-background relative p-[2px]">
                <div
                  className="h-full bg-signal transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "font-display text-2xl px-6 py-2 leading-none inline-flex items-center justify-center uppercase",
              statusColors[status]
            )}
          >
            {status}
          </div>
        </div>

        {/* Fine Print Footer (Ledger Style) */}
        <div className="px-5 py-2 flex justify-between border-t border-foreground/20">
          <span className="font-mono text-[8px] uppercase text-foreground/50">
            GATEKEEP_ENTRY_SYSTEM // ENCRYPTION_ACTIVE
          </span>
          <span className="font-mono text-[8px] uppercase text-foreground/50">
            © {new Date().getFullYear()}_GATEKEEP_CORP
          </span>
        </div>
      </div>
    </div>
  )
}
