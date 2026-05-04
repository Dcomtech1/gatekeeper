'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
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
          SYSTEM_ACCESS // ORGANIZER_LOGIN
        </p>
        <h1 className="font-display text-5xl uppercase text-foreground leading-none">
          Sign In
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
            htmlFor="login-email"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80"
          >
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full bg-secondary border-2 border-foreground/40 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/40 focus:outline-none focus:border-signal transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-password"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full bg-secondary border-2 border-foreground/40 text-foreground font-mono text-sm px-4 py-3 placeholder:text-foreground/40 focus:outline-none focus:border-signal transition-colors"
          />
        </div>

        <Button
          type="submit"
          variant="signal"
          size="lg"
          disabled={loading}
          className="w-full h-14 text-xl mt-2"
        >
          {loading ? 'VERIFYING...' : 'ACCESS SYSTEM →'}
        </Button>
      </form>

      <p className="font-mono text-xs text-foreground/60 uppercase tracking-widest mt-8 text-center">
        No account?{' '}
        <Link href="/signup" className="text-signal hover:text-foreground transition-colors underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  )
}
