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
      {/* Top nav */}
      <header className="border-b-2 border-foreground/20 bg-background/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/events"
          className="font-display text-3xl tracking-[0.3em] uppercase text-foreground hover:text-signal transition-colors"
          aria-label="GateKeep — go to events"
        >
          GATEKEEP
        </Link>

        <div className="flex items-center gap-4">
          <span
            className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 hidden sm:block truncate max-w-[240px]"
            aria-label={`Signed in as ${user.email}`}
          >
            {user.email}
          </span>

          <div className="w-px h-5 bg-foreground/20 hidden sm:block" aria-hidden="true" />

          <div className="flex items-center gap-2">
            <ModeToggle />
            <form action={logout}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="gap-2 font-mono text-xs uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-foreground/5"
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
