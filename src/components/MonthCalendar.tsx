import { useMemo } from 'react';
import { buildMonth } from '../lib/calendar';
import { formatMonthTitle, weekdayHeaders, weekStartsOn, type Locale, type Strings } from '../lib/i18n';
import { dateKey, type YMD } from '../lib/time';

interface Props {
  year: number;
  month: number;
  locale: Locale;
  t: Strings;
  selected: YMD | null;
  isOpen: (date: YMD) => boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onMonthChange: (delta: number) => void;
  onSelect: (date: YMD) => void;
}

export function MonthCalendar(props: Props) {
  const { year, month, locale, t, selected, isOpen, onSelect } = props;
  const startsOn = weekStartsOn(locale);
  const weeks = useMemo(() => buildMonth(year, month, startsOn), [year, month, startsOn]);
  const headers = useMemo(() => weekdayHeaders(locale, startsOn), [locale, startsOn]);
  const selectedKey = selected ? dateKey(selected) : null;

  return (
    <div className="month">
      <div className="month-head">
        <h3 aria-live="polite">{formatMonthTitle(year, month, locale)}</h3>
        <div className="month-nav">
          <button type="button" aria-label={t.prevMonth} disabled={!props.canGoBack} onClick={() => props.onMonthChange(-1)}>
            <Chevron dir="left" />
          </button>
          <button type="button" aria-label={t.nextMonth} disabled={!props.canGoForward} onClick={() => props.onMonthChange(1)}>
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className="grid" role="grid" aria-label={formatMonthTitle(year, month, locale)}>
        <div className="grid-row weekdays" role="row">
          {headers.map((h) => (
            <span key={h} role="columnheader">{h}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div className="grid-row" role="row" key={wi}>
            {week.map((cell, ci) => {
              if (!cell) return <span key={ci} role="gridcell" />;
              const key = dateKey(cell.date);
              const open = isOpen(cell.date);
              return (
                <span key={ci} role="gridcell">
                  <button
                    type="button"
                    className={`day${open ? ' open' : ''}${key === selectedKey ? ' selected' : ''}`}
                    disabled={!open}
                    aria-pressed={key === selectedKey}
                    onClick={() => onSelect(cell.date)}
                  >
                    {cell.date.d}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d={dir === 'left' ? 'M9 2.5 4.5 7 9 11.5' : 'M5 2.5 9.5 7 5 11.5'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
