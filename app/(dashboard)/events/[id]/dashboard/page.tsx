'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Users, UserCheck, Clock, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { EntryLog, Invitation, Guest } from '@/lib/types'

type EntryWithGuest = {
  id: string
  scanned_at: string
  invitation: {
    party_size: number
    seat_info: string | null
    guest: { name: string }
  }
}

export default function LiveDashboardPage() {
  const { id: eventId } = useParams<{ id: string }>()
  const [totalInvited, setTotalInvited] = useState(0)
  const [totalSeats, setTotalSeats] = useState(0)
  const [arrived, setArrived] = useState(0)
  const [arrivedSeats, setArrivedSeats] = useState(0)
  const [entries, setEntries] = useState<EntryWithGuest[]>([])
  const [pending, setPending] = useState<Array<{ name: string; party_size: number; seat_info: string | null }>>([])

  async function loadData() {
    const supabase = createClient()

    const { data: invitations } = await supabase
      .from('invitations')
      .select('id, party_size, seat_info, status, guest:guests(name)')
      .eq('event_id', eventId)
      .eq('status', 'pending')

    const { data: logs } = await supabase
      .from('entry_logs')
      .select('id, scanned_at, invitation:invitations(id, party_size, seat_info, guest:guests(name))')
      .in('invitation_id', (invitations ?? []).map(i => i.id))
      .order('scanned_at', { ascending: false })

    const logsArr = (logs ?? []) as any[]
    const invArr = (invitations ?? []) as any[]

    const logsPerInv = new Map<string, number>()
    logsArr.forEach((l) => {
      const invId = l.invitation?.id
      if (invId) logsPerInv.set(invId, (logsPerInv.get(invId) ?? 0) + 1)
    })

    const totalSeatsCount = invArr.reduce((a, i) => a + (i.party_size ?? 1), 0)
    const totalEntriesCount = logsArr.length

    setTotalInvited(invArr.length)
    setTotalSeats(totalSeatsCount)
    setArrived(totalEntriesCount)
    setArrivedSeats(logsPerInv.size)
    setEntries(logsArr.map(l => ({
      ...l,
      invitation: {
        ...l.invitation,
        guest: Array.isArray(l.invitation.guest) ? l.invitation.guest[0] : l.invitation.guest
      }
    })))

    setPending(
      invArr
        .map(i => {
          const arrivedInParty = logsPerInv.get(i.id) ?? 0
          const remainingInParty = (i.party_size ?? 1) - arrivedInParty
          return { ...i, remainingInParty }
        })
        .filter(i => i.remainingInParty > 0)
        .map(i => ({
          name: (Array.isArray(i.guest) ? i.guest[0] : i.guest)?.name ?? 'Unknown',
          party_size: i.remainingInParty,
          seat_info: i.seat_info
        }))
    )
  }

  useEffect(() => {
    loadData()

    const supabase = createClient()
    const channel = supabase
      .channel(`entry-logs-${eventId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'entry_logs' 
      }, () => loadData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invitations'
      }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  const arrivalRate = totalSeats > 0 ? Math.round((arrived / totalSeats) * 100) : 0

  return (
    <div className="flex flex-col gap-8">
      {/* Section header */}
      <div className="border-b-2 border-foreground/20 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-2 bg-admitted animate-blink" aria-hidden="true" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">REALTIME_FEED</p>
        </div>
        <h2 className="font-display text-4xl uppercase text-foreground leading-none">Live Attendance</h2>
        <p className="font-mono text-xs text-foreground/70 uppercase tracking-widest mt-2">
          Updates in real-time as guests arrive
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-foreground/20" role="list" aria-label="Attendance statistics">
        <StatCard
          icon={<Users className="h-5 w-5 text-foreground/60" aria-hidden="true" />}
          label="Total Seats"
          value={totalSeats}
          sub={`${totalInvited} invitations`}
        />
        <StatCard
          icon={<UserCheck className="h-5 w-5 text-admitted" aria-hidden="true" />}
          label="People In"
          value={arrived}
          sub={`${arrivedSeats} groups arrived`}
          accent="admitted"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-signal" aria-hidden="true" />}
          label="Pending"
          value={totalSeats - arrived}
          sub={`${totalInvited - arrivedSeats} groups waiting`}
          accent="signal"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-foreground/60" aria-hidden="true" />}
          label="Arrival Rate"
          value={`${arrivalRate}%`}
          sub="of total seats filled"
        />
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">OVERALL_CAPACITY_LOAD</span>
          <span className="font-mono text-xs text-signal uppercase">{arrived} / {totalSeats}</span>
        </div>
        <div
          className="w-full h-5 bg-background border-2 border-foreground/40 relative p-[2px]"
          role="progressbar"
          aria-valuenow={arrivalRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Arrival rate: ${arrivalRate}%`}
        >
          <div
            className="h-full bg-signal transition-all duration-1000 ease-out"
            style={{ width: `${arrivalRate}%` }}
          />
        </div>
      </div>

      {/* Recent + Pending columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent arrivals */}
        <div>
          <h3 className="font-display text-2xl uppercase text-foreground mb-4">Recent Arrivals</h3>
          {entries.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-foreground/20 flex items-center justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-foreground/50">NO_ARRIVALS_YET</p>
            </div>
          ) : (
            <div className="flex flex-col gap-px max-h-96 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-4 py-3 bg-admitted/5 border border-admitted/10 hover:border-admitted/20 transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm text-foreground">{(entry.invitation?.guest as any)?.name}</p>
                    <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-widest mt-0.5">
                      {entry.invitation?.seat_info && <span className="mr-3">{entry.invitation.seat_info}</span>}
                      {new Date(entry.scanned_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-admitted/60 border border-admitted/20 px-2 py-1">
                    {entry.invitation?.party_size > 1 ? `+${entry.invitation.party_size}` : 'SOLO'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Still waiting */}
        <div>
          <h3 className="font-display text-2xl uppercase text-foreground mb-4">
            Not Yet Arrived <span className="text-foreground/40">({pending.length})</span>
          </h3>
          {pending.length === 0 ? (
            <div className="py-12 border-2 border-admitted/20 bg-admitted/5 flex items-center justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-admitted">ALL_GUESTS_ARRIVED</p>
            </div>
          ) : (
            <div className="flex flex-col gap-px max-h-96 overflow-y-auto">
              {pending.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 bg-background border border-foreground/10 hover:border-foreground/20 transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm text-foreground">{p.name}</p>
                    {p.seat_info && (
                      <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest mt-0.5">{p.seat_info}</p>
                    )}
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-signal/60 border border-signal/20 px-2 py-1">
                    +{p.party_size}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  accent?: 'admitted' | 'signal'
}) {
  const valueColor = accent === 'admitted' ? 'text-admitted' : accent === 'signal' ? 'text-signal' : 'text-foreground'

  return (
    <div className="bg-background p-5 flex flex-col gap-2" role="listitem">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/70">{label}</span>
      </div>
      <p className={`font-display text-4xl leading-none ${valueColor}`} aria-label={`${label}: ${value}`}>
        {value}
      </p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">{sub}</p>
    </div>
  )
}
