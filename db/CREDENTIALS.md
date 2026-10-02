# RoadRescue — Sample Data & Login Credentials

Load the sample data into a running MySQL (Docker setup shown):

```bash
docker exec -i roadrescue-mysql mysql -uroot -proadrescue123 RoadRescueDB < db/seed.sql
```

Re-generate the SQL (edits `db/generate_seed.py`) with:

```bash
python3 db/generate_seed.py
```

## What gets seeded

| Table | Rows |
|---|---|
| `app_user` (ADMIN + CUSTOMER) | 16 (1 admin + 15 customers) |
| `shop` (SHOP_OWNER) | 12 |
| `service_request` | 22 (7 Pending, 5 Accepted, 10 Completed) |

The `seed.sql` file clears existing customers/shops/requests before inserting, so it is safe to re-run.

---

## Admin

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |

Admin can see **all** requests, manage shops, view analytics, and download PDF reports.

## Customers (all share the password `customer123`)

| Username | Password |
|---|---|
| customer01 | customer123 |
| customer02 | customer123 |
| customer03 | customer123 |
| customer04 | customer123 |
| customer05 | customer123 |
| customer06 | customer123 |
| customer07 | customer123 |
| customer08 | customer123 |
| customer09 | customer123 |
| customer10 | customer123 |
| customer11 | customer123 |
| customer12 | customer123 |
| customer13 | customer123 |
| customer14 | customer123 |
| customer15 | customer123 |

Each customer sees only the requests whose `customerName` matches their username.

## Shop owners (all share the password `shop123`)

| Username | Password | Shop | Owner | Area |
|---|---|---|---|---|
| shop01 | shop123 | Shree Auto Works | Ramesh Patil | Shivajinagar |
| shop02 | shop123 | Highway Motors | Sunil Deshmukh | Wakad |
| shop03 | shop123 | SpeedFix Garage | Imran Shaikh | Kothrud |
| shop04 | shop123 | Auto Care Center | Vijay More | Hadapsar |
| shop05 | shop123 | RoadStar Mechanics | Anil Jadhav | Baner |
| shop06 | shop123 | PitStop Auto Repairs | Sachin Kulkarni | Katraj |
| shop07 | shop123 | Highway Rescue Point | Farhan Khan | Chinchwad |
| shop08 | shop123 | Premier Auto Service | Ganesh Shinde | Aundh |
| shop09 | shop123 | City Wheel Care | Rahul Gaikwad | Viman Nagar |
| shop10 | shop123 | Trust Motors | Amit Pawar | Magarpatta |
| shop11 | shop123 | Express Breakdown Co | Nilesh Sawant | Pimpri |
| shop12 | shop123 | Roadside Heroes | Suresh Chavan | Nigdi |

All sample shops are open 24×7 and are spread across Pune, so a new request from the
customer dashboard gets auto-assigned to the nearest open shop.

---

## Notes

- Passwords are stored as **BCrypt hashes** (prefix `$2a$`). The app's startup routine
  only re-hashes passwords that are *not* already `$2a$`, so these hashes stay valid across restarts.
- Email notifications are skipped unless a valid `RESEND_API_KEY` is configured — the
  app still works fully without it.
- Shop API responses never include the password (it is stripped before returning).
