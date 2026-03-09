# Legal Leads Group – Client Portal

A modern client portal for Legal Leads Group SEO clients. Built with React + Vite, backed by Supabase for auth and data.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

The app opens at `http://localhost:3000`. Click **"View Demo Dashboard"** on the login page to explore with sample data — no Supabase setup required for demo mode.

## Project Structure

```
llg-portal/
├── index.html                  # Entry HTML
├── package.json
├── vite.config.js
├── .env.example                # Supabase credentials template
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                # React mount point
│   ├── App.jsx                 # Auth + routing (hash-based)
│   ├── Layout.jsx              # Shared nav shell (top + bottom mobile)
│   ├── login.jsx               # Magic link login page
│   ├── dashboard.jsx           # Dashboard overview
│   ├── seo-plan.jsx            # SEO Plan detail page
│   ├── SupportTickets.jsx      # Support & Tickets page
│   ├── TeamPage.jsx            # Team profiles page
│   ├── supabaseClient.js       # Lightweight Supabase client
│   └── usePortalData.js        # React data hooks (with demo fallback)
└── supabase/
    └── schema.sql              # Database tables + RLS policies + seed data
```

## Pages

| Route              | Page                | Description                                      |
|--------------------|---------------------|--------------------------------------------------|
| `#/overview`       | Dashboard           | SEO progress, tickets, lighthouse scores, team   |
| `#/support-tickets`| Support & Tickets   | Full ticket management with create modal         |
| `#/seo-plan`       | SEO Plan            | Expandable deliverables with filters             |
| `#/team`           | Team                | Team member cards with roles and specialties     |
| `#/integrations`   | Integrations        | Placeholder (coming soon)                        |
| `#/profile`        | Profile             | User info + sign out                             |

## Connecting Supabase

### 1. Create a `.env` file

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=https://eifrudtwwojllvwzzryo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...your_key
```

### 2. Run the database schema

Open your Supabase dashboard → **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.

This creates all tables with Row Level Security so each client can only see their own data:

- `clients` – firm profiles linked to auth users
- `seo_progress` + `seo_progress_subs` – SEO plan category progress
- `seo_deliverables` – individual deliverable items
- `lighthouse_scores` – NAP Lighthouse audit scores
- `tickets` – support tickets (clients can create + read)
- `team_members` – assigned support team
- `updates` – activity feed
- `integrations` – third-party tool links

### 3. Enable Magic Link auth

In Supabase → **Authentication** → **Providers** → make sure **Email** is enabled with **"Enable Magic Link"** toggled on.

Set the **Site URL** in **Authentication** → **URL Configuration** to your portal domain (e.g. `http://localhost:3000` for dev).

### 4. Seed your first client

Uncomment the seed data block at the bottom of `schema.sql`, replace `AUTH_USER_UUID_HERE` with the user's UUID (found in **Authentication** → **Users** after their first login), and run it.

## Building for Production

```bash
npm run build
```

Outputs to `dist/`. Deploy to Vercel, Netlify, or any static host. Make sure to set the environment variables on your hosting platform.

## Tech Stack

- **React 19** – UI framework
- **Vite 6** – Dev server + bundler
- **Supabase** – Auth (magic link) + PostgreSQL + Row Level Security
- **Custom Supabase client** – No SDK dependency; can be swapped for `@supabase/supabase-js` if preferred
- **DM Serif Display + DM Sans** – Typography (loaded via Google Fonts)
- **Hash-based routing** – No router dependency; works on any static host
