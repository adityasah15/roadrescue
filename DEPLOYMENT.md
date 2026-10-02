# Deploying RoadRescue

The easiest path is Docker — the app builds with the included `Dockerfile`.
Because the frontend calls the API on the same origin, the same image works in every environment.

## Option A — One VPS (simplest, everything in one command)

On any server with Docker + Docker Compose installed:

```bash
git clone <your-repo-url> && cd RoadRescue
cp .env.example .env        # edit passwords
docker compose up -d --build
```

App runs at `http://<server-ip>:8082`. Data persists in the `mysql-data` volume.

## Option B — Render (free tier)

1. Push the repo to GitHub.
2. Render → **New → Web Service** → connect the repo → **Docker** runtime.
3. Set environment variables:

   | Key | Value |
   |---|---|
   | `DB_URL` | `jdbc:mysql://<host>:3306/RoadRescueDB` |
   | `DB_USERNAME` | your MySQL user |
   | `DB_PASSWORD` | your MySQL password |
   | `ADMIN_EMAIL` | where admin alert emails are sent |
   | `RESEND_API_KEY` | your Resend key (optional) |
   | `PORT` | `8082` (or Render's assigned port) |

4. For the database, use any hosted MySQL (Clever Cloud, Aiven, Railway MySQL, etc.) and whitelist Render's IPs (or use `0.0.0.0/0` for a demo).

## Option C — Railway (app + MySQL in one dashboard)

1. New Project → **Deploy from GitHub repo** (Railway auto-detects the Dockerfile).
2. Add a **MySQL** service from the "Add Resource" menu.
3. Set the app's variables: `DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:... ` — or copy the MySQL connection URL from Railway's variables and add `?useSSL=false` as needed. Also set `ADMIN_EMAIL`.
4. Generate a public domain for the app service.

## Notes

- Frontend pages call the API on the same origin (`const API = ""`), so no CORS/URL changes are needed when the host changes.
- JWT secrets are generated on each boot — sessions reset on redeploy; users just log in again.
- Email notifications use [Resend](https://resend.com) (`RESEND_API_KEY`). Without a valid key the app still works; emails are skipped with a log message.
- Admin alert emails go to `ADMIN_EMAIL` (no address is hardcoded in the source).
