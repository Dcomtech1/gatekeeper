-- Remove the unique constraint on invitation_id in entry_logs
-- to allow multiple people from the same party to be scanned separately.

ALTER TABLE public.entry_logs DROP CONSTRAINT IF EXISTS entry_logs_invitation_id_key;
