import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GateKeep — Event Access Management',
  description: 'Control who enters your event. Every seat accounted for.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased bg-gray-50`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
