import type { Metadata } from 'next'
import { Space_Grotesk, DM_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ 
  weight: ['300', '400', '500', '600', '700'], 
  subsets: ['latin'],
  variable: '--font-display'
})

const dmMono = DM_Mono({ 
  weight: ['400', '500'], 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'Event Registration — Crenelle',
  description: 'Register for an upcoming event.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${spaceGrotesk.variable} ${dmMono.variable} min-h-screen bg-background`}
      style={{ fontFamily: 'var(--font-display)' }}>
      {children}
    </div>
  )
}
