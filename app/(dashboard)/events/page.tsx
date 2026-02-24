import Link from 'next/link'
import { Plus, CalendarDays, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Event } from '@/lib/types'

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  ended: 'bg-gray-100 text-gray-600',
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Events</h1>
          <p className="text-gray-500 text-sm mt-1">Manage access control for all your events</p>
        </div>
        <Link href="/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-xl">
          <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-600 font-medium">No events yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">Create your first event to get started</p>
          <Link href="/events/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(events as Event[]).map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{event.name}</CardTitle>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {event.time && ` · ${event.time.slice(0, 5)}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
