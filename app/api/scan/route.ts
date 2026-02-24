import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { invitationId, scannerToken } = await request.json()

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

  // 2. Look up the invitation and guest
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

  // 5. Check if already entered (entry_logs has unique constraint on invitation_id)
  const { data: existing } = await supabase
    .from('entry_logs')
    .select('scanned_at')
    .eq('invitation_id', invitationId)
    .single()

  if (existing) {
    return NextResponse.json({
      error: 'Already entered',
      alreadyEntered: true,
      enteredAt: existing.scanned_at,
      guest: invitation.guest,
      partySize: invitation.party_size,
      seatInfo: invitation.seat_info,
    }, { status: 409 })
  }

  // 6. Record the entry
  const { error: logError } = await supabase.from('entry_logs').insert({
    invitation_id: invitationId,
    scanner_link_id: scannerLink.id,
  })

  if (logError) {
    // Unique constraint violation = race condition (scanned twice very quickly)
    if (logError.code === '23505') {
      return NextResponse.json({ error: 'Already entered', alreadyEntered: true }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to record entry' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    guest: invitation.guest,
    partySize: invitation.party_size,
    seatInfo: invitation.seat_info,
  })
}
