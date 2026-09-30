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

/**
 * Sends the booking somewhere. Out of the box there is no backend, so this
 * just pretends to (the demo still produces an .ics file).
 *
 * To make it real, set `VITE_BOOKING_ENDPOINT` to a URL that accepts a JSON
 * POST — a serverless function, Formspree, n8n, Zapier webhook… — and it will
 * receive the `Booking` object above.
 */
export async function submitBooking(booking: Booking): Promise<void> {
  const endpoint = import.meta.env.VITE_BOOKING_ENDPOINT as string | undefined;

  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  if (!response.ok) throw new Error(`Booking failed: ${response.status}`);
}
