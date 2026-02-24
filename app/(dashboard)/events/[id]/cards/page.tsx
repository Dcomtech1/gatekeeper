'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Printer, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import QRCode from 'qrcode'
import type { Guest, Invitation, Event } from '@/lib/types'

type CardData = {
  guest: Guest
  invitation: Invitation
  qrDataUrl: string
}

export default function CardsPage() {
  const { id: eventId } = useParams<{ id: string }>()
  const [cards, setCards] = useState<CardData[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [{ data: ev }, { data: guests }] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('guests').select('*, invitation:invitations(*)').eq('event_id', eventId).order('name'),
      ])

      setEvent(ev)

      const cardList: CardData[] = []
      for (const g of (guests ?? []) as any[]) {
        const invitation = g.invitation?.[0]
        if (!invitation) continue
        const qrDataUrl = await QRCode.toDataURL(invitation.id, {
          width: 256,
          margin: 1,
          color: { dark: '#111827', light: '#ffffff' },
        })
        cardList.push({ guest: g, invitation, qrDataUrl })
      }

      setCards(cardList)
      setLoading(false)
    }
    load()
  }, [eventId])

  if (loading) return <div className="text-gray-400 text-sm py-10 text-center">Generating QR codes...</div>

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
        <QrCode className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No guests added yet</p>
        <p className="text-gray-400 text-sm mt-1">Add guests first, then return here to generate their QR entry cards</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Entry Cards</h2>
          <p className="text-sm text-gray-500">{cards.length} card{cards.length !== 1 ? 's' : ''} ready to print</p>
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print All Cards
        </Button>
      </div>

      <p className="text-xs text-gray-400 mb-4 print:hidden">
        Tip: Use your browser's Print dialog to save as PDF. Set paper size to A4 and enable "Background graphics" for best results.
      </p>

      {/* Print grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-2 print:gap-3">
        {cards.map(({ guest, invitation, qrDataUrl }) => (
          <EntryCard
            key={invitation.id}
            eventName={event?.name ?? ''}
            guestName={guest.name}
            partySize={invitation.party_size}
            seatInfo={invitation.seat_info}
            qrDataUrl={qrDataUrl}
          />
        ))}
      </div>

    </div>
  )
}

function EntryCard({
  eventName,
  guestName,
  partySize,
  seatInfo,
  qrDataUrl,
}: {
  eventName: string
  guestName: string
  partySize: number
  seatInfo: string | null
  qrDataUrl: string
}) {
  return (
    <div className="border-2 border-gray-800 rounded-xl p-4 flex flex-col items-center text-center bg-white print:break-inside-avoid print:rounded-lg print:border">
      {/* Event name */}
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">{eventName}</p>

      {/* QR Code */}
      <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 mb-3" />

      {/* Divider */}
      <div className="w-full border-t border-dashed border-gray-300 mb-3" />

      {/* Guest name */}
      <p className="text-base font-bold text-gray-900 leading-tight">{guestName}</p>

      {/* Party size */}
      <p className="text-xs text-gray-500 mt-1">
        Admits <span className="font-bold text-indigo-600">{partySize}</span> {partySize === 1 ? 'person' : 'people'}
      </p>

      {/* Seat */}
      {seatInfo && (
        <p className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-2 font-medium">{seatInfo}</p>
      )}
    </div>
  )
}
