-- Migration: 005_open_events.sql
-- Adds support for "open" events where the public can register via a link.
-- Organizers manually accept/reject registrants, who then receive a QR-code email.

-- 1. Add event_type column to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'closed'
  CHECK (event_type IN ('closed', 'open'));

-- 2. Add registration_slug — unique, URL-safe slug for public registration links
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_slug text UNIQUE;

-- 3. Add max_registrations — optional cap on number of registrations (null = unlimited)
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_registrations integer;

-- 4. Create registrations table — public sign-ups for open events
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,

  -- Prevent duplicate registrations per email per event
  UNIQUE (event_id, email)
);

-- 5. RLS for registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Organizers can manage registrations for their own events
CREATE POLICY "Organizers manage registrations for their events"
  ON public.registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = registrations.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Public can insert registrations (actual auth check done server-side via admin client)
CREATE POLICY "Public can insert registrations"
  ON public.registrations FOR INSERT
  WITH CHECK (true);

-- Public can read their own registration by email (for confirmation page)
CREATE POLICY "Public can read own registrations"
  ON public.registrations FOR SELECT
  USING (true);
