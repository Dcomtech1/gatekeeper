import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventCardProps {
  name: string
  date: string
  time: string
  guestCount: number
  capacity: number
  status: "OPEN" | "CLOSED" | "LIVE" | "PUBLISHED" | "DRAFT"
  eventType?: "closed" | "open"
  className?: string
  onStatusClick?: (e: React.MouseEvent) => void
}

export function EventCard({
  name,
  date,
  time,
  guestCount,
  capacity,
  status,
  eventType = 'closed',
  className,
  onStatusClick,
}: EventCardProps) {
  const percentage = Math.min((guestCount / capacity) * 100, 100)

  const statusColors: Record<string, string> = {
    LIVE:      "bg-admitted text-white",
    PUBLISHED: "bg-primary text-primary-foreground",
    DRAFT:     "bg-secondary text-muted-foreground",
    OPEN:      "bg-primary text-primary-foreground",
    CLOSED:    "bg-denied text-white",
  }

  return (
    <div
      className={cn(
        "relative w-full border border-border bg-background flex overflow-hidden",
        className
      )}
    >
      {/* Left accent edge */}
      <div className="w-1 bg-accent shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top: Event Identity */}
        <div className="p-5 flex flex-col gap-1">
          <div className="flex items-start gap-3">
            <h2 className="font-display text-2xl md:text-3xl uppercase font-medium tracking-tight text-foreground shrink-0">
              {name}
            </h2>
            {eventType === 'open' && (
              <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 border border-accent text-accent mt-1.5">
                <Globe className="h-2.5 w-2.5" />
                OPEN
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
              {date} — {time}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-5" />

        {/* Bottom: Metrics & Status */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-6">
            {/* Guest count */}
            <div className="flex flex-col">
              <span className="font-mono text-[8px] uppercase text-muted-foreground mb-0.5 tracking-wider">
                Guests
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl text-foreground font-medium leading-none">
                  {guestCount.toString().padStart(3, "0")}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  / {capacity}
                </span>
              </div>
            </div>

            {/* Capacity bar */}
            <div className="flex flex-col gap-1 flex-1 min-w-24">
              <span className="font-mono text-[8px] uppercase text-muted-foreground tracking-wider">
                Capacity
              </span>
              <div className="w-full h-2 bg-secondary relative">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <button
            onClick={(e) => {
              if (onStatusClick) {
                e.preventDefault()
                e.stopPropagation()
                onStatusClick(e)
              }
            }}
            disabled={!onStatusClick}
            className={cn(
              "font-display text-xs font-medium px-4 py-1.5 leading-none inline-flex items-center justify-center uppercase tracking-wider transition-all",
              statusColors[status],
              onStatusClick ? "cursor-pointer hover:ring-1 hover:ring-white/50" : "cursor-default"
            )}
          >
            {status}
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-1.5 flex justify-between border-t border-border">
          <span className="font-mono text-[7px] uppercase text-muted-foreground tracking-wider">
            CRENELLE_ACCESS // VERIFIED
          </span>
          <span className="font-mono text-[7px] uppercase text-muted-foreground tracking-wider">
            © 2026 CRENELLE
          </span>
        </div>
      </div>
    </div>
  )
}
