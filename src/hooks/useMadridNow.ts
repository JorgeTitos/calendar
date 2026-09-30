import { useEffect, useState } from 'react';
import { madridNow } from '../lib/time';

/** The live Madrid date and time, refreshed every few seconds. */
export function useMadridNow(intervalMs = 5000) {
  const [now, setNow] = useState(() => madridNow());
  useEffect(() => {
    const id = setInterval(() => setNow(madridNow()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
