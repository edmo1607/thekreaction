# The K Reaction — website + dashboard

Lead-focused website for **The K Reaction** (Miami video studio) and an admin dashboard to manage projects, categories and leads.

- **Website** (`/`) — one page built to turn visitors into quote requests: quick-quote picker in the hero, Services menu + "What we film" section (Nightlife, Festivals, Live sets, Podcasts, Interior design, Brands), filterable work grid with video previews, pricing, FAQ and a short quote form that saves leads (or falls back to WhatsApp).
- **Dashboard** (`/admin`) — **Pricing**: create, edit, reorder and hide the packages shown on the site. **Projects**: upload a cover image and a video (or paste a YouTube/Instagram/Vimeo link), write the description, add the song used, pick categories, feature on the homepage, publish. Leads inbox with status tracking. Category manager.

Stack: React + TypeScript + Vite, React Router, Supabase (Postgres, Auth, Storage). Deploys as static files to HostGator via GitHub Actions.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the Supabase keys (optional — see below)
npm run dev                  # http://localhost:5173
```

Without Supabase keys the site still works: it shows built-in sample projects, and the quote form opens WhatsApp with the request pre-written. The dashboard needs Supabase.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint with oxlint |

## Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. **SQL Editor → New query** → paste all of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates the tables, security rules, the public `media` storage bucket and the default categories.
3. **Authentication → Users → Add user** with the email and password you'll use for the dashboard.
4. Back in the SQL Editor, make that user an admin:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@thekreaction.com';
   ```
5. **Project Settings → API**: copy the **Project URL** and the **anon public** key into `.env.local` (and into GitHub secrets, below).
6. Recommended: **Authentication → Sign In / Providers → Email** → turn off "Allow new users to sign up", so only accounts you create can log in.

**Upgrading an existing project:** run any new files in [`supabase/migrations/`](supabase/migrations) in the SQL Editor (e.g. `002_packages.sql` adds dashboard-managed pricing). `schema.sql` already includes them for fresh setups.

Security model: visitors can read published projects and categories and can only *insert* leads. Everything else (drafts, uploads, leads inbox) requires a signed-in user listed in `admins`. The anon key is safe to ship in the browser.

## Deploy to HostGator

The workflow in `.github/workflows/ci-deploy.yml` lints and builds every PR and push. On pushes to `main` it can also upload `dist/` to HostGator over FTPS.

In GitHub → **Settings → Secrets and variables → Actions**:

**Secrets**

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `FTP_SERVER` | FTP hostname from cPanel (e.g. `ftp.thekreaction.com`) |
| `FTP_USERNAME` | cPanel FTP account |
| `FTP_PASSWORD` | its password |
| `FTP_SERVER_DIR` | optional — folder for the site, default `./public_html/` (use the addon-domain folder if thekreaction.com isn't the primary domain, e.g. `./thekreaction.com/`) |

**Variables**

| Name | Value |
| --- | --- |
| `DEPLOY_ENABLED` | `true` — switches the deploy job on |
| `VITE_SHOWREEL_URL` | optional — mp4 URL (e.g. uploaded to the Supabase `media` bucket) or a YouTube embed URL for the hero showreel |

`public/.htaccess` is shipped with the build: it forces HTTPS and routes `/admin` and other paths to the app. Old Framer URLs (`/projects`, `/pricing`, `/contact`) redirect to the matching section.

> Tip: if the FTPS step fails with a certificate error, use the hostname that matches HostGator's certificate (shown in cPanel → FTP Accounts → Configure FTP Client) rather than your own domain or an IP.

## Editing content

| What | Where |
| --- | --- |
| Projects, videos, categories, **packages & prices** | Dashboard → `/admin` |
| Services, FAQ, testimonials, partners, contact info | `src/content/site.ts` |
| Colors, fonts, spacing | CSS variables at the top of `src/styles/global.css` |

## Project structure

```
src/
  content/site.ts        # all marketing copy and prices
  lib/                   # Supabase client, data access, types
  components/home/       # website sections
  components/admin/      # dashboard pieces (upload drop zone)
  pages/Home.tsx         # the website
  pages/admin/           # dashboard: login, projects, leads, categories
supabase/schema.sql      # database, security rules, storage, seed data
```
