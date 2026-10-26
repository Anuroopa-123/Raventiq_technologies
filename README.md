# Raventiq: Website

Angular 20 (frontend, 3D scroll journey with Three.js + `motion` for liquid-glass UI animation)
+ FastAPI (backend) + PostgreSQL (database).

**Public site:** Home / About / Services / Updates (posters) / Students / Contact. The contact
form is saved to PostgreSQL and sends an email to your team plus an auto-reply to the visitor.

**Accounts & roles:**
- **Student** -- registers at `/register` with a password, or "Sign in with Google". Free, self-serve.
- **Admin** -- can log in and add/edit/delete the posters shown in the Updates section. Admin
  accounts are *not* self-registered -- only the owner creates them.
- **Superadmin (the owner, i.e. you)** -- everything an admin can do, plus: sees every
  registration (name, email, phone, college, how they signed in), creates/deactivates/removes
  admin accounts, and sees every contact-form enquiry. One superadmin account is created
  automatically from `backend/.env` the first time the API starts.

```
raventiq/
  backend/    FastAPI app (app/main.py, app/routers/), tests, schema.sql, .env.example
  frontend/   Angular app (src/app/...), proxy.conf.json
  deploy/     nginx.conf example
```

## 1. Database
```bash
createdb raventiq            # or: psql -U postgres -c "CREATE DATABASE raventiq"
```
All tables (`contact_messages`, `users`, `posters`) are created automatically when the API
starts (`backend/schema.sql` is there only for reference).

## 2. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then fill in every value below
uvicorn app.main:app --reload --port 8000
```
Fill in `.env`:
- `DATABASE_URL`, `CORS_ORIGINS` -- as before.
- `JWT_SECRET` -- a random string that signs login sessions. Generate one with
  `python3 -c "import secrets; print(secrets.token_urlsafe(48))"` and set it to a fixed
  value, or everyone is logged out every time the server restarts.
- `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` / `SUPERADMIN_NAME` -- **your** login. Created
  automatically on first startup if no superadmin exists yet. Change the password after your
  first login (there's no "change password" page yet -- update it directly in the database,
  or ask for one to be added).
- `GOOGLE_CLIENT_ID` -- optional. See step 4 below. Leave blank to simply hide the Google
  button; email/password sign-in always works.
- SMTP values -- unchanged from before.

Other things to know:
- API docs: http://localhost:8000/docs · health: http://localhost:8000/api/health
- Tests: `pytest` (needs the database to exist; creates/drops rows in it)
- Uploaded poster images are written to `backend/uploads/posters/` and served at
  `/uploads/posters/<file>`. Back this folder up along with your database.
- View registrations from the shell: `psql raventiq -c "select name,email,role,created_at from users order by created_at desc"`

## 3. Frontend
```bash
cd frontend
npm install
npm start                   # http://localhost:4200  (/api and /uploads are proxied to FastAPI on :8000)
npm run build               # production files in dist/frontend/browser
```
Requires Node 20.19+ / 22.12+. `npm install` also pulls in the `motion` animation
library (UI motion only -- no effect on the backend).

**UI motion system**: dark, glass-panelled theme (`src/styles.scss` -- all one set of CSS
variables at the top, so colors are a one-file change) with a cyan "glow button" treatment
for primary CTAs. Section entrances (`appReveal`) and magnetic buttons (`appMagnetic`, a
cursor-pulled hover effect) are driven by the `motion` library in
`src/app/directives/reveal.ts` and `src/app/directives/magnetic.ts`, and there's a
scroll-progress bar (`src/app/shared/scroll-progress.ts`) under the floating nav. The
Services section (`src/app/pages/home.html`/`home.ts`, `pickService()`) is a numbered
switcher -- a vertical list of services on the left and one animated panel on the right,
sliding in with `motion` on each click, with a tilted "ghost" card behind it for depth.
All of it respects "reduce motion" OS settings and is skipped on touch devices where it
doesn't apply (magnetic pull).

**Change company details** (email, phone, WhatsApp, Instagram, founders, services) in
`frontend/src/app/site.config.ts` -- that file is also where `GOOGLE_CLIENT_ID` goes (step 4).
Colors are CSS variables at the top of `src/styles.scss`. Logo: `src/app/components/logo.ts`
(SVG); favicon: `public/favicon.svg`.

## 4. Turning on "Sign in with Google"
1. Go to https://console.cloud.google.com/apis/credentials (create a free project if you
   don't have one yet).
2. Create Credentials -> OAuth client ID -> Application type: **Web application**.
3. Under "Authorized JavaScript origins" add `http://localhost:4200` for testing, and your
   real domain (e.g. `https://www.raventiq.com`) once you deploy.
4. Copy the Client ID it gives you (looks like `123...-abc....apps.googleusercontent.com`)
   into **both**:
   - `backend/.env` as `GOOGLE_CLIENT_ID`
   - `frontend/src/app/site.config.ts` as `GOOGLE_CLIENT_ID`
