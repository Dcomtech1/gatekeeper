'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Pencil, Trash2, Save, X } from 'lucide-react'
import { updateEvent, deleteEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/lib/types'

const fieldCls = "w-full bg-background border-2 border-foreground/40 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/40 focus:outline-none focus:border-signal transition-colors"
const labelCls = "font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80"

export default function EventOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSubmitting = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadEvent() {
      const { data } = await supabase.from('events').select('*').eq('id', id).single()
      if (data) setEvent(data)
    }

    loadEvent()

    // Poll every 10s — guarantees status badge updates without Supabase Realtime
    const poll = setInterval(loadEvent, 10000)

    const channel = supabase
      .channel(`event-detail-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${id}` }, () => loadEvent())
      .subscribe()

    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [id])

  if (!event) return (
    <div className="font-mono text-xs uppercase text-foreground/60 tracking-widest py-12 text-center animate-pulse">
      LOADING_EVENT_DATA...
    </div>
  )

  async function handleUpdate(formData: FormData) {
    if (isSubmitting.current) return
    isSubmitting.current = true
    setLoading(true)
    const result = await updateEvent(id, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setEditing(false)
      router.refresh()
    }
    setLoading(false)
    isSubmitting.current = false
  }

  async function handleDelete() {
    if (!confirm(`Delete "${event!.name}"? This will remove all guests and QR codes. This cannot be undone.`)) return
    await deleteEvent(id)
  }

  const statusColors: Record<string, string> = {
    live:      'status-admitted',
    published: 'status-pending',
    draft:     'bg-foreground/10 text-foreground/60 px-4 py-1',
    ended:     'status-denied',
  }

  if (editing) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal mb-2">EDITING_EVENT</p>
          <h2 className="font-display text-4xl uppercase text-foreground leading-none">Edit Details</h2>
        </div>

        <form action={handleUpdate} className="brutalist-card flex flex-col gap-6">
          {error && (
            <div role="alert" aria-live="assertive" className="border-2 border-denied bg-denied/10 p-4 font-mono text-sm text-denied uppercase tracking-wide">
              ⚠ {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="ev-name" className={labelCls}>Event Name *</label>
            <input id="ev-name" name="name" defaultValue={event.name} required className={fieldCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="ev-date" className={labelCls}>Date *</label>
              <input id="ev-date" name="date" type="date" defaultValue={event.date} required className={fieldCls} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="ev-time" className={labelCls}>Time</label>
              <input id="ev-time" name="time" type="time" defaultValue={event.time ?? ''} className={fieldCls} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="ev-venue" className={labelCls}>Venue *</label>
            <input id="ev-venue" name="venue" defaultValue={event.venue} required className={fieldCls} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="ev-capacity" className={labelCls}>Capacity</label>
            <input id="ev-capacity" name="capacity" type="number" min="1" defaultValue={event.capacity ?? ''} className={fieldCls} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="ev-status" className={labelCls}>Status</label>
            <select
              id="ev-status"
              name="status"
              defaultValue={event.status}
              className={`${fieldCls} appearance-none cursor-pointer`}
            >
              <option value="draft">Draft — being set up, scanning closed</option>
              <option value="published">Published — ready, scanning closed</option>
              <option value="live">Live — scanning open for ushers</option>
              <option value="ended">Ended — event over, scanning blocked</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="ev-desc" className={labelCls}>Description</label>
            <textarea
              id="ev-desc"
              name="description"
              defaultValue={event.description ?? ''}
              rows={3}
              className={`${fieldCls} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t-2 border-foreground/10">
            <Button type="submit" variant="signal" disabled={loading} className="gap-2 h-12 px-6 text-sm">
              <Save className="h-4 w-4" aria-hidden="true" />
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="gap-2 h-12 px-6 text-sm text-foreground/70 hover:text-foreground">
              <X className="h-4 w-4" aria-hidden="true" />
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="brutalist-card">
        {/* Card header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-foreground/20">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">EVENT_DETAILS</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-2 font-mono text-xs uppercase tracking-widest text-foreground/70 hover:text-foreground border border-foreground/20 hover:border-foreground/50 h-9 px-4"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="gap-2 font-mono text-xs uppercase tracking-widest text-denied/60 hover:text-denied border border-denied/20 hover:border-denied/50 h-9 px-4"
              aria-label={`Delete event ${event.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>

        {/* Data rows */}
        <dl className="flex flex-col gap-6">
          <Row label="EVENT_NAME" value={<span className="font-display text-3xl text-foreground uppercase">{event.name}</span>} />
          <Row label="DATE" value={new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()} />
          {event.time && <Row label="TIME" value={event.time.slice(0, 5)} />}
          <Row label="VENUE" value={event.venue} />
          {event.capacity && <Row label="CAPACITY" value={`${event.capacity} people`} />}
          <Row
            label="STATUS"
            value={
              <span
                className={`inline-block px-4 py-1 font-display text-lg uppercase ${statusColors[event.status] ?? ''}`}
                aria-label={`Status: ${event.status}`}
              >
                {event.status}
              </span>
            }
          />
          {event.description && <Row label="DESCRIPTION" value={event.description} />}
        </dl>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-6">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70 sm:w-36 shrink-0 mb-1 sm:mb-0 sm:pt-1">
        {label}
      </dt>
      <dd className="font-mono text-sm text-foreground leading-relaxed">
        {value}
      </dd>
    </div>
  )
}
