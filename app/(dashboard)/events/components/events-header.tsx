import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventsHeaderProps {
  isSearchExpanded: boolean
  setIsSearchExpanded: (expanded: boolean) => void
  search: string
  setSearch: (search: string) => void
}

export function EventsHeader({
  isSearchExpanded,
  setIsSearchExpanded,
  search,
  setSearch
}: EventsHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-2 min-h-[48px]">
      <div
        className={cn(
          "flex items-center gap-4 flex-1 transition-opacity duration-300",
          isSearchExpanded && "hidden md:flex"
        )}
      >
        <h2 className="font-display text-3xl uppercase text-foreground shrink-0">
          EVENTS
        </h2>
        <div className="flex-1 border-t-2 border-foreground/20" />
      </div>

      <div
        className={cn(
          "flex items-center transition-all duration-300 ease-in-out",
          isSearchExpanded ? "w-full md:w-80 ml-0 md:ml-4" : "w-10"
        )}
      >
        {isSearchExpanded ? (
          <div className="relative w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <input
              autoFocus
              type="text"
              placeholder="SEARCH MANIFEST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => !search && setIsSearchExpanded(false)}
              className="w-full bg-background border-2 border-foreground px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground focus:outline-none focus:border-signal"
            />
            <button
              onClick={() => {
                setIsSearchExpanded(false)
                setSearch("")
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchExpanded(true)}
            className="p-2.5 border-2 border-transparent hover:border-foreground/20 hover:bg-foreground/5 transition-all ml-auto"
            aria-label="Expand search"
          >
            <Search className="size-5" />
          </button>
        )}
      </div>
    </header>
  )
}
