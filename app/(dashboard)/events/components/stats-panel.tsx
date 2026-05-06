import { Users, UserCheck, Clock, BarChart3 } from 'lucide-react'

interface StatsPanelProps {
  stats: {
    totalGuests: number
    checkedIn: number
    totalCapacity: number
  }
  remaining: number
  capacityPercent: number
}

export function StatsPanel({ stats, remaining, capacityPercent }: StatsPanelProps) {
  const statItems = [
    { label: "TOTAL_GUESTS", value: stats.totalGuests, icon: <Users className="size-4" /> },
    { label: "CHECKED_IN", value: stats.checkedIn, icon: <UserCheck className="size-4" /> },
    { label: "REMAINING", value: remaining, icon: <Clock className="size-4" /> },
    { label: "CAPACITY_PERCENT", value: `${capacityPercent.toFixed(1)}%`, icon: <BarChart3 className="size-4" /> },
  ]

  return (
    <div className="border-2 border-foreground bg-background p-8 sticky top-8">
      <header className="flex items-center justify-between mb-10 pb-4 border-b-2 border-foreground">
        <div className="flex items-center gap-3">
          <div className="size-3 bg-signal animate-blink" />
          <h3 className="font-display text-3xl uppercase text-foreground">LIVE_FEED</h3>
        </div>
        <span className="font-mono text-[10px] text-foreground/60 tracking-widest uppercase">REALTIME_DATA</span>
      </header>

      <div className="flex flex-col">
        {statItems.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col ${i !== 0 ? "border-t-4 border-foreground mt-6 pt-6" : ""}`}
          >
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-foreground/70">
                  {stat.icon}
                  <span className="font-mono text-xs uppercase tracking-widest">{stat.label}</span>
                </div>
              </div>
              <span className="font-display text-5xl text-foreground leading-none">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex justify-between items-end mb-2">
          <span className="font-mono text-[10px] text-foreground/40 uppercase">GLOBAL_CAPACITY_LOAD</span>
          <span className="font-mono text-xs text-signal uppercase">{capacityPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full h-6 bg-background border-2 border-foreground relative p-0.5">
          <div
            className="h-full bg-signal transition-all duration-1000 ease-out"
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-10 p-4 bg-secondary border border-foreground/20 font-mono text-[10px] text-foreground/60 uppercase leading-relaxed">
        * ALL DATA AGGREGATED FROM ACTIVE SYSTEM TOKENS. <br />
        SCANNER CONNECTIONS ARE CURRENTLY ENCRYPTED.
      </div>
    </div>
  )
}
