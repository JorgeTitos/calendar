import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock } from './components/Clock';
import { DayTimeline } from './components/DayTimeline';
import { DetailsForm, type Details } from './components/DetailsForm';
import { PhotoSky } from './components/PhotoSky';
import { MonthCalendar } from './components/MonthCalendar';
import { config } from './config';
import { useEased } from './hooks/useEased';
import { useMadridNow } from './hooks/useMadridNow';
import { createAvailability } from './lib/availability';
import { shiftMonth } from './lib/calendar';
import { submitBooking } from './lib/booking';
import { buildIcs } from './lib/ics';
import { detectLocale, dictionary, formatLongDate, formatTime } from './lib/i18n';
import { skyAt } from './lib/sky';
import { TIME_ZONE, addDays, compareYMD, dateKey, madridToDate, type YMD } from './lib/time';

type Step = 'pick' | 'details' | 'done';

const availability = createAvailability(config);

export default function App() {
  const locale = useMemo(() => detectLocale(config.locale), []);
  const t = dictionary[locale];
  const now = useMadridNow();

  const [month, setMonth] = useState({ y: now.date.y, m: now.date.m });
  const [date, setDate] = useState<YMD | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [step, setStep] = useState<Step>('pick');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState<Details | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // ── Sky: follows the hovered time, else the chosen time, else the real clock.
  const shownMinutes = hover ?? slot ?? now.minutes;
  const shownDate = date ?? now.date;
  const easedMinutes = useEased(shownMinutes);
  const sky = useMemo(() => skyAt(shownDate, easedMinutes), [shownDate, easedMinutes]);

  // ── Month navigation limits.
  const lastMonth = useMemo(() => {
    const last = addDays(now.date, config.availability.maxDaysAhead);
    return { y: last.y, m: last.m };
  }, [now.date]);
  const monthIndex = (v: { y: number; m: number }) => v.y * 12 + v.m;
  const canGoBack = monthIndex(month) > monthIndex(now.date);
  const canGoForward = monthIndex(month) < monthIndex(lastMonth);

  const isOpen = useCallback((d: YMD) => availability.isDayOpen(d, now), [now]);

  const selectDate = (d: YMD) => {
    if (!date || compareYMD(d, date) !== 0) setSlot(null);
    setDate(d);
  };

  const closeDay = useCallback(() => {
    setDate(null);
    setSlot(null);
    setHover(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (step === 'details') setStep('pick');
      else if (step === 'pick' && date) closeDay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, date, closeDay]);

  async function confirm(details: Details) {
    if (!date || slot === null) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitBooking({
        date: dateKey(date),
        start: slot,
        durationMinutes: config.meeting.durationMinutes,
        timeZone: TIME_ZONE,
        ...details,
      });
      setGuest(details);
      setStep('done');
      setHover(null);
    } catch {
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  }

  function downloadIcs() {
    if (!date || slot === null) return;
    const start = madridToDate(date, slot);
    const end = new Date(start.getTime() + config.meeting.durationMinutes * 60_000);
    const ics = buildIcs({
      uid: `${crypto.randomUUID()}@madrid-booking-calendar`,
      start,
      end,
      summary: `${config.meeting.durationMinutes} min · ${config.owner}`,
      description: [config.meeting.provider, guest?.notes].filter(Boolean).join('\n'),
      location: config.meeting.provider,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'reserva.ics' });
    link.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setStep('pick');
    closeDay();
    setGuest(null);
  }

  const dayOpen = date !== null && step !== 'done';
  const meta = `${config.meeting.durationMinutes} min · ${config.meeting.provider}`;

  return (
    <>
      <PhotoSky sky={sky} />

      {config.homeUrl && (
        <a className="home" href={config.homeUrl}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5 4.5 7 9 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.home}
        </a>
      )}

      <Clock date={shownDate} minutes={shownMinutes} locale={locale} />

      <main className={`card step-${step}${dayOpen ? ' open' : ''}`}>
        <div className="card-main">
          {step === 'pick' && (
            <>
              <p className="meta">{meta}</p>
              <h1>{t.title}</h1>
              <p className="hint">{date ? t.pickTime : t.intro(config.owner)}</p>

              <MonthCalendar
                year={month.y}
                month={month.m}
                locale={locale}
                t={t}
                selected={date}
                isOpen={isOpen}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onMonthChange={(delta) => setMonth((m) => shiftMonth(m.y, m.m, delta))}
                onSelect={selectDate}
              />

              <button
                type="button"
                className="cta primary"
                disabled={!date || slot === null}
                onClick={() => setStep('details')}
              >
                {!date ? t.pickDay : slot === null ? t.pickTimeCta : t.continue}
              </button>
            </>
          )}

          {step === 'details' && date && slot !== null && (
            <DetailsForm
              config={config}
              date={date}
              start={slot}
              locale={locale}
              t={t}
              submitting={submitting}
              error={error}
              onBack={() => setStep('pick')}
              onSubmit={confirm}
            />
          )}

          {step === 'done' && date && slot !== null && guest && (
            <div className="confirmation">
              <span className="check" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="m5 11.5 4 4 8-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h1>{t.doneTitle}</h1>
              <p className="hint">{t.doneBody(guest.name)}</p>
              <p className="when">
                {formatLongDate(date, locale)} · {formatTime(slot, locale)}
              </p>
              <p className="meta">{meta}</p>
              <button type="button" className="cta primary" onClick={downloadIcs}>
                {t.addToCalendar}
              </button>
              <button type="button" className="cta ghost" onClick={reset}>
                {t.bookAnother}
              </button>
            </div>
          )}
        </div>

        {dayOpen && date && (
          <DayTimeline
            date={date}
            now={now}
            config={config}
            availability={availability}
            locale={locale}
            t={t}
            selected={slot}
            hover={hover}
            onHover={setHover}
            onSelect={setSlot}
            onClose={() => (step === 'pick' ? closeDay() : setStep('pick'))}
          />
        )}
      </main>
    </>
  );
}
