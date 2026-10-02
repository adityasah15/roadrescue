# Deploying RoadRescue

Two ways to get a **live URL**:

- **[Option A — Render + Aiven](#option-a--render--aiven-free-live-url)** *(recommended, free)* — app on Render, MySQL on Aiven. No credit card. Works with the included `render.yaml`.
- **[Option B — VPS](#option-b--vps-rock-solid)** — a ~$5/mo server running `docker compose`. No cold starts, most reliable.
- **[Option C — Railway](#option-c--railway-one-dashboard)** — simplest single dashboard, but only a $5 trial credit.

The app builds from the included `Dockerfile`, is configured entirely by environment variables, and its frontend calls the API on the same origin — so **no code changes are needed** when the host changes.

---

## Option A — Render + Aiven (free live URL)

### 1. Create a free MySQL database (Aiven)

1. Sign up at <https://aiven.io> (no credit card).
2. **Create service → MySQL → Free plan**, pick the region closest to you, create it.
3. Open the service's **Connection information** and note:
   - **Host**, **Port**, **User** (usually `avnadmin`), **Password**, **Database** (usually `defaultdb`).
4. Download/allow access: Aiven is reachable from anywhere by default. If you restrict IPs, add `0.0.0.0/0` for the demo.

> Your `DB_URL` will look like:
> `jdbc:mysql://<host>:<port>/defaultdb?useSSL=false`

### 2. Deploy the app (Render)

1. Sign up at <https://render.com> with GitHub.
2. **New → Blueprint** → connect the repo `adityasah15/roadrescue`.
   Render reads `render.yaml` and creates the `roadrescue` web service.
   *(Alternatively: **New → Web Service → Docker** and point it at the repo.)*
3. When prompted for the secret variables, enter:

   | Key | Value |
   |---|---|
   | `DB_URL` | `jdbc:mysql://<aiven-host>:<port>/defaultdb?useSSL=false` |
   | `DB_USERNAME` | `avnadmin` (or your Aiven user) |
   | `DB_PASSWORD` | your Aiven password |
   | `ADMIN_EMAIL` | where admin alerts should go |
   | `RESEND_API_KEY` | *(optional; leave blank to skip email)* |

4. Deploy. First build takes a few minutes. When it's done, Render shows your URL:
   **`https://roadrescue-xxxx.onrender.com`** — that's your live app.

> Free web services sleep after ~15 min idle, so the first visit may take ~50 s.

### 3. Load the demo data (optional)

Set the env var **`SEED_DEMO_DATA=true`** on the Render service, then **Manual Deploy → Deploy latest image** (or restart). On boot the app sees an empty DB and loads:

- 15 customers, 12 shops, 22 requests
- Logins: see [db/CREDENTIALS.md](db/CREDENTIALS.md) (`admin/admin123`, `customer01..15/customer123`, `shop01..12/shop123`)

After it loads once, set `SEED_DEMO_DATA` back to `false` (it only runs on an empty DB anyway, so it's safe either way).

### 4. Keep it awake for free

Free Render services spin down. Point a free uptime monitor at your URL to keep it warm:

- <https://uptimerobot.com> or <https://cron-job.org>
- Monitor `https://roadrescue-xxxx.onrender.com/` every **10 minutes**.

That keeps the instance awake during your demo period at no cost.

---

## Option B — VPS (rock solid)

On any server with Docker + Docker Compose:

```bash
git clone https://github.com/adityasah15/roadrescue.git
cd roadrescue
cp .env.example .env          # edit DB_PASSWORD etc.
docker compose up -d --build
```

App runs at `http://<server-ip>:8082`. Data persists in the `mysql-data` volume.
For HTTPS and a domain, put Caddy or Nginx in front (e.g. Caddy auto-TLS in two lines).

To seed demo data on first boot:

```bash
SEED_DEMO_DATA=true docker compose up -d
```

---

## Option C — Railway (one dashboard)

1. <https://railway.app> → **New Project → Deploy from GitHub repo** → `adityasah15/roadrescue`.
2. **Add → Database → MySQL** (same project).
3. On the app service, set variables (Railway can reference the DB):
   `DB_URL=jdbc:mysql://<host>:<port>/railway?useSSL=false`, `DB_USERNAME`, `DB_PASSWORD`, `ADMIN_EMAIL`, and optionally `SEED_DEMO_DATA=true`.
4. **Settings → Networking → Generate Domain** for the public URL.

> Railway is a one-time **$5 trial** then ~$1/month; it can stop when credit runs out.

---

## Environment variables reference

| Variable | Required | Purpose |
|---|---|---|
| `DB_URL` | yes | JDBC URL, e.g. `jdbc:mysql://host:3306/dbname?useSSL=false` |
| `DB_USERNAME` | yes | MySQL user |
| `DB_PASSWORD` | yes | MySQL password |
| `ADMIN_EMAIL` | no | Recipient of admin alert emails |
| `RESEND_API_KEY` | no | Enables email; without it emails are skipped |
| `SEED_DEMO_DATA` | no | `true` loads demo data once, on an empty DB |
| `PORT` | no | Defaults to `8082`; hosts like Render inject it automatically |

## Notes

- The frontend calls the API on the same origin (`const API = ""`), so no CORS/URL changes are needed on any host.
- JWT secrets are generated on each boot — sessions reset on redeploy; users just log in again.
- Tables are created automatically on first boot (`spring.jpa.hibernate.ddl-auto=update`).
- The default admin (`admin` / `admin123`) is created automatically if it doesn't exist.
