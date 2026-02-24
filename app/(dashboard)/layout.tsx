import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogOut, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/events" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          GateKeep
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  )
}
