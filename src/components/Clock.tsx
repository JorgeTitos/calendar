import { formatClock, formatLongDate, type Locale } from '../lib/i18n';
import type { YMD } from '../lib/time';

interface Props {
  date: YMD;
  minutes: number;
  locale: Locale;
}

export function Clock({ date, minutes, locale }: Props) {
  return (
    <div className="clock" role="timer" aria-live="off">
      <div className="clock-date">{formatLongDate(date, locale)}</div>
      <div className="clock-time">{formatClock(minutes, locale)}</div>
      <div className="clock-place">
        <span className="dot" aria-hidden="true" />
        Madrid
      </div>
    </div>
  );
}
