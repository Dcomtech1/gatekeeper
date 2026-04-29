import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const tabs = [
  { label: 'Overview', href: '' },
  { label: 'Guests', href: '/guests' },
  { label: 'Entry Cards', href: '/cards' },
  { label: 'Scanner Links', href: '/scanner-links' },
  { label: 'Live Dashboard', href: '/dashboard' },
]

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: 'LIVE', cls: 'status-admitted' },
  draft:  { label: 'DRAFT', cls: 'status-pending' },
  ended:  { label: 'ENDED', cls: 'status-denied' },
}

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, date, status')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const statusInfo = statusMap[event.status] ?? { label: event.status.toUpperCase(), cls: '' }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground/70 hover:text-signal transition-colors mb-8 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
        All Events
      </Link>

      {/* Event heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 border-b-2 border-foreground/20 pb-8">
        <div>
          <h1 className="font-display text-5xl md:text-6xl uppercase leading-none tracking-tighter text-foreground">
            {event.name}
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70 mt-2">
            {new Date(event.date).toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        <div
          className={`font-display text-xl px-5 py-2 inline-flex items-center justify-center uppercase self-start sm:self-end shrink-0 ${statusInfo.cls}`}
          aria-label={`Event status: ${statusInfo.label}`}
        >
          {statusInfo.label}
        </div>
      </div>

      {/* Tab navigation */}
      <nav aria-label="Event sections" className="mb-8">
        <div className="flex gap-0 border-b-2 border-foreground/20 overflow-x-auto overflow-y-hidden">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={`/events/${id}${tab.href}`}
              className="
               relative font-mono text-xs uppercase tracking-widest px-5 py-3 whitespace-nowrap
                text-foreground/70 hover:text-foreground transition-colors
                border-b-2 border-transparent -mb-[2px]
                hover:border-foreground/60
                focus-visible:outline-none focus-visible:text-signal focus-visible:border-signal
              "
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      {children}
    </div>
  )
}
