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

  return (
    <div>
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        All Events
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="border-b mb-6">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={`/events/${id}${tab.href}`}
              className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  )
}
