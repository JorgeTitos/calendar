# Security policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Use GitHub's private
reporting instead: the **Security** tab → **Report a vulnerability**. You'll get a
reply as soon as possible, and credit in the fix if you'd like it.

## What this project does and doesn't do

- It is a **static front-end**. There is no server, no database, no accounts and no cookies.
- It makes **no network requests** other than an optional `POST` of the booking to the URL
  you set in `VITE_BOOKING_ENDPOINT`. No analytics, no trackers, no third-party fonts or CDNs.
- The production build ships a strict Content-Security-Policy (see `vite.config.ts`).

## If you deploy it

- Everything in `VITE_*` variables is **compiled into the public JavaScript**. Never put a
  secret or API key there. The booking endpoint URL is public by design.
- Validate and rate-limit on the receiving end. Client-side checks (length limits, email format)
  are for convenience, not protection.
- The demo's "busy" times are fake. Wire up a real availability source before relying on it.
