'use client'

import { useState, useEffect, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Copy, ToggleLeft, ToggleRight, Trash2, Link2 } from 'lucide-react'
import { createScannerLink, toggleScannerLink, deleteScannerLink } from '@/app/actions/scanner-links'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ScannerLink } from '@/lib/types'

export default function ScannerLinksPage() {
  const { id: eventId } = useParams<{ id: string }>()
  const [links, setLinks] = useState<ScannerLink[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function loadLinks() {
    const supabase = createClient()
    const { data } = await supabase
      .from('scanner_links')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
    setLinks(data ?? [])
  }

  useEffect(() => { loadLinks() }, [eventId])

  const scanUrl = (token: string) =>
    `${window.location.origin}/scan/${token}`

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createScannerLink(eventId, formData)
      if (result?.error) toast.error(result.error)
      else { toast.success('Scanner link created'); setAddOpen(false); loadLinks() }
    })
  }

  async function handleToggle(link: ScannerLink) {
    startTransition(async () => {
      await toggleScannerLink(link.id, eventId, !link.is_active)
      loadLinks()
    })
  }

  async function handleDelete(link: ScannerLink) {
    if (!confirm(`Delete scanner link "${link.label}"?`)) return
    startTransition(async () => {
      const result = await deleteScannerLink(link.id, eventId)
      if (result?.error) toast.error(result.error)
      else { toast.success('Link deleted'); loadLinks() }
    })
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(scanUrl(token))
    toast.success('Link copied to clipboard')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Scanner Links</h2>
          <p className="text-sm text-gray-500">Share these links with ushers — no login needed</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />New Link</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Scanner Link</DialogTitle></DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="label">Gate / Label</Label>
                <Input id="label" name="label" placeholder="e.g. Main Entrance, VIP Gate" defaultValue="Main Entrance" />
                <p className="text-xs text-gray-400">Helps you identify which usher is at which gate</p>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Link'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <Link2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No scanner links yet</p>
          <p className="text-gray-400 text-sm mt-1">Create a scanner link and share it with your ushers on event day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="border rounded-lg p-4 bg-white flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{link.label}</span>
                  <Badge variant={link.is_active ? 'default' : 'secondary'} className="text-xs">
                    {link.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 font-mono truncate">{scanUrl(link.token)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => copyLink(link.token)}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleToggle(link)} className="gap-1">
                  {link.is_active
                    ? <><ToggleRight className="h-4 w-4 text-green-600" />Deactivate</>
                    : <><ToggleLeft className="h-4 w-4" />Activate</>
                  }
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(link)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
        <strong>How to use:</strong> Copy a link and send it to your usher via WhatsApp or SMS. They open it on their phone browser — no app download, no login required. The link only works for this event.
      </div>
    </div>
  )
}
