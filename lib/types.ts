export type EventStatus = 'draft' | 'published' | 'live' | 'ended'
export type InvitationStatus = 'pending' | 'entered' | 'cancelled'

export interface Event {
  id: string
  organizer_id: string
  name: string
  date: string
  time: string | null
  venue: string
  description: string | null
  capacity: number | null
  status: EventStatus
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  event_id: string
  name: string
  phone: string | null
  email: string | null
  created_at: string
}

export interface Invitation {
  id: string
  event_id: string
  guest_id: string
  party_size: number
  seat_info: string | null
  status: InvitationStatus
  created_at: string
  guest?: Guest
}

export interface ScannerLink {
  id: string
  event_id: string
  token: string
  label: string
  is_active: boolean
  created_at: string
}

export interface EntryLog {
  id: string
  invitation_id: string
  scanner_link_id: string | null
  scanned_at: string
  notes: string | null
  invitation?: Invitation & { guest?: Guest }
}
