import { useMemo } from 'react';
import type { Config } from '../config';
import type { Availability, Now, SlotStatus } from '../lib/availability';
import {
  formatHour,
  formatLongDate,
  formatMonthDay,
  formatRange,
  formatWeekday,
  type Locale,
  type Strings,
} from '../lib/i18n';
import type { YMD } from '../lib/time';

interface Props {
  date: YMD;
  now: Now;
  config: Config;
  availability: Availability;
  locale: Locale;
  t: Strings;
  selected: number | null;
  hover: number | null;
  onHover: (minutes: number | null) => void;
  onSelect: (minutes: number) => void;
  onClose: () => void;
}

export function DayTimeline({ date, now, config, availability, locale, t, selected, hover, onHover, onSelect, onClose }: Props) {
  const { startMinutes, endMinutes, stepMinutes } = config.timeline;
  const duration = config.meeting.durationMinutes;
  const span = endMinutes - startMinutes;

  const rows = useMemo(() => {
    const out: Array<{ start: number; status: SlotStatus }> = [];
    for (let m = startMinutes; m < endMinutes; m += stepMinutes) {
      out.push({ start: m, status: availability.status(date, m, now) });
    }
    return out;
  }, [availability, date, now, startMinutes, endMinutes, stepMinutes]);

  const busy = useMemo(
    () => availability.busy(date).filter((b) => b.end > startMinutes && b.start < endMinutes),
    [availability, date, startMinutes, endMinutes],
  );

  const freeCount = rows.filter((r) => r.status === 'free').length;
  const top = (m: number) => `${((m - startMinutes) / span) * 100}%`;
  const height = (m: number) => `${(m / span) * 100}%`;

  const hovered = hover === null ? null : rows.find((r) => r.start === hover) ?? null;

  return (
    <section className="timeline" aria-label={formatLongDate(date, locale)}>
      <header className="timeline-head">
        <div>
          <span className="eyebrow">{formatWeekday(date, locale)}</span>
          <h2>{formatMonthDay(date, locale)}</h2>
          <p aria-live="polite">{freeCount ? t.timesAvailable(freeCount) : t.noTimes}</p>
        </div>
        <button type="button" className="icon-btn" aria-label={t.closeDay} onClick={onClose}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="m1 1 8 8M9 1 1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="track" onPointerLeave={() => onHover(null)}>
        <div className="track-inner">
          <div className="rows" role="listbox" aria-label={t.pickTime}>
            {rows.map(({ start, status }) => {
              const onHour = start % 60 === 0;
              return (
                <button
                  key={start}
                  type="button"
                  role="option"
                  className={`row ${status}${onHour ? ' hour' : ''}`}
                  aria-selected={selected === start}
                  aria-disabled={status !== 'free'}
                  aria-label={`${formatRange(start, start + duration, locale)}${status === 'busy' ? `, ${t.busy}` : ''}`}
                  tabIndex={status === 'free' ? 0 : -1}
                  onPointerEnter={() => onHover(start)}
                  onFocus={() => onHover(start)}
                  onBlur={() => onHover(null)}
                  onClick={() => status === 'free' && onSelect(start)}
                >
                  {onHour && <span className="hour-label">{formatHour(start, locale)}</span>}
                </button>
              );
            })}
            <span className="hour-label end">{formatHour(endMinutes, locale)}</span>
          </div>

          <div className="overlays" aria-hidden="true">
            {busy.map((b) => {
              const start = Math.max(b.start, startMinutes);
              const end = Math.min(b.end, endMinutes);
              return (
                <div key={b.start} className="busy-block" style={{ top: top(start), height: height(end - start) }}>
                  {end - start >= 60 && <span>{t.busy}</span>}
                </div>
              );
            })}

            {hovered && hovered.start !== selected && (
              <div className={`pill hover ${hovered.status}`} style={{ top: top(hovered.start), height: height(duration) }}>
                <span>
                  {hovered.status === 'free'
                    ? formatRange(hovered.start, hovered.start + duration, locale)
                    : hovered.status === 'busy'
                      ? t.busy
                      : t.unavailable}
                </span>
              </div>
            )}

            {selected !== null && (
              <div className="pill selected" style={{ top: top(selected), height: height(duration) }}>
                <span>{formatRange(selected, selected + duration, locale)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
