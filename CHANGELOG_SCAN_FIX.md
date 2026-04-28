# Documentation: Group Entry & Multiple Scan Fix

## Problem
Invitations with a `party_size` greater than 1 could only be scanned once. This was due to:
1.  A `UNIQUE` constraint on `entry_logs.invitation_id` in the database.
2.  API logic that blocked any subsequent scans for the same invitation.
3.  Dashboard statistics that counted invitations/groups as the primary arrival metric instead of individual people.

## Changes

### 1. Database
- **Migration**: `supabase/migrations/002_allow_multiple_entries.sql`
- **Action**: Removed the `unique` constraint on `entry_logs.invitation_id`.
- **Reason**: Allows the database to store multiple entry records for the same invitation (one for each person in the party).

### 2. API Logic
- **File**: `app/api/scan/route.ts`
- **Action**: 
    - Replaced the single-entry check with a count check.
    - The API now counts existing logs for an invitation and compares it against the `party_size`.
    - Returns `enteredCount` to the frontend for better user feedback.
- **Error Handling**: Now returns "Party full — all members have already entered" when the limit is reached.

### 3. Scanner Frontend
- **File**: `components/scanner/ScannerClient.tsx`
- **Action**:
    - Added a **Quantity Selector** for group invitations.
    - When a group QR code is scanned, the usher can now select exactly how many people are entering (defaulting to all remaining members).
    - Updated UI to show "Admitted X people (Y of Z total)".
- **Reason**: Provides flexibility for groups arriving either together or separately.

### 4. Dashboard
- **File**: `app/(dashboard)/events/[id]/dashboard/page.tsx`
- **Action**:
    - Swapped the primary "Arrived" stat to show **People In** (Total individual entries).
    - Added "Groups Arrived" as subtext.
    - Updated the "Pending" list to show remaining seats in partially arrived groups.
    - Updated the "Recent Arrivals" list to show party context (e.g., "Part of 5").

## Verification Steps
1. Run the migration in `002_allow_multiple_entries.sql`.
2. Create a guest with a party size of 3.
3. Scan the QR code 3 times; each should succeed and show the progress (1/3, 2/3, 3/3).
4. The 4th scan will be denied.
5. Verify the dashboard shows "3 People In".
