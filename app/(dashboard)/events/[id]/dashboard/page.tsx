'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Users, UserCheck, Clock, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

    // All invitations
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id, party_size, seat_info, guest:guests(name)')
      .eq('event_id', eventId)
      .eq('status', 'pending')

    // Entry logs
    const { data: logs } = await supabase
      .from('entry_logs')
      .select('id, scanned_at, invitation:invitations(id, party_size, seat_info, guest:guests(name))')
      .in('invitation_id', (invitations ?? []).map(i => i.id))
      .order('scanned_at', { ascending: false })

    const logsArr = logs ?? []
    const invArr = invitations ?? []

    // Calculate logs per invitation
    const logsPerInv = new Map<string, number>()
    logsArr.forEach((l: any) => {
      const id = l.invitation?.id
      if (id) logsPerInv.set(id, (logsPerInv.get(id) ?? 0) + 1)
    })

    const totalSeatsCount = invArr.reduce((a, i) => a + (i.party_size ?? 1), 0)
    const totalEntriesCount = logsArr.length

    setTotalInvited(invArr.length)
    setTotalSeats(totalSeatsCount)
    setArrived(totalEntriesCount) // Total People In
    setArrivedSeats(logsPerInv.size) // Total Parties/Groups that have at least one person in
    setEntries(logsArr as unknown as EntryWithGuest[])
    
    setPending(
      invArr
        .map(i => {
          const arrivedInParty = logsPerInv.get(i.id) ?? 0
          const remainingInParty = (i.party_size ?? 1) - arrivedInParty
          return { ...i, remainingInParty }
        })
        .filter(i => i.remainingInParty > 0)
        .map(i => ({ 
          name: (i.guest as any)?.name ?? '', 
          party_size: i.remainingInParty, 
          seat_info: i.seat_info 
        }))
    )
  }

  useEffect(() => {
    loadData()

    // Real-time: re-fetch on new entry
    const supabase = createClient()
    const channel = supabase
      .channel(`entry-logs-${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'entry_logs' }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  const arrivalRate = totalSeats > 0 ? Math.round((arrived / totalSeats) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Live Attendance</h2>
        <p className="text-sm text-gray-500">Updates in real-time as guests arrive</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-indigo-500" />} label="Total Seats" value={totalSeats} sub={`${totalInvited} invitations`} />
        <StatCard icon={<UserCheck className="h-5 w-5 text-green-500" />} label="People In" value={arrived} sub={`${arrivedSeats} groups arrived`} />
        <StatCard icon={<Clock className="h-5 w-5 text-yellow-500" />} label="Pending" value={totalSeats - arrived} sub={`${totalInvited - arrivedSeats} groups empty`} />
        <StatCard icon={<BarChart3 className="h-5 w-5 text-blue-500" />} label="Arrival Rate" value={`${arrivalRate}%`} sub="of total seats filled" />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Overall Attendance</span>
          <span>{arrived} / {totalSeats} people</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${arrivalRate}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent arrivals */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Arrivals</h3>
          {entries.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center border border-dashed rounded-lg">No arrivals yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{(entry.invitation?.guest as any)?.name}</p>
                    <p className="text-xs text-gray-500">
                      {entry.invitation?.seat_info && <span className="mr-2">{entry.invitation.seat_info}</span>}
                      {new Date(entry.scanned_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {entry.invitation?.party_size > 1 ? `Part of ${entry.invitation.party_size}` : 'Individual'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Still waiting */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Not Yet Arrived ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="text-sm text-green-600 py-8 text-center border border-dashed border-green-200 rounded-lg bg-green-50">
              All guests have arrived!
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pending.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    {p.seat_info && <p className="text-xs text-gray-500">{p.seat_info}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    +{p.party_size}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}
