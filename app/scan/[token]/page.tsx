import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ScannerClient from '@/components/scanner/ScannerClient'

export default async function ScannerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Validate the scanner token server-side
  const { data: scannerLink } = await supabase
    .from('scanner_links')
    .select('id, label, event_id, is_active, event:events(name, date, venue)')
    .eq('token', token)
    .single()

  if (!scannerLink) notFound()

  if (!scannerLink.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center text-white">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-xl font-bold mb-2">Link Deactivated</h1>
          <p className="text-gray-400">This scanner link has been deactivated by the organizer.</p>
        </div>
      </div>
    )
  }

  const event = scannerLink.event as any

  return (
    <ScannerClient
      token={token}
      gate={scannerLink.label}
      eventName={event?.name ?? ''}
      eventDate={event?.date ?? ''}
      eventVenue={event?.venue ?? ''}
    />
  )
}
