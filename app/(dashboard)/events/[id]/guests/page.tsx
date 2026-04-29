'use client'

import { useState, useEffect, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Trash2, Pencil, X, Users } from 'lucide-react'
import { addGuest, updateGuest, deleteGuest } from '@/app/actions/guests'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Invitation, Guest } from '@/lib/types'

type GuestWithInvitation = Guest & { invitation: Invitation | null }

const fieldCls = "w-full bg-background border-2 border-foreground/40 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/40 focus:outline-none focus:border-signal transition-colors"
const labelCls = "font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80"

export default function GuestsPage() {
  const { id: eventId } = useParams<{ id: string }>()
  const [guests, setGuests] = useState<GuestWithInvitation[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editGuest, setEditGuest] = useState<GuestWithInvitation | null>(null)
  const [isPending, startTransition] = useTransition()

  async function loadGuests() {
    const supabase = createClient()
    const { data } = await supabase
      .from('guests')
      .select('*, invitation:invitations(*)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
    setGuests((data as any[])?.map(g => ({ ...g, invitation: g.invitation?.[0] ?? null })) ?? [])
  }

  useEffect(() => { loadGuests() }, [eventId])

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addGuest(eventId, formData)
      if (result?.error) toast.error(result.error)
      else { toast.success('Guest added'); setAddOpen(false); loadGuests() }
    })
  }

  async function handleUpdate(formData: FormData) {
    if (!editGuest) return
    startTransition(async () => {
      const result = await updateGuest(editGuest.id, eventId, formData)
      if (result?.error) toast.error(result.error)
      else { toast.success('Guest updated'); setEditGuest(null); loadGuests() }
    })
  }

  async function handleDelete(guestId: string, guestName: string) {
    if (!confirm(`Remove ${guestName} from the guest list?`)) return
    startTransition(async () => {
      const result = await deleteGuest(guestId, eventId)
      if (result?.error) toast.error(result.error)
      else { toast.success('Guest removed'); loadGuests() }
    })
  }

  const totalSeats = guests.reduce((a, g) => a + (g.invitation?.party_size ?? 1), 0)

  return (
    <div>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b-2 border-foreground/10 pb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal mb-1">GUEST_MANIFEST</p>
          <h2 className="font-display text-4xl uppercase text-foreground leading-none">Guest List</h2>
          <p className="font-mono text-xs text-foreground/70 uppercase tracking-widest mt-2">
            {guests.length} guest{guests.length !== 1 ? 's' : ''} · {totalSeats} total seats
          </p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="signal" className="gap-2 h-12 px-6 text-sm shrink-0">
              <Plus className="h-4 w-4" aria-hidden="true" />
              ADD_GUEST
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-2 border-foreground/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl uppercase text-foreground">Add Guest</DialogTitle>
            </DialogHeader>
            <GuestForm onSubmit={handleAdd} loading={isPending} prefix="add" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {guests.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center text-center">
          <Users className="h-10 w-10 text-foreground/10 mb-4" aria-hidden="true" />
          <p className="font-display text-2xl uppercase text-foreground/20 mb-1">NO_GUESTS_YET</p>
          <p className="font-mono text-xs text-foreground/20 uppercase tracking-widest">
            Add guests to generate their QR entry cards
          </p>
        </div>
      ) : (
        <div className="border-2 border-foreground/10 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] bg-secondary border-b-2 border-foreground/20 px-4 py-3 gap-4">
            {['NAME', 'CONTACT', 'PARTY', 'SEAT', ''].map((h) => (
              <span key={h} className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/60">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center px-4 py-4 gap-4 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors group"
            >
              <span className="font-mono text-sm text-foreground font-medium truncate">{guest.name}</span>
              <span className="font-mono text-xs text-foreground/60 truncate">{guest.phone || guest.email || '—'}</span>
              <span className="font-display text-lg text-signal" aria-label={`Party size: ${guest.invitation?.party_size ?? 1}`}>
                +{guest.invitation?.party_size ?? 1}
              </span>
              <span className="font-mono text-xs text-foreground/60 whitespace-nowrap">{guest.invitation?.seat_info || '—'}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground/20 hover:text-foreground hover:bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setEditGuest(guest)}
                  aria-label={`Edit guest ${guest.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-denied/40 hover:text-denied hover:bg-denied/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(guest.id, guest.name)}
                  aria-label={`Remove guest ${guest.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editGuest} onOpenChange={(o) => !o && setEditGuest(null)}>
        <DialogContent className="bg-background border-2 border-foreground/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl uppercase text-foreground">Edit Guest</DialogTitle>
          </DialogHeader>
          {editGuest && (
            <GuestForm
              onSubmit={handleUpdate}
              loading={isPending}
              prefix="edit"
              defaultValues={{
                name: editGuest.name,
                phone: editGuest.phone ?? '',
                email: editGuest.email ?? '',
                party_size: editGuest.invitation?.party_size ?? 1,
                seat_info: editGuest.invitation?.seat_info ?? '',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GuestForm({
  onSubmit,
  loading,
  defaultValues,
  prefix,
}: {
  onSubmit: (f: FormData) => void
  loading: boolean
  prefix: string
  defaultValues?: { name: string; phone: string; email: string; party_size: number; seat_info: string }
}) {
  return (
    <form action={onSubmit} className="flex flex-col gap-5 mt-2">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${prefix}-g-name`} className={labelCls}>Full Name *</label>
        <input id={`${prefix}-g-name`} name="name" defaultValue={defaultValues?.name} placeholder="e.g. Ngozi Okafor" required className={fieldCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${prefix}-g-phone`} className={labelCls}>Phone</label>
          <input id={`${prefix}-g-phone`} name="phone" defaultValue={defaultValues?.phone} placeholder="+234..." className={fieldCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${prefix}-g-email`} className={labelCls}>Email</label>
          <input id={`${prefix}-g-email`} name="email" type="email" defaultValue={defaultValues?.email} placeholder="Optional" className={fieldCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${prefix}-g-party`} className={labelCls}>Admits (party size) *</label>
          <input id={`${prefix}-g-party`} name="party_size" type="number" min="1" max="20" defaultValue={defaultValues?.party_size ?? 1} required className={fieldCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${prefix}-g-seat`} className={labelCls}>Seat / Table</label>
          <input id={`${prefix}-g-seat`} name="seat_info" defaultValue={defaultValues?.seat_info} placeholder="e.g. Table 5" className={fieldCls} />
        </div>
      </div>

      <Button type="submit" variant="signal" className="w-full h-12 text-sm mt-2" disabled={loading}>
        {loading ? 'SAVING...' : 'SAVE GUEST'}
      </Button>
    </form>
  )
}
