'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewEventPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createEvent(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the event details to get started</CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="name">Event Name *</Label>
              <Input id="name" name="name" placeholder="e.g. Amaka & Chidi's Wedding" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="venue">Venue *</Label>
              <Input id="venue" name="venue" placeholder="e.g. Eko Hotels & Suites, Lagos" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="capacity">Total Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min="1" placeholder="e.g. 300" />
              <p className="text-xs text-gray-500">Maximum number of people allowed in</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Optional notes about the event..." rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Link href="/events">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
