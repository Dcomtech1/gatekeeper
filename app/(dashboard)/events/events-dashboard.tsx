'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Plus, Download, BarChart3, Users, UserCheck, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/event-card'
import { DeleteEventDialog } from '@/components/delete-event-dialog'
import { EmptyState } from '@/components/empty-state'
import { deleteEvent } from '@/app/actions/events'
import type { Event, Invitation, EntryLog } from '@/lib/types'

interface EventsDashboardClientProps {
  initialEvents: Event[]
  initialInvitations: Invitation[]
  initialLogs: { invitation_id: string }[]
}

export function EventsDashboardClient({
  initialEvents,
  initialInvitations,
  initialLogs
}: EventsDashboardClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations)
  const [logs, setLogs] = useState<{ invitation_id: string }[]>(initialLogs)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()

    async function refreshData() {
      const [{ data: newEvents }, { data: newInvitations }, { data: newLogs }] = await Promise.all([
        supabase.from('events').select('*').order('date', { ascending: false }),
        supabase.from('invitations').select('id, event_id, party_size, status'),
        supabase.from('entry_logs').select('invitation_id'),
      ])

      if (newEvents)      setEvents(newEvents as Event[])
      if (newInvitations) setInvitations(newInvitations as Invitation[])
      if (newLogs)        setLogs(newLogs as { invitation_id: string }[])
    }

    // Initial load
    refreshData()

    // Polling — guaranteed to work even if Supabase Realtime is not configured
    const poll = setInterval(refreshData, 8000)

    // Real-time subscriptions — instant updates when Realtime is enabled
    const channel = supabase
      .channel('global-entry-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'entry_logs' },   () => refreshData())
      .on('postgres_changes', { event: '*',      schema: 'public', table: 'invitations' },  () => refreshData())
      .on('postgres_changes', { event: '*',      schema: 'public', table: 'events' },       () => refreshData())
      .subscribe()

    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [])

  // Calculate per-event stats
  const eventStats = events.reduce((acc, event) => {
    const eventInvitations = invitations.filter(inv => inv.event_id === event.id && inv.status !== 'cancelled')
    const eventLogs = logs.filter(log => {
      const inv = invitations.find(i => i.id === log.invitation_id)
      return inv?.event_id === event.id
    })
    
    acc[event.id] = {
      totalCapacity: event.capacity || 0,
      checkedIn: eventLogs.length,
      totalInvited: eventInvitations.reduce((sum, inv) => sum + inv.party_size, 0)
    }
    return acc
  }, {} as Record<string, { totalCapacity: number, checkedIn: number, totalInvited: number }>)

  // Global stats
  const stats = {
    totalGuests: invitations.filter(i => i.status !== 'cancelled').reduce((sum, inv) => sum + inv.party_size, 0),
    checkedIn: logs.length,
    totalCapacity: events.reduce((sum, e) => sum + (e.capacity || 0), 0),
  }

  const remaining = stats.totalCapacity - stats.checkedIn
  const capacityPercent = stats.totalCapacity > 0 
    ? Math.min((stats.checkedIn / stats.totalCapacity) * 100, 100) 
    : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left: Events List */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <header className="flex items-center gap-4 mb-2">
          <h2 className="font-display text-3xl uppercase text-foreground">EVENTS</h2>
          <div className="flex-1 border-t-2 border-foreground" />
        </header>

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
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'all', label: 'ALL_EVENTS' },
              { id: 'active', label: 'ACTIVE' },
              { id: 'closed', label: 'CLOSED' },
              { id: 'draft', label: 'DRAFT' },
              { id: 'published', label: 'PUBLISHED' },
            ].map((f) => {
              const isActive = filter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest border-2 transition-colors",
                    isActive 
                      ? "bg-foreground text-background border-foreground" 
                      : "bg-transparent text-foreground/60 border-foreground/10 hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-6">
            {events
              .filter(e => {
                if (filter === 'all') return true
                if (filter === 'active') return e.status === 'live'
                if (filter === 'closed') return e.status === 'ended'
                return e.status === filter
              })
              .map((event) => {
              const s = eventStats[event.id] || { checkedIn: 0, totalCapacity: 0 }
              return (
                <div key={event.id} className="relative group">
                  <Link href={`/events/${event.id}`}>
                    <EventCard
                      name={event.name}
                      date={new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}
                      time={event.time?.slice(0, 5) ?? 'N/A'}
                      guestCount={s.checkedIn}
                      capacity={event.capacity || 0}
                      status={
                        event.status === 'live'      ? 'LIVE' :
                        event.status === 'published' ? 'PUBLISHED' :
                        event.status === 'ended'     ? 'CLOSED' : 'DRAFT'
                      }
                    />
                  </Link>
                  {/* Delete button — always visible on mobile, hover-reveal on desktop */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteTarget(event)
                    }}
                    title="Delete event"
                    className="
                      absolute top-3 right-3 z-10
                      size-9 flex items-center justify-center
                      border-2 border-denied text-denied bg-background
                      hover:bg-denied hover:text-paper
                      transition-colors duration-150
                      opacity-100 md:opacity-0 md:group-hover:opacity-100
                      focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-denied
                    "
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete {event.name}</span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* ── Delete Confirmation Dialog ── */}
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
        <div className="border-2 border-foreground bg-background p-8 sticky top-8">
          <header className="flex items-center justify-between mb-10 pb-4 border-b-2 border-foreground">
            <div className="flex items-center gap-3">
              <div className="size-3 bg-signal animate-blink" />
              <h3 className="font-display text-3xl uppercase text-foreground">LIVE_FEED</h3>
            </div>
            <span className="font-mono text-[10px] text-foreground/60 tracking-widest uppercase">REALTIME_DATA</span>
          </header>

          <div className="flex flex-col">
            {[
              { label: 'TOTAL_GUESTS', value: stats.totalGuests, icon: <Users className="size-4" /> },
              { label: 'CHECKED_IN', value: stats.checkedIn, icon: <UserCheck className="size-4" /> },
              { label: 'REMAINING', value: remaining, icon: <Clock className="size-4" /> },
              { label: 'CAPACITY_PERCENT', value: `${capacityPercent.toFixed(1)}%`, icon: <BarChart3 className="size-4" /> },
            ].map((stat, i) => (
              <div key={stat.label} className={`flex flex-col ${i !== 0 ? 'border-t-4 border-foreground mt-6 pt-6' : ''}`}>
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

          {/* Global Capacity Bar */}
          <div className="mt-12">
            <div className="flex justify-between items-end mb-2">
              <span className="font-mono text-[10px] text-foreground/40 uppercase">GLOBAL_CAPACITY_LOAD</span>
              <span className="font-mono text-xs text-signal uppercase">{capacityPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-6 bg-background border-2 border-foreground relative p-[2px]">
              <div 
                className="h-full bg-signal transition-all duration-1000 ease-out"
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
          
          <div className="mt-10 p-4 bg-secondary border border-foreground/20 font-mono text-[10px] text-foreground/60 uppercase leading-relaxed">
            * ALL DATA AGGREGATED FROM ACTIVE SYSTEM TOKENS. <br/>
            SCANNER CONNECTIONS ARE CURRENTLY ENCRYPTED.
          </div>
        </div>
      </div>
    </div>
  )
}