5. Restart both servers. The "Sign in with Google" button appears automatically on the
   Login and Register pages.

Until you do this, the button is simply hidden -- nothing else is affected.

## 5. Using it day to day
- **You (owner):** log in at `/login` with your `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`.
  You land on `/superadmin`: stats, every registration, admin management, posters, and
  contact-form enquiries, all in tabs.
- **Creating an admin (e.g. for Dinesh):** on `/superadmin` -> Admins tab -> fill in name,
  email, password -> "+ Add admin". Share that email/password with them directly (there's no
  "forgot password" flow yet).
- **Admin posting a poster:** admin logs in at `/login`, lands on `/admin`, fills in the
  poster form (title, optional description/link, an image) and clicks "Publish poster". It
  appears in the website's **Updates** section (between Services and Students) immediately --
  no rebuild or redeploy needed. Un-ticking "Visible on the website" hides it without deleting it.
- **Students:** register at `/register` (or Google), nothing further required from you.

## 6. Deploy (simple VPS)
Serve `dist/frontend/browser` with nginx and proxy both `/api` **and** `/uploads` to uvicorn
(poster images are served by the backend too) -- see `deploy/nginx.conf`, which already has
both. Run uvicorn with `uvicorn app.main:app --host 127.0.0.1 --port 8000` under systemd, set
`CORS_ORIGINS` and the Google "Authorized JavaScript origins" to your real domain, and add
HTTPS with certbot. Back up `backend/uploads/` along with the database -- it holds the
poster images.

## 7. Hosting it for free

This app has three separate pieces to put somewhere: the **frontend** (static files), the
**backend** (a running FastAPI process) and the **database** (PostgreSQL). All three have
usable free tiers; none of them live on the same host, which is normal for an app like this.

**Recommended free stack:**

| Piece | Service | Why |
|---|---|---|
| Frontend | **Vercel** or **Netlify** | Free static hosting, auto HTTPS, a real `yourapp.vercel.app` URL (or your own domain), deploys straight from GitHub. |
| Database | **Neon** (neon.tech) | Free serverless Postgres, works with the `DATABASE_URL` this app already uses -- no code changes. |
| Backend | **Render** (render.com) | Free "Web Service" that runs `uvicorn`. It sleeps after 15 minutes of no traffic and takes ~30-50s to wake up on the next request -- fine for a small business site, not for heavy traffic. |

Steps:

1. **Push this project to GitHub** (one repo, `frontend/` and `backend/` as subfolders) --
   all three services deploy from a GitHub repo.
2. **Database (Neon):** sign up free, create a project, copy the connection string it gives
   you -- that's your `DATABASE_URL` (Neon's string already matches the
   `postgresql+psycopg://...` format this app expects; just confirm the `+psycopg` part is
   there, add it if not).
3. **Backend (Render):** New -> Web Service -> connect the repo -> Root Directory `backend`,
   Build Command `pip install -r requirements.txt`, Start Command
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Add the same environment variables as
   `backend/.env.example` (`DATABASE_URL` from Neon, `JWT_SECRET`, `SUPERADMIN_*`,
   `CORS_ORIGINS` set to your Vercel URL, SMTP values if you want contact-form emails).
   Render gives you a URL like `raventiq-api.onrender.com`.
4. **Frontend (Vercel):** New Project -> same repo -> Root Directory `frontend`, Build
   Command `npm run build`, Output Directory `dist/frontend/browser`. Before deploying,
   point the app at your live backend instead of `localhost:8000` -- the simplest way is to
   edit `frontend/proxy.conf.json`'s target, or (cleaner) add an environment-based API base
   URL; ask and this can be wired in. Also add a rewrite so `/api/*` and `/uploads/*` proxy
   to the Render URL (a `vercel.json` with `rewrites` -- ask and this can be generated for
   you too).
5. Update `CORS_ORIGINS` on Render to your real Vercel domain, and (if using Google
   Sign-In) add that same domain under "Authorized JavaScript origins" in step 4 above.

**Free-tier limits to know:** Render's free web service sleeps when idle (first visitor
after a quiet spell waits ~30s); Neon's free database pauses similarly and has a storage
cap generous enough for this app for a long time. For a always-awake small VPS instead
(a few dollars a month, no sleep delay), `deploy/nginx.conf` in this repo is already set up
for that path.

## Before launch checklist
- Replace placeholder email/phone/social links in `site.config.ts`.
- Set a real, fixed `JWT_SECRET` and a strong `SUPERADMIN_PASSWORD` in production.
- Set up Google Sign-In (step 4) if you want it, or leave it off -- password accounts work either way.
- Check your company name on the MCA name search, trademark registry and domain/Instagram.
- Add real photos/testimonials only when you have them (none are invented here).
