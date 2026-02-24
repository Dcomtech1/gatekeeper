'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Pencil, Trash2, Save, X } from 'lucide-react'
import { updateEvent, deleteEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/lib/types'

export default function EventOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('events').select('*').eq('id', id).single().then(({ data }) => setEvent(data))
  }, [id])

  if (!event) return <div className="text-gray-400 text-sm">Loading...</div>

  async function handleUpdate(formData: FormData) {
    setLoading(true)
    const result = await updateEvent(id, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setEditing(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${event!.name}"? This will remove all guests and QR codes. This cannot be undone.`)) return
    await deleteEvent(id)
  }

  if (editing) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
        </CardHeader>
        <form action={handleUpdate}>
          <CardContent className="space-y-5">
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}

            <div className="space-y-1">
              <Label htmlFor="name">Event Name *</Label>
              <Input id="name" name="name" defaultValue={event.name} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" defaultValue={event.date} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" defaultValue={event.time ?? ''} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="venue">Venue *</Label>
              <Input id="venue" name="venue" defaultValue={event.venue} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min="1" defaultValue={event.capacity ?? ''} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <select name="status" defaultValue={event.status} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={event.description ?? ''} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Event Details</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1 text-red-600 hover:text-red-700 hover:border-red-300">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <Row label="Date" value={new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
            {event.time && <Row label="Time" value={event.time.slice(0, 5)} />}
            <Row label="Venue" value={event.venue} />
            {event.capacity && <Row label="Capacity" value={`${event.capacity} people`} />}
            <Row label="Status" value={
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'active' ? 'bg-green-100 text-green-700' :
                event.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {event.status}
              </span>
            } />
            {event.description && <Row label="Description" value={event.description} />}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <dt className="w-24 shrink-0 text-gray-500 font-medium">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  )
}
