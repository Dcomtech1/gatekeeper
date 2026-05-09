import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Crenelle brand bar */}
      <div className="crenelle-divider" />

      {/* Top nav */}
      <header className="border-b border-border bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/events"
          className="font-display text-base font-medium tracking-[0.2em] uppercase text-foreground hover:text-accent transition-colors"
          aria-label="Crenelle — go to events"
        >
          CRENELLE
        </Link>

        <div className="flex items-center gap-4">
          <span
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block truncate max-w-60"
            aria-label={`Signed in as ${user.email}`}
          >
            {user.email}
          </span>

          <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />

          <div className="flex items-center gap-2">
            <ModeToggle />
            <form action={logout}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-4 py-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
