'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'

const fieldCls = "w-full bg-background border-2 border-foreground/40 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/40 focus:outline-none focus:border-signal transition-colors"
const labelCls = "font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80"
const hintCls  = "font-mono text-[10px] text-foreground/60 uppercase tracking-wide mt-1"

export default function NewEventPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createEvent(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground/70 hover:text-signal transition-colors mb-8 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
        Back to Events
      </Link>

      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal mb-2">INITIALIZE_NEW_EVENT</p>
        <h1 className="font-display text-5xl uppercase text-foreground leading-none">Create Event</h1>
      </div>

      <form action={handleSubmit} className="brutalist-card flex flex-col gap-6">
        {error && (
          <div role="alert" aria-live="assertive" className="border-2 border-denied bg-denied/10 p-4 font-mono text-sm text-denied uppercase tracking-wide">
            ⚠ {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="new-ev-name" className={labelCls}>Event Name *</label>
          <input
            id="new-ev-name"
            name="name"
            required
            placeholder="e.g. Amaka & Chidi's Wedding"
            className={fieldCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="new-ev-date" className={labelCls}>Date *</label>
            <input id="new-ev-date" name="date" type="date" required className={fieldCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="new-ev-time" className={labelCls}>Time</label>
            <input id="new-ev-time" name="time" type="time" className={fieldCls} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-ev-venue" className={labelCls}>Venue *</label>
          <input
            id="new-ev-venue"
            name="venue"
            required
            placeholder="e.g. Eko Hotels & Suites, Lagos"
            className={fieldCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-ev-capacity" className={labelCls}>Total Capacity</label>
          <input
            id="new-ev-capacity"
            name="capacity"
            type="number"
            min="1"
            placeholder="e.g. 300"
            className={fieldCls}
          />
          <p className={hintCls}>Maximum number of people allowed in</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-ev-desc" className={labelCls}>Description</label>
          <textarea
            id="new-ev-desc"
            name="description"
            placeholder="Optional notes about the event..."
            rows={3}
            className={`${fieldCls} resize-none`}
          />
        </div>

        <div className="flex gap-3 pt-2 border-t-2 border-foreground/20">
          <Button type="submit" variant="signal" disabled={loading} className="flex-1 h-12 text-sm">
            {loading ? 'CREATING...' : 'CREATE EVENT →'}
          </Button>
          <Link href="/events">
            <Button type="button" variant="ghost" className="h-12 px-6 font-mono text-xs uppercase tracking-widest text-foreground/70 hover:text-foreground border border-foreground/20 hover:border-foreground/50">
              CANCEL
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
