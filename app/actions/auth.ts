'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signupSchema, loginSchema } from '@/lib/validations/auth'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Server-side validation
  const data = Object.fromEntries(formData.entries())
  const result = loginSchema.safeParse(data)

  if (!result.success) {
    const error = result.error.errors[0]?.message || 'VALIDATION_FAILED'
    return { error }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/events')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Server-side validation
  const data = Object.fromEntries(formData.entries())
  const result = signupSchema.safeParse(data)

  if (!result.success) {
    const error = result.error.errors[0]?.message || 'VALIDATION_FAILED'
    return { error }
  }

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/events')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
