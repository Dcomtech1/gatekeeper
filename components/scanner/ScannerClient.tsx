'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ScanResult =
  | { status: 'success'; guestName: string; partySize: number; enteredCount: number; admittedNow: number; seatInfo: string | null }
  | { status: 'duplicate'; guestName: string; partySize: number; seatInfo: string | null; enteredAt: string }
  | { status: 'error'; message: string }

type PendingSelection = {
  invitationId: string
  guestName: string
  partySize: number
  remaining: number
  seatInfo: string | null
}

export default function ScannerClient({
  token,
  gate,
  eventName,
}: {
  token: string
  gate: string
  eventName: string
  eventDate: string
  eventVenue: string
}) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null)
  const [selectedCount, setSelectedCount] = useState(1)
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef<any>(null)
  const lastScannedRef = useRef<string>('')
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  async function processScan(invitationId: string) {
    if (invitationId === lastScannedRef.current) return
    lastScannedRef.current = invitationId
    setTimeout(() => { lastScannedRef.current = '' }, 3000)

    if (scannerRef.current) {
      try { await scannerRef.current.pause(true) } catch (err) { console.error(err) }
    }

    setProcessing(true)
    setResult(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, scannerToken: token, checkOnly: true }),
      })

      const data = await res.json()

      if (res.status === 409 && data.alreadyEntered) {
        setResult({
          status: 'duplicate',
          guestName: data.guest?.name ?? 'Unknown',
          partySize: data.partySize,
          seatInfo: data.seatInfo,
          enteredAt: data.enteredAt,
        })
        autoReset()
      } else if (res.ok) {
        if (data.partySize > 1 && data.remaining > 1) {
          setPendingSelection({
            invitationId,
            guestName: data.guest?.name ?? 'Unknown',
            partySize: data.partySize,
            remaining: data.remaining,
            seatInfo: data.seatInfo,
          })
          setSelectedCount(data.remaining)
        } else {
          await confirmAdmission(invitationId, 1)
        }
      } else {
        setResult({ status: 'error', message: data.error ?? 'INVALID CODE' })
        autoReset()
      }
    } catch {
      setResult({ status: 'error', message: 'NETWORK FAILURE' })
      autoReset()
    }

    setProcessing(false)
  }

  async function confirmAdmission(invitationId: string, count: number) {
    setProcessing(true)
    setPendingSelection(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, scannerToken: token, count }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          status: 'success',
          guestName: data.guest?.name ?? 'Unknown',
          partySize: data.partySize,
          enteredCount: data.enteredCount,
          admittedNow: data.admittedNow,
          seatInfo: data.seatInfo,
        })
      } else {
        setResult({ status: 'error', message: data.error ?? 'ADMISSION FAILED' })
      }
    } catch {
      setResult({ status: 'error', message: 'CONNECTION LOST' })
    }
    
    setProcessing(false)
    autoReset()
  }

  function autoReset() {
    clearTimeout(resultTimeoutRef.current)
    resultTimeoutRef.current = setTimeout(() => {
      setResult(null)
      if (scannerRef.current) {
        try { scannerRef.current.resume() } catch {}
      }
    }, 3000)
  }

  async function startScanner() {
    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode('qr-reader')
    
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => processScan(decodedText.trim()),
        () => {}
      )
      scannerRef.current = scanner
      setScanning(true)
    } catch (err) {
      console.error('Scanner start error:', err)
    }
  }

  useEffect(() => {
    startScanner()
    return () => {
      clearTimeout(resultTimeoutRef.current)
      if (scannerRef.current) {
        try { scannerRef.current.stop() } catch {}
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col bg-[#141210] text-[#E8E4DC] overflow-hidden select-none">
      {/* Top Bar */}
      <header className="p-6 pt-10 shrink-0 border-b border-[#2F2C28]">
        <h1 className="font-display text-2xl tracking-[0.2em] leading-none uppercase font-medium">
          CRENELLE
        </h1>
        <p className="font-mono text-[10px] text-[#9B9689] uppercase mt-2 tracking-widest">
          {eventName} // {gate}
        </p>
      </header>

      {/* Camera Viewport */}
      <main className="flex-1 relative flex items-center justify-center bg-void">
        <div className="relative w-72 h-72">
          {/* Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[#C84630] z-20" />
          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[#C84630] z-20" />
          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[#C84630] z-20" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[#C84630] z-20" />
          
          {/* QR Reader Surface */}
          <div id="qr-reader" className="w-full h-full overflow-hidden grayscale contrast-125 opacity-60" />
          
          {!scanning && !processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#141210]/80 z-10">
              <Button variant="signal" onClick={startScanner}>INITIALIZE CAMERA</Button>
            </div>
          )}
        </div>
      </main>

      {/* Party Size Selector Overlay */}
      {pendingSelection && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-[#141210] border-t-2 border-[#C84630] p-6 animate-in slide-in-from-bottom duration-150">
          <div className="flex flex-col gap-4">
            <header className="text-center">
              <p className="font-mono text-[10px] uppercase text-[#C84630] tracking-[0.2em] mb-1">GROUP DETECTION</p>
              <h2 className="font-display text-2xl uppercase font-medium leading-none">{pendingSelection.guestName}</h2>
              <p className="font-mono text-[10px] text-[#9B9689] mt-1">REMAINING: {pendingSelection.remaining} OF {pendingSelection.partySize}</p>
            </header>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedCount(num)}
                  disabled={num > pendingSelection.remaining}
                  className={cn(
                    "h-14 font-display text-xl font-medium border transition-colors flex items-center justify-center",
                    selectedCount === num 
                      ? "bg-[#C84630] border-[#C84630] text-white" 
                      : num > pendingSelection.remaining
                        ? "bg-[#252220] border-[#252220] text-[#3A3733]"
                        : "bg-transparent border-[#2F2C28] text-[#E8E4DC] hover:border-[#C84630]/50"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>

            <Button 
              variant="signal" 
              className="w-full h-14 text-base mt-2"
              onClick={() => confirmAdmission(pendingSelection.invitationId, selectedCount)}
            >
              ADMIT {selectedCount} GUESTS
            </Button>
          </div>
        </div>
      )}

      {/* Status Panel Flood */}
      <footer className="shrink-0 min-h-[130px] flex items-stretch border-t border-[#2F2C28]">
        {processing ? (
          <div className="w-full bg-[#252220] flex items-center justify-center animate-pulse">
            <h2 className="font-display text-2xl text-[#9B9689] tracking-widest uppercase font-medium">PROCESSING...</h2>
          </div>
        ) : result ? (
          <div className={cn(
            "w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-75",
            result.status === 'success' ? "bg-admitted" : 
            result.status === 'duplicate' ? "bg-[#252220] border-t border-[#C84630]" : "bg-denied"
          )}>
            <h2 className={cn(
              "font-display text-3xl uppercase leading-none tracking-tight font-medium",
              result.status === 'error' ? "text-white" : "text-white"
            )}>
              {result.status === 'success' ? 'ADMITTED' : 
               result.status === 'duplicate' ? 'ALREADY ENTERED' : 'DENIED'}
            </h2>
            <p className={cn(
              "font-mono text-xs uppercase mt-2 font-medium tracking-wide",
              result.status === 'error' ? "text-white/80" : "text-white/60"
            )}>
              {result.status === 'success' ? result.guestName : 
               result.status === 'duplicate' ? `ENTRY_TIME: ${new Date(result.enteredAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 
               result.message}
            </p>
          </div>
        ) : (
          <div className="w-full bg-[#252220] flex items-center justify-center">
            <h2 className="font-display text-2xl text-[#3A3733] tracking-widest uppercase font-medium">READY TO SCAN</h2>
          </div>
        )}
      </footer>
    </div>
  )
}

