'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, AlertCircle, Camera, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null)
  const [selectedCount, setSelectedCount] = useState(1)
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScannedRef = useRef<string>('')
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  async function processScan(invitationId: string) {
    // Prevent double-scanning same code within 5 seconds
    if (invitationId === lastScannedRef.current) return
    lastScannedRef.current = invitationId
    setTimeout(() => { lastScannedRef.current = '' }, 5000)

    // IMMEDIATELY stop and clear the scanner to prevent ghost scans
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        console.error('Error clearing scanner:', err)
      }
    }

    setProcessing(true)
    setScanning(false)

    try {
      // Step 1: Check the invitation status first
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
      } else if (res.ok) {
        // If it's a party > 1 and there's more than 1 person remaining, ask for count
        if (data.partySize > 1 && data.remaining > 1) {
          setPendingSelection({
            invitationId,
            guestName: data.guest?.name ?? 'Unknown',
            partySize: data.partySize,
            remaining: data.remaining,
            seatInfo: data.seatInfo,
          })
          setSelectedCount(data.remaining) // Default to all remaining
        } else {
          // Auto-admit if only 1 person left
          await confirmAdmission(invitationId, 1)
        }
      } else {
        setResult({ status: 'error', message: data.error ?? 'Something went wrong' })
      }
    } catch {
      setResult({ status: 'error', message: 'Network error. Please try again.' })
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

        // Auto-reset after 4 seconds
        clearTimeout(resultTimeoutRef.current)
        resultTimeoutRef.current = setTimeout(() => {
          setResult(null)
          setScanning(true)
        }, 4000)
      } else {
        setResult({ status: 'error', message: data.error ?? 'Failed to admit' })
      }
    } catch {
      setResult({ status: 'error', message: 'Network error.' })
    }
    setProcessing(false)
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
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1, rememberLastUsedCamera: true },
      /* verbose= */ false
    )

    scanner.render(
      (decodedText: string) => {
        // Only process if we are actually in scanning mode
        if (scannerRef.current) {
          processScan(decodedText.trim())
        }
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
        {!scanning && !result && !processing && !pendingSelection && (
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
            <p className="text-lg font-medium">Processing...</p>
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

        {/* Quantity Selection */}
        {pendingSelection && !processing && (
          <div className="w-full max-w-sm text-center bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-sm text-indigo-400 font-bold uppercase tracking-widest mb-1">Group Arrival</h2>
            <p className="text-2xl font-bold text-white mb-2">{pendingSelection.guestName}</p>
            <p className="text-gray-400 text-sm mb-6">Party size: {pendingSelection.partySize} · Remaining: {pendingSelection.remaining}</p>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-300">How many people are entering now?</p>
              <div className="flex items-center justify-center gap-6 py-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-full border-gray-600 text-xl"
                  onClick={() => setSelectedCount(Math.max(1, selectedCount - 1))}
                  disabled={selectedCount <= 1}
                > - </Button>
                <span className="text-4xl font-bold w-12">{selectedCount}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-full border-gray-600 text-xl"
                  onClick={() => setSelectedCount(Math.min(pendingSelection.remaining, selectedCount + 1))}
                  disabled={selectedCount >= pendingSelection.remaining}
                > + </Button>
              </div>
              
              <div className="pt-4 flex flex-col gap-2">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 text-lg font-bold"
                  onClick={() => confirmAdmission(pendingSelection.invitationId, selectedCount)}
                >
                  Confirm Admission
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full text-gray-500"
                  onClick={() => { setPendingSelection(null); setScanning(true); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
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
                <div className="mt-4 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <p className="text-green-300 text-lg font-semibold leading-tight">
                    {result.partySize > 1 ? (
                      <>
                        Admitted <span className="text-white text-2xl mx-1">{result.admittedNow}</span> 
                        {result.admittedNow === 1 ? 'person' : 'people'}
                        <div className="text-sm font-normal mt-1 text-green-400/70">
                          ({result.enteredCount} of {result.partySize} total)
                        </div>
                      </>
                    ) : (
                      <>One person admitted</>
                    )}
                  </p>
                </div>
                {result.seatInfo && (
                  <p className="text-sm text-gray-300 mt-4 bg-gray-800/50 px-3 py-1 rounded-full inline-block">{result.seatInfo}</p>
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
