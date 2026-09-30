import { useState, type FormEvent } from 'react';
import type { Config } from '../config';
import { formatShortDate, formatTime, type Locale, type Strings } from '../lib/i18n';
import { zoneLabel, type YMD } from '../lib/time';

export interface Details {
  name: string;
  email: string;
  notes: string;
}

interface Props {
  config: Config;
  date: YMD;
  start: number;
  locale: Locale;
  t: Strings;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (details: Details) => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DetailsForm({ config, date, start, locale, t, submitting, error, onBack, onSubmit }: Props) {
  const [details, setDetails] = useState<Details>({ name: '', email: '', notes: '' });
  const [problem, setProblem] = useState<string | null>(null);

  const set = (key: keyof Details) => (e: { target: { value: string } }) =>
    setDetails((d) => ({ ...d, [key]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!details.name.trim()) return setProblem(t.nameRequired);
    if (!EMAIL.test(details.email.trim())) return setProblem(t.invalidEmail);
    setProblem(null);
    onSubmit({ ...details, name: details.name.trim(), email: details.email.trim() });
  }

  return (
    <form className="details" onSubmit={submit} noValidate>
      <button type="button" className="back" onClick={onBack}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2.5 4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t.back}
      </button>

      <p className="meta">
        {config.meeting.durationMinutes} min · {config.meeting.provider}
      </p>
      <h1>{t.detailsTitle}</h1>

      <dl className="summary">
        <div>
          <dt>{t.date}</dt>
          <dd>{formatShortDate(date, locale)}</dd>
        </div>
        <div>
          <dt>{t.time}</dt>
          <dd>
            {formatTime(start, locale)} {zoneLabel(date, start, locale)}
          </dd>
        </div>
      </dl>

      <div className="fields">
        <input
          type="text"
          name="name"
          placeholder={t.name}
          aria-label={t.name}
          autoComplete="name"
          autoFocus
          value={details.name}
          onChange={set('name')}
        />
        <input
          type="email"
          name="email"
          placeholder={t.email}
          aria-label={t.email}
          autoComplete="email"
          value={details.email}
          onChange={set('email')}
        />
        <textarea
          name="notes"
          placeholder={t.notes}
          aria-label={t.notes}
          rows={3}
          value={details.notes}
          onChange={set('notes')}
        />
      </div>

      {(problem || error) && (
        <p className="form-error" role="alert">
          {problem ?? error}
        </p>
      )}

      <button type="submit" className="cta primary" disabled={submitting}>
        {submitting ? t.confirming : t.confirm}
      </button>
    </form>
  );
}
