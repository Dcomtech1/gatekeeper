# Documentation: Events Dashboard Enhancements & Refactor

## Summary
This update focuses on improving the usability, performance, and maintainability of the main Events Dashboard (Control Panel). It introduces advanced filtering, a real-time search system, and a complete architectural refactor into modular components.

## Changes

### 1. Architectural Refactor (Modularity)
- **Files**: 
    - `app/(dashboard)/events/events-dashboard.tsx` (Orchestrator)
    - `app/(dashboard)/events/hooks/use-dashboard-data.ts` (Logic/Data Hook)
    - `app/(dashboard)/events/components/events-header.tsx` (Header/Search)
    - `app/(dashboard)/events/components/control-bar.tsx` (Filters/Sort)
    - `app/(dashboard)/events/components/stats-panel.tsx` (Live Metrics)
- **Action**: Broke down a monolithic 470+ line file into focused, reusable modules.
- **Reason**: Improves developer experience, reduces bug surface area, and makes the dashboard logic easier to test.

### 2. Custom Hook: `useDashboardData`
- **Action**: Encapsulated all Supabase subscriptions, polling logic, and complex stat calculations (aggregating guest counts, logs, and capacity across multiple events).
- **Benefit**: Keeps the UI components "dumb" and focused only on rendering, while the hook manages the "brain" of the dashboard.

### 3. Expandable Search System
- **Action**: Implemented a real-time search bar that filters the manifest by **Event Name** or **Venue**.
- **UI/UX**: 
    - Minimalist icon-first design that expands into a full input on click.
    - Auto-collapses on blur if empty to save vertical space.
    - Optimized for mobile (full-width expansion).

### 4. Advanced Filtering & Sorting
- **Status Filtering**: Added dedicated toggles for `ALL`, `ACTIVE` (Live), `CLOSED` (Ended), `DRAFT`, and `PUBLISHED`.
- **Sorting**: Added a sorting engine with three modes:
    1.  **LAST_INTERACTED** (Default): Uses `updated_at` to keep active projects at the top.
    2.  **DATE_CREATED**: Chronological order.
    3.  **NAME_A_Z**: Alphabetical order.

### 5. Live Feed Metrics Update
- **Logic**: Updated the global "LIVE_FEED" panel (Total Guests, Checked In, Remaining) to **only aggregate data from events currently in the `live` state**.
- **Reason**: Prevents "Draft" or "Ended" events from polluting real-time metrics during active gate operations.

### 6. Stability & Hydration Fixes
- **Hydration Fix**: Resolved a `Hydration failed` error in `EventCard` by replacing `Math.random()` with a deterministic manifest number generator based on the event's name.
- **Import Fix**: Resolved a `500 ReferenceError` by correctly importing the `cn` (class variance authority) utility from `@/lib/utils`.
- **Utility Correction**: Fixed non-standard Tailwind v4 class names (e.g., `min-w-45` → `min-w-[180px]`) for cross-browser consistency.

## Verification Steps
1. **Refactor**: Ensure the dashboard loads and displays all initial events from the server.
2. **Search**: Type a venue name (e.g., "Grand Hall") into the search bar; verify the list filters instantly.
3. **Filtering**: Click "DRAFT"; verify only draft events appear. Combine with Search to ensure both work together.
4. **Sorting**: Change sort to "NAME_A_Z"; verify alphabetical order.
5. **Live Feed**: Change a "Published" event to "Live"; verify the right-hand stats panel immediately updates to include that event's capacity and guest count.
6. **Hydration**: Refresh the page and check the browser console; verify no "Hydration Mismatch" warnings appear.
