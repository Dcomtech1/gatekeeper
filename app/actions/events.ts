'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('events')
    .insert({
      organizer_id: user.id,
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      time: (formData.get('time') as string) || null,
      venue: formData.get('venue') as string,
      description: (formData.get('description') as string) || null,
      capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/events')
  redirect(`/events/${data.id}`)
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update({
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      time: (formData.get('time') as string) || null,
      venue: formData.get('venue') as string,
      description: (formData.get('description') as string) || null,
      capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
      status: formData.get('status') as string,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/events/${id}`)
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/events')
  redirect('/events')
}
