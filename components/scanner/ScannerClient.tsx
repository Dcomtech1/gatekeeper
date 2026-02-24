'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, AlertCircle, Camera, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ScanResult =
  | { status: 'success'; guestName: string; partySize: number; seatInfo: string | null }
  | { status: 'duplicate'; guestName: string; partySize: number; seatInfo: string | null; enteredAt: string }
  | { status: 'error'; message: string }

export default function ScannerClient({
  token,
  gate,
  eventName,
  eventDate,
  eventVenue,
}: {
  token: string
  gate: string
  eventName: string
  eventDate: string
  eventVenue: string
}) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScannedRef = useRef<string>('')
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  async function processScan(invitationId: string) {
    // Prevent double-scanning same code within 3 seconds
    if (invitationId === lastScannedRef.current) return
    lastScannedRef.current = invitationId
    setTimeout(() => { lastScannedRef.current = '' }, 3000)

    setProcessing(true)
    setScanning(false)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, scannerToken: token }),
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
      } else if (res.ok) {
        setResult({
          status: 'success',
          guestName: data.guest?.name ?? 'Unknown',
          partySize: data.partySize,
          seatInfo: data.seatInfo,
        })
      } else {
        setResult({ status: 'error', message: data.error ?? 'Something went wrong' })
      }
    } catch {
      setResult({ status: 'error', message: 'Network error. Please try again.' })
    }

    setProcessing(false)

    // Auto-reset after 4 seconds
    clearTimeout(resultTimeoutRef.current)
    resultTimeoutRef.current = setTimeout(() => {
      setResult(null)
      setScanning(true)
    }, 4000)
  }

  async function startScanner() {
    setResult(null)
    setScanning(true)

    // Dynamically import html5-qrcode to avoid SSR issues
    const { Html5QrcodeScanner } = await import('html5-qrcode')

    if (scannerRef.current) {
      try { await scannerRef.current.clear() } catch {}
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
      false
    )

    scanner.render(
      (decodedText: string) => {
        processScan(decodedText.trim())
      },
      () => {} // ignore errors during scanning
    )

    scannerRef.current = scanner
  }

  useEffect(() => {
    return () => {
      clearTimeout(resultTimeoutRef.current)
      if (scannerRef.current) {
        try { scannerRef.current.clear() } catch {}
      }
    }
  }, [])

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{gate}</p>
        <h1 className="text-base font-bold mt-0.5">{eventName}</h1>
        <p className="text-xs text-gray-500">{formattedDate} · {eventVenue}</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">

        {/* Idle state */}
        {!scanning && !result && !processing && (
          <div className="text-center">
            <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ready to Scan</h2>
            <p className="text-gray-400 text-sm mb-8">Tap the button below to activate the camera and start scanning entry cards</p>
            <Button onClick={startScanner} size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              <Camera className="h-5 w-5" />
              Start Scanning
            </Button>
          </div>
        )}

        {/* Processing state */}
        {processing && (
          <div className="text-center">
            <RefreshCw className="h-16 w-16 text-indigo-400 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium">Checking...</p>
          </div>
        )}

        {/* Scanner view */}
        {scanning && !processing && (
          <div className="w-full max-w-sm">
            <p className="text-center text-sm text-gray-400 mb-4">Hold the QR code in front of your camera</p>
            <div id="qr-reader" ref={containerRef} className="rounded-xl overflow-hidden" />
            <Button
              variant="ghost"
              className="w-full mt-4 text-gray-500 hover:text-gray-300"
              onClick={() => { setScanning(false); if (scannerRef.current) { try { scannerRef.current.clear() } catch {} } }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className="w-full max-w-sm text-center">
            {result.status === 'success' && (
              <div className="bg-green-900/50 border border-green-500 rounded-2xl p-8">
                <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-300 mb-1">ENTRY ALLOWED</h2>
                <p className="text-3xl font-bold text-white mt-3">{result.guestName}</p>
                <p className="text-green-300 mt-2 text-lg">
                  Admits <strong>{result.partySize}</strong> {result.partySize === 1 ? 'person' : 'people'}
                </p>
                {result.seatInfo && (
                  <p className="text-sm text-gray-300 mt-2 bg-gray-800/50 px-3 py-1 rounded-full inline-block">{result.seatInfo}</p>
                )}
              </div>
            )}

            {result.status === 'duplicate' && (
              <div className="bg-yellow-900/50 border border-yellow-500 rounded-2xl p-8">
                <AlertCircle className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-yellow-300 mb-1">ALREADY ENTERED</h2>
                <p className="text-2xl font-bold text-white mt-3">{result.guestName}</p>
                <p className="text-sm text-yellow-300/70 mt-2">
                  Entered at {new Date(result.enteredAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {result.seatInfo && (
                  <p className="text-sm text-gray-300 mt-2 bg-gray-800/50 px-3 py-1 rounded-full inline-block">{result.seatInfo}</p>
                )}
              </div>
            )}

            {result.status === 'error' && (
              <div className="bg-red-900/50 border border-red-500 rounded-2xl p-8">
                <XCircle className="h-20 w-20 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-300 mb-1">DENIED</h2>
                <p className="text-gray-300 mt-3">{result.message}</p>
              </div>
            )}

            <Button
              onClick={startScanner}
              className="mt-6 w-full bg-gray-700 hover:bg-gray-600"
              size="lg"
            >
              Scan Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
