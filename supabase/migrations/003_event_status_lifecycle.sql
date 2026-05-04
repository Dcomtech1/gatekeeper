-- Migration: 003_event_status_lifecycle.sql
-- Extends the event status system from 3 states to 4 states.
-- Old: draft | active | ended
-- New: draft | published | live | ended
--
-- 'published' = event is set up and visible to organiser, but scanning is NOT yet open.
-- 'live'      = scanning is active; ushers can admit guests.
-- 'active' (legacy) is migrated to 'live'.

-- 1. Change the column type to TEXT with a new check constraint
--    (Supabase/Postgres doesn't allow adding values to an existing enum without workarounds,
--     so we use a plain text column with a CHECK constraint here.)

-- Drop the old check constraint if one exists (adjust name if yours differs)
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Migrate legacy 'active' → 'live'
UPDATE events SET status = 'live' WHERE status = 'active';

-- Add the new check constraint with all 4 valid values
ALTER TABLE events
  ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'published', 'live', 'ended'));

-- Ensure the default is still 'draft'
ALTER TABLE events ALTER COLUMN status SET DEFAULT 'draft';
