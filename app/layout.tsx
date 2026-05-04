import type { Metadata } from 'next'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const bebasNeue = Bebas_Neue({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-display'
})

const dmMono = DM_Mono({ 
  weight: ['400', '500'], 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'GateKeep — Event Access Management',
  description: 'Control who enters your event. Every seat accounted for.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bebasNeue.variable} ${dmMono.variable} antialiased font-mono`}>
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
