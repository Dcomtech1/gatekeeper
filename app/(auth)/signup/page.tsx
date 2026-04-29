'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal mb-3">
          SYSTEM_ACCESS // NEW_ORGANIZER
        </p>
        <h1 className="font-display text-5xl uppercase text-foreground leading-none">
          Create Account
        </h1>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-6" noValidate>
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="border-2 border-denied bg-denied/10 p-4 font-mono text-sm text-denied uppercase tracking-wide"
          >
            ⚠ {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="signup-email"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full bg-secondary border-2 border-foreground/20 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/20 focus:outline-none focus:border-signal transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="signup-password"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60"
          >
            Password <span className="text-foreground/30">(min. 6 characters)</span>
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Min. 6 characters"
            className="w-full bg-secondary border-2 border-foreground/20 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/20 focus:outline-none focus:border-signal transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="signup-confirm"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60"
          >
            Confirm Password
          </label>
          <input
            id="signup-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="w-full bg-secondary border-2 border-foreground/20 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/20 focus:outline-none focus:border-signal transition-colors"
          />
        </div>

        <Button
          type="submit"
          variant="signal"
          size="lg"
          disabled={loading}
          className="w-full h-14 text-xl mt-2"
        >
          {loading ? 'CREATING...' : 'CREATE ACCOUNT →'}
        </Button>
      </form>

      <p className="font-mono text-xs text-foreground/30 uppercase tracking-widest mt-8 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-signal hover:text-foreground transition-colors underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
