export interface Booking {
  /** YYYY-MM-DD in Madrid time. */
  date: string;
  /** Minutes since midnight, Madrid time. */
  start: number;
  durationMinutes: number;
  name: string;
  email: string;
  notes: string;
  timeZone: string;
}

/** Upper bounds for free text, enforced both in the form and before sending. */
export const LIMITS = { name: 100, email: 254, notes: 2000 } as const;

const TIMEOUT_MS = 10_000;

/**
 * Validates `VITE_BOOKING_ENDPOINT`. It must be https (plain http is allowed only
 * for localhost while developing) so guests' details never travel in the clear.
 * Returns `null` when unset (demo mode).
 */
export function resolveEndpoint(raw: string | undefined): string | null {
  if (!raw) return null;
  const url = new URL(raw); // throws on garbage
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
    throw new Error('VITE_BOOKING_ENDPOINT must use https');
  }
  return url.toString();
}

/**
 * Sends the booking somewhere. Out of the box there is no backend, so this
 * just pretends to (the demo still produces an .ics file).
 *
 * To make it real, set `VITE_BOOKING_ENDPOINT` to a URL that accepts a JSON
 * POST (a serverless function, Formspree, an n8n or Zapier webhook…). It
 * receives the `Booking` object above.
 *
 * Remember that everything in this app runs in the visitor's browser: the
 * endpoint URL is public, so never put a secret in it, and validate and
 * rate-limit on the receiving side.
 */
export async function submitBooking(booking: Booking): Promise<void> {
  const endpoint = resolveEndpoint(import.meta.env.VITE_BOOKING_ENDPOINT as string | undefined);

  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return;
  }

  const safe: Booking = {
    ...booking,
    name: booking.name.slice(0, LIMITS.name),
    email: booking.email.slice(0, LIMITS.email),
    notes: booking.notes.slice(0, LIMITS.notes),
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(safe),
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Booking failed: ${response.status}`);
}
