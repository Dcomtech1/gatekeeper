-- Migration: Enforce Entry Limits via Trigger to prevent race conditions
-- This ensures that even if two scanners scan the same QR code at the exact same millisecond,
-- the database will enforce the party_size limit.

CREATE OR REPLACE FUNCTION check_entry_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_party_size INT;
  v_current_count INT;
BEGIN
  -- Lock the invitation row so concurrent inserts for the same invitation are serialized.
  -- This forces concurrent transactions to wait in line rather than reading '0' simultaneously.
  SELECT party_size INTO v_party_size
  FROM invitations
  WHERE id = NEW.invitation_id
  FOR UPDATE;

  -- Count existing entries for this invitation
  SELECT count(*) INTO v_current_count
  FROM entry_logs
  WHERE invitation_id = NEW.invitation_id;

  -- If the limit is already reached, abort the insert
  IF v_current_count >= COALESCE(v_party_size, 1) THEN
    RAISE EXCEPTION 'Party limit reached';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists to allow safe re-running
DROP TRIGGER IF EXISTS enforce_entry_limit ON entry_logs;

-- Attach the trigger to run before every insert into entry_logs
CREATE TRIGGER enforce_entry_limit
  BEFORE INSERT ON entry_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_entry_limit();
