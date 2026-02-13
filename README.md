# Nova Post Analytics

Analytics dashboard for Nova Post API built with Next.js, better-auth, and shadcn/ui.

## Tech Stack

- **Next.js 16** — App Router, Server Components, API Routes
- **better-auth** — Authentication (email/password)
- **Neon Postgres** — Serverless database (via `@neondatabase/serverless`)
- **shadcn/ui** — UI components (dashboard-01 block)
- **Feature-Sliced Design** — Project architecture
- **TypeScript** — Full type safety

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd nova-post-analytics
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `NOVA_POST_API_URL` | Nova Post API URL (`https://api.novapost.com/v.1.0`) |
| `BETTER_AUTH_SECRET` | Random 32+ char secret for auth sessions |
| `BETTER_AUTH_URL` | App URL (`http://localhost:3000` for dev) |

### 3. Initialize the database

The database tables are auto-created by `better-auth` on first run. Just start the dev server:

```bash
npm run dev
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000), register, and enter your Nova Post API key.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add -A && git commit -m "ready for deploy"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import project on Vercel

Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.

### 3. Add Neon Postgres

In Vercel Dashboard: **Storage** → **Neon** → Create database. This auto-sets `DATABASE_URL`.

### 4. Set environment variables

In Vercel → Settings → Environment Variables, add:

- `BETTER_AUTH_SECRET` — random 32-char string
- `BETTER_AUTH_URL` — your production URL (e.g., `https://your-app.vercel.app`)
- `NOVA_POST_API_URL` — `https://api.novapost.com/v.1.0`

### 5. Deploy

Vercel auto-deploys on push. Tables are auto-created on first request.

## Project Structure (FSD)

```
src/
  app/            — Next.js pages & API routes
  entities/       — Business entities (shipment, division, etc.)
  features/       — User-facing features (settings, auth)
  shared/         — Shared lib, UI components, API clients
  widgets/        — Composite UI blocks (charts, tables, sidebar)
```
