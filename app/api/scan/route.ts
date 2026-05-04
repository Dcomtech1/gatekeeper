import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { invitationId, scannerToken, count, checkOnly } = await request.json()
  const requestedCount = Math.max(1, Number(count) || 1)

  if (!invitationId || !scannerToken) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Validate the scanner token
  const { data: scannerLink, error: linkError } = await supabase
    .from('scanner_links')
    .select('id, event_id, label, is_active')
    .eq('token', scannerToken)
    .single()

  if (linkError || !scannerLink) {
    return NextResponse.json({ error: 'Invalid scanner link' }, { status: 403 })
  }

  if (!scannerLink.is_active) {
    return NextResponse.json({ error: 'This scanner link has been deactivated' }, { status: 403 })
  }

  // 2. Check the event status — scanning only allowed when event is 'live'
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('status')
    .eq('id', scannerLink.event_id)
    .single()

  if (eventError || !eventData) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (eventData.status === 'ended') {
    return NextResponse.json({ error: 'This event has ended — scanning is closed' }, { status: 403 })
  }

  if (eventData.status === 'draft' || eventData.status === 'published') {
    return NextResponse.json({ error: 'Scanning is not yet open for this event' }, { status: 403 })
  }

  // 3. Look up the invitation and guest
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('id, event_id, party_size, seat_info, status, guest:guests(name, phone)')
    .eq('id', invitationId)
    .single()

  if (invError || !invitation) {
    return NextResponse.json({ error: 'Invalid QR code — invitation not found' }, { status: 404 })
  }

  // 3. Make sure this invitation belongs to the same event as the scanner
  if (invitation.event_id !== scannerLink.event_id) {
    return NextResponse.json({ error: 'This QR code is for a different event' }, { status: 400 })
  }

  // 4. Check if invitation is cancelled
  if (invitation.status === 'cancelled') {
    return NextResponse.json({ error: 'This invitation has been cancelled' }, { status: 400 })
  }

  // 5. Check if the party limit has been reached
  const { count: existingCount, data: logs } = await supabase
    .from('entry_logs')
    .select('scanned_at', { count: 'exact' })
    .eq('invitation_id', invitationId)

  const currentCount = existingCount || 0
  const maxAllowed = (invitation.party_size || 1)
  
  if (currentCount >= maxAllowed) {
    return NextResponse.json({
      error: 'Party full — all members have already entered',
      alreadyEntered: true,
      enteredAt: logs?.[0]?.scanned_at,
      guest: invitation.guest,
      partySize: invitation.party_size,
      seatInfo: invitation.seat_info,
    }, { status: 409 })
  }

  // Check if requested count exceeds remaining capacity
  if (currentCount + requestedCount > maxAllowed) {
    return NextResponse.json({
      error: `Cannot admit ${requestedCount} people. Only ${maxAllowed - currentCount} seats remaining.`,
      remaining: maxAllowed - currentCount,
      guest: invitation.guest,
      partySize: invitation.party_size,
    }, { status: 400 })
  }

  // 6. If checkOnly, just return the data
  if (checkOnly) {
    return NextResponse.json({
      success: true,
      guest: invitation.guest,
      partySize: invitation.party_size,
      remaining: maxAllowed - currentCount,
      seatInfo: invitation.seat_info,
    })
  }

  // 7. Record the entries (one row per person)
  const entries = Array.from({ length: requestedCount }).map(() => ({
    invitation_id: invitationId,
    scanner_link_id: scannerLink.id,
  }))

  const { error: logError } = await supabase.from('entry_logs').insert(entries)

  if (logError) {
    // Catch the specific exception raised by our PostgreSQL trigger on race conditions
    if (logError.message?.includes('Party limit reached')) {
      return NextResponse.json({ error: 'Party full — concurrent scan blocked' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to record entry' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    guest: invitation.guest,
    partySize: invitation.party_size,
    enteredCount: currentCount + requestedCount,
    admittedNow: requestedCount,
    seatInfo: invitation.seat_info,
  })
}
