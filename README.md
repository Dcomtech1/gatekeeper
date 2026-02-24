# GateKeep — Event Access Management

> Every seat accounted for. Every event under control.

GateKeep is a web application that solves the problem of uninvited guests at events by issuing QR-coded entry cards that are scanned at the entrance. It works for any event type — weddings, conferences, birthday parties, church programs, and more.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables

Open `.env.local` and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Settings → API → service_role
```

### 3. Set up the database

1. Go to **Supabase Dashboard → SQL Editor → New Query**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### Organizer
1. Create an account and log in
2. Create an event (name, date, venue, capacity)
3. Add guests — set each guest's name, party size (how many people they can bring), and seat assignment
4. Go to **Entry Cards** → Print all QR-coded cards
5. Go to **Scanner Links** → Create a link for each gate/usher, share via WhatsApp
6. On event day, open **Live Dashboard** to watch arrivals in real time

### Usher
1. Open the scanner link sent by the organizer (no login needed)
2. Tap "Start Scanning"
3. Point camera at the guest's QR card
4. System shows: guest name, party size, seat assignment — green for allowed, yellow for already entered, red for denied

### Guest
1. Receives a printed entry card with their name, QR code, seat, and how many people they can bring
2. Presents the card at the entrance

---

## Project Structure

```
gatekeeper/
├── app/
│   ├── (auth)/              # Login + Signup pages
│   ├── (dashboard)/         # Organizer portal (protected)
│   │   └── events/
│   │       ├── page.tsx           # Events list
│   │       ├── new/               # Create event
│   │       └── [id]/
│   │           ├── page.tsx       # Event overview + edit
│   │           ├── guests/        # Guest list management
│   │           ├── cards/         # QR code card generation
│   │           ├── scanner-links/ # Usher link management
│   │           └── dashboard/     # Live attendance
│   ├── scan/[token]/        # Usher scanner (public, no login)
│   ├── api/scan/            # Scan processing API route
│   └── actions/             # Server actions (auth, events, guests)
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── scanner/             # QR scanner client component
├── lib/
│   ├── supabase/            # Supabase clients (browser, server, admin)
│   └── types.ts             # TypeScript interfaces
└── supabase/
    └── migrations/          # Database schema SQL
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database + Auth | Supabase (PostgreSQL) |
| Styling | Tailwind CSS + shadcn/ui |
| QR Generation | qrcode (npm) |
| QR Scanning | html5-qrcode (camera, browser-based) |
| Hosting | Vercel (recommended) |

---

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the full schema.

**Tables:**
- `events` — event details, owned by an organizer
- `guests` — guest records per event
- `invitations` — one per guest; the invitation ID is the QR code value
- `scanner_links` — shareable usher links with unique tokens
- `entry_logs` — written on each successful scan; unique per invitation

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Add the three environment variables in Vercel dashboard
4. Deploy

---

## Security Notes

- QR codes encode a UUID — not guessable or forgeable
- Each QR code can only be scanned once (unique constraint on `entry_logs`)
- Scanner links can be deactivated instantly by the organizer
- The `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the browser — only used in the `/api/scan` server route
- Row Level Security (RLS) ensures organizers can only access their own events
