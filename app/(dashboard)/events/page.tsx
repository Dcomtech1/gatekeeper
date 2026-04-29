import Link from 'next/link'
import { Plus, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EventsDashboardClient } from './events-dashboard'
import type { Event, Invitation } from '@/lib/types'

export default async function EventsPage() {
  const supabase = await createClient()
  
  // Fetch Events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })

  // Fetch Invitations for initial global stats
  const { data: invitations } = await supabase
    .from('invitations')
    .select('id, event_id, party_size, status')

  // Fetch Entry Logs for initial global stats
  const { data: logs } = await supabase
    .from('entry_logs')
    .select('invitation_id')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b-4 border-foreground pb-8">
        <div>
          <h1 className="font-display text-6xl uppercase leading-none tracking-tighter text-foreground">
            CONTROL_PANEL
          </h1>
          <p className="font-mono text-sm uppercase text-foreground/40 mt-2 tracking-[0.2em]">
            ORGANIZER_MANIFEST // VERSION_1.0.5
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/events/new">
            <Button variant="signal" size="lg" className="h-14 px-8 text-2xl">
              <Plus className="size-6 mr-2" />
              CREATE_EVENT
            </Button>
          </Link>
          <Button variant="ghost" size="lg" className="h-14 px-8 text-2xl">
            <Download className="size-6 mr-2" />
            EXPORT_CSV
          </Button>
        </div>
      </div>

      <EventsDashboardClient 
        initialEvents={(events as Event[]) || []} 
        initialInvitations={(invitations as Invitation[]) || []}
        initialLogs={(logs as { invitation_id: string }[]) || []}
      />
    </div>
  )
}

