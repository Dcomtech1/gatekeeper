'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addGuest(eventId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const phone = (formData.get('phone') as string) || null
  const email = (formData.get('email') as string) || null
  const partySize = Number(formData.get('party_size')) || 1
  const seatInfo = (formData.get('seat_info') as string) || null

  // Insert guest
  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .insert({ event_id: eventId, name, phone, email })
    .select()
    .single()

  if (guestError) return { error: guestError.message }

  // Create invitation (the QR code record)
  const { error: invError } = await supabase.from('invitations').insert({
    event_id: eventId,
    guest_id: guest.id,
    party_size: partySize,
    seat_info: seatInfo,
  })

  if (invError) return { error: invError.message }

  revalidatePath(`/events/${eventId}/guests`)
  return { success: true }
}

export async function updateGuest(guestId: string, eventId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('guests')
    .update({
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
    })
    .eq('id', guestId)

  if (error) return { error: error.message }

  // Update invitation
  const partySize = Number(formData.get('party_size')) || 1
  const seatInfo = (formData.get('seat_info') as string) || null

  await supabase
    .from('invitations')
    .update({ party_size: partySize, seat_info: seatInfo })
    .eq('guest_id', guestId)

  revalidatePath(`/events/${eventId}/guests`)
  return { success: true }
}

export async function deleteGuest(guestId: string, eventId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('guests').delete().eq('id', guestId)

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}/guests`)
  return { success: true }
}
