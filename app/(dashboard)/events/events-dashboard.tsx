"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { DeleteEventDialog } from "@/components/delete-event-dialog"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { deleteEvent } from "@/app/actions/events"
import type { Event, Invitation } from "@/lib/types"

// Hooks & Components
import { useDashboardData } from "./hooks/use-dashboard-data"
import { StatsPanel } from "./components/stats-panel"
import { ControlBar } from "./components/control-bar"
import { EventsHeader } from "./components/events-header"

interface EventsDashboardClientProps {
  initialEvents: Event[]
  initialInvitations: Invitation[]
  initialLogs: { invitation_id: string }[]
}

export function EventsDashboardClient({
  initialEvents,
  initialInvitations,
  initialLogs,
}: EventsDashboardClientProps) {
  // 1. Data & Stats (Hook)
  const {
    events,
    eventStats,
    stats,
    remaining,
    capacityPercent
  } = useDashboardData({ initialEvents, initialInvitations, initialLogs })

  // 2. Interaction State
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"updated" | "created" | "name">("updated")
  const [search, setSearch] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left: Events List */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <EventsHeader 
          isSearchExpanded={isSearchExpanded}
          setIsSearchExpanded={setIsSearchExpanded}
          search={search}
          setSearch={setSearch}
        />

        {events.length === 0 ? (
          <EmptyState
            title="NO_DATA_AVAILABLE"
            action={
              <Link href="/events/new">
                <Button variant="ghost">INITIALIZE_FIRST_EVENT</Button>
              </Link>
            }
            className="p-12 bg-background"
          />
        ) : (
          <>
            <ControlBar 
              filter={filter} 
              setFilter={setFilter} 
              sortBy={sortBy} 
              setSortBy={setSortBy} 
            />

            <div className="flex flex-col gap-6">
              {[...events]
                .filter((e) => {
                  if (search) {
                    const s = search.toLowerCase()
                    return e.name.toLowerCase().includes(s) || e.venue.toLowerCase().includes(s)
                  }
                  if (filter === "all") return true
                  if (filter === "active") return e.status === "live"
                  if (filter === "closed") return e.status === "ended"
                  return e.status === filter
                })
                .sort((a, b) => {
                  if (sortBy === "name") return a.name.localeCompare(b.name)
                  if (sortBy === "created") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                })
                .map((event) => {
                  const s = eventStats[event.id] || { checkedIn: 0, totalCapacity: 0 }
                  return (
                    <div key={event.id} className="relative group">
                      <Link href={`/events/${event.id}`}>
                        <EventCard
                          name={event.name}
                          date={new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}
                          time={event.time?.slice(0, 5) ?? "N/A"}
                          guestCount={s.checkedIn}
                          capacity={event.capacity || 0}
                          status={
                            event.status === "live" ? "LIVE" : 
                            event.status === "published" ? "PUBLISHED" : 
                            event.status === "ended" ? "CLOSED" : "DRAFT"
                          }
                        />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDeleteTarget(event)
                        }}
                        className="absolute top-3 right-3 z-10 size-9 flex items-center justify-center border-2 border-denied text-denied bg-background hover:bg-denied hover:text-paper transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )
                })}
            </div>

            <DeleteEventDialog
              open={!!deleteTarget}
              onOpenChange={(open) => !open && setDeleteTarget(null)}
              eventName={deleteTarget?.name}
              isPending={isPending}
              onConfirm={() => {
                if (!deleteTarget) return
                startTransition(async () => {
                  await deleteEvent(deleteTarget.id)
                  setDeleteTarget(null)
                })
              }}
            />
          </>
        )}
      </div>

      {/* Right: Live Stats Panel */}
      <div className="lg:col-span-5">
        <StatsPanel 
          stats={stats} 
          remaining={remaining} 
          capacityPercent={capacityPercent} 
        />
      </div>
    </div>
  )
}
