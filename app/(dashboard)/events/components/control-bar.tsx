import { cn } from "@/lib/utils"

interface ControlBarProps {
  filter: string
  setFilter: (filter: string) => void
  sortBy: "updated" | "created" | "name"
  setSortBy: (sort: "updated" | "created" | "name") => void
}

export function ControlBar({ filter, setFilter, sortBy, setSortBy }: ControlBarProps) {
  const filters = [
    { id: "all", label: "ALL" },
    { id: "active", label: "ACTIVE" },
    { id: "closed", label: "CLOSED" },
    { id: "draft", label: "DRAFT" },
    { id: "published", label: "PUBLISHED" },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-10 pb-8 border-b-2 border-foreground/10">
      {/* Status Filter */}
      <div className="flex flex-col gap-1.5 flex-1">
        <span className="font-mono text-[9px] uppercase text-foreground/40 tracking-[0.2em]">
          FILTER_BY_STATUS
        </span>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const isActive = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-colors",
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-foreground/60 border-foreground/20 hover:border-foreground/50 hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sort Selection */}
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <span className="font-mono text-[9px] uppercase text-foreground/40 tracking-[0.2em]">
          SORT_BY
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-transparent border border-foreground/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground focus:outline-none focus:border-signal appearance-none cursor-pointer h-9"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
            backgroundPosition: "calc(100% - 15px) center, calc(100% - 10px) center",
            backgroundSize: "5px 5px, 5px 5px",
            backgroundRepeat: "no-repeat",
          }}
        >
          <option value="updated" className="bg-background">LAST_INTERACTED</option>
          <option value="created" className="bg-background">DATE_CREATED</option>
          <option value="name" className="bg-background">NAME_A_Z</option>
        </select>
      </div>
    </div>
  )
}
