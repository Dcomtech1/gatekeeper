import type { Metadata } from 'next'
import { Space_Grotesk, DM_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

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
  title: 'Crenelle — Event Access Management',
  description: 'Control who enters your event. Every seat accounted for.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${dmMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-display)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
