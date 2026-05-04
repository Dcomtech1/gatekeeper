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

---

# Event Status Lifecycle, Scanner Blocking & Real-Time Updates

## Changes

### 5. Database — 4-State Status Lifecycle
- **Migration**: `supabase/migrations/003_event_status_lifecycle.sql`
- **Action**:
    - Extended the `events.status` column from 3 states to 4 states.
    - Old: `draft | active | ended`
    - New: `draft | published | live | ended`
    - Migrates all existing `'active'` rows to `'live'`.
    - Updates the `CHECK` constraint to allow all 4 values.
- **Reason**: Separates "event is set up / guest list ready" (`published`) from "scanning is open for ushers" (`live`). New events always start as `draft` — nothing goes live automatically.

### 6. Types
- **File**: `lib/types.ts`
- **Action**: Updated `EventStatus` union to `'draft' | 'published' | 'live' | 'ended'`.

### 7. Event Creation — Always Starts as Draft
- **File**: `app/(dashboard)/events/new/page.tsx`
- **Action**: Added a visible lifecycle hint in the creation form.
- **Behavior**: New events are always created as `draft` (DB default). No status field is set during creation. The organizer manually promotes the event through `published → live → ended`.

### 8. Status Labels — Distinct Visual States
- **Files**:
    - `app/(dashboard)/events/[id]/layout.tsx` — Event header status badge
    - `app/(dashboard)/events/[id]/page.tsx` — Overview + edit form
    - `app/(dashboard)/events/events-dashboard.tsx` — EventCard badges
- **Status Display**:
    - `draft` → `DRAFT` (grey, muted)
    - `published` → `PUBLISHED` (yellow/pending)
    - `live` → `● LIVE` (green, animated blinking dot)
    - `ended` → `ENDED` (red)
- **Edit form**: Status dropdown now shows descriptive labels per option explaining what each status means.

### 9. Scanner Links — Blocked When Event Not Live
- **Files**:
    - `app/scan/[token]/page.tsx`
    - `app/api/scan/route.ts`
- **Action**:
    - Scanner page now checks `event.status` server-side before rendering the scanner UI.
    - `draft` or `published` → full-screen "Not Yet Open" branded page (standby mode).
    - `ended` → full-screen "Event Has Ended" branded page.
    - `live` only → scanner loads normally.
    - The API (`/api/scan`) also performs the same check as defence-in-depth (returns `403` for non-live events).
- **Reason**: Scanner links should have no effect until the organizer explicitly sets the event to `live`, and should stop working once the event is `ended`.

### 10. Auto-Refresh & Real-Time Updates
- **Files**:
    - `app/(dashboard)/events/[id]/page.tsx`
    - `app/(dashboard)/events/[id]/guests/page.tsx`
    - `app/(dashboard)/events/[id]/scanner-links/page.tsx`
    - `app/(dashboard)/events/events-dashboard.tsx`
- **Action**: Added Supabase real-time subscriptions to all client pages that previously loaded data only once on mount.
    - **Event Overview**: Subscribes to `events` table for this event ID — status changes reflect instantly.
    - **Guests**: Subscribes to `guests` and `invitations` tables — guest list updates across tabs/devices.
    - **Scanner Links**: Subscribes to `scanner_links` table — toggle/delete actions reflect immediately.
    - **Events Dashboard**: Added `events` table subscription — status changes update cards live.

### 11. Dashboard Query Bug Fix
- **File**: `app/(dashboard)/events/[id]/dashboard/page.tsx`
- **Action**: Removed `.eq('status', 'pending')` filter from the invitations query.
- **Bug**: The old filter excluded fully-entered guests from the invitation ID list, so their entry logs couldn't be fetched. This caused guests who had fully arrived to disappear from the "People In" count and "Recent Arrivals" list.

## Verification Steps
1. Run the migration in `003_event_status_lifecycle.sql` against your Supabase project.
2. **Status lifecycle**: Create an event → confirm `DRAFT` badge. Edit → set `Published` → badge shows `PUBLISHED`. Set `Live` → badge shows `● LIVE` with blink. Set `Ended` → badge shows `ENDED`.
3. **Scanner blocking**: With event in `draft`/`published`, open a scanner link → "Not Yet Open" page. Set event to `live` → scanner loads. Set to `ended` → "Event Ended" page.
4. **Real-time**: Open Guests page in two browser tabs; add a guest in one → the other updates without refresh.
5. **Dashboard**: Open Live Dashboard; scan a QR code → stats update within seconds.
6. **Dashboard bug fix**: Fully admit all members of a group (party size > 1) → they still appear in the "People In" count and "Recent Arrivals" feed.
