-- Migration: 006_email_logs.sql
-- Tracks all transactional emails sent by the system (invitations, reminders).

CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  recipient_email text NOT NULL,
  email_type text NOT NULL CHECK (email_type IN ('invitation', 'reminder')),
  subject text,
  sent_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Organizers can view email logs for their own events
CREATE POLICY "Organizers can view email logs for their events"
  ON public.email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = email_logs.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Service role inserts (via admin client in API routes)
CREATE POLICY "Service can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);
