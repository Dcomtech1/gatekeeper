'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createScannerLink(eventId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('scanner_links').insert({
    event_id: eventId,
    label: (formData.get('label') as string) || 'Main Entrance',
  })

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}/scanner-links`)
  return { success: true }
}

export async function toggleScannerLink(linkId: string, eventId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('scanner_links')
    .update({ is_active: isActive })
    .eq('id', linkId)

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}/scanner-links`)
  return { success: true }
}

export async function deleteScannerLink(linkId: string, eventId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('scanner_links').delete().eq('id', linkId)

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}/scanner-links`)
  return { success: true }
}
