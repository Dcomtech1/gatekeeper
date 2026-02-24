'use client'

import { useState, useEffect, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Trash2, Pencil, X, Check, Users } from 'lucide-react'
import { addGuest, updateGuest, deleteGuest } from '@/app/actions/guests'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import type { Invitation, Guest } from '@/lib/types'

type GuestWithInvitation = Guest & { invitation: Invitation | null }

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Guest List</h2>
          <p className="text-sm text-gray-500">{guests.length} guest{guests.length !== 1 ? 's' : ''} · {guests.reduce((a, g) => a + (g.invitation?.party_size ?? 1), 0)} total seats</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Guest</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Guest</DialogTitle></DialogHeader>
            <GuestForm onSubmit={handleAdd} loading={isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {guests.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No guests yet</p>
          <p className="text-gray-400 text-sm mt-1">Add guests to generate their QR entry cards</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Party Size</TableHead>
                <TableHead>Seat</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{guest.phone || guest.email || '—'}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      +{guest.invitation?.party_size ?? 1}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{guest.invitation?.seat_info || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditGuest(guest)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(guest.id, guest.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editGuest} onOpenChange={(o) => !o && setEditGuest(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Guest</DialogTitle></DialogHeader>
          {editGuest && (
            <GuestForm
              onSubmit={handleUpdate}
              loading={isPending}
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
}: {
  onSubmit: (f: FormData) => void
  loading: boolean
  defaultValues?: { name: string; phone: string; email: string; party_size: number; seat_info: string }
}) {
  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="g-name">Full Name *</Label>
        <Input id="g-name" name="name" defaultValue={defaultValues?.name} placeholder="e.g. Ngozi Okafor" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="g-phone">Phone</Label>
          <Input id="g-phone" name="phone" defaultValue={defaultValues?.phone} placeholder="+234..." />
        </div>
        <div className="space-y-1">
          <Label htmlFor="g-email">Email</Label>
          <Input id="g-email" name="email" type="email" defaultValue={defaultValues?.email} placeholder="Optional" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="g-party">Admits (party size) *</Label>
          <Input id="g-party" name="party_size" type="number" min="1" max="20" defaultValue={defaultValues?.party_size ?? 1} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="g-seat">Seat / Table</Label>
          <Input id="g-seat" name="seat_info" defaultValue={defaultValues?.seat_info} placeholder="e.g. Table 5" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Guest'}
      </Button>
    </form>
  )
}
