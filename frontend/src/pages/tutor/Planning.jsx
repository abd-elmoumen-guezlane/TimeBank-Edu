import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = Array.from({ length: 10 }, (_, i) => `${i + 9}h`);

function mondayOf(date) {
  const x = new Date(date);
  x.setHours(0, 0, 0, 0);
  const offset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - offset);
  return x;
}

/** Parse "15/05/2024" */
function parseFrDate(s) {
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const y = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Début d'heure depuis "10h-12h" ou "10h - 12h" */
function startHourFromTime(timeStr) {
  const m = String(timeStr).replace(/\s/g, '').match(/^(\d{1,2})h/i);
  return m ? parseInt(m[1], 10) : null;
}

function sessionColor(status) {
  if (status === 'completed') return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600';
  if (status === 'in_progress') return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-700';
  return 'bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/40 dark:text-primary-100 dark:border-primary-700';
}

export default function Planning() {
  const { sessions, currentUser } = useApp();
  const [view, setView] = useState('semaine');
  /** Lundi de la semaine affichée (démo : semaine du 13 mai 2024 pour coller aux données mock) */
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date(2024, 4, 13)));

  const tutorSessions = useMemo(
    () => sessions.filter((s) => s.tutorId === currentUser?.id),
    [sessions, currentUser?.id]
  );

  const weekEnd = useMemo(() => {
    const e = new Date(weekStart);
    e.setDate(e.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return e;
  }, [weekStart]);

  const headerDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const headerLabel = useMemo(() => {
    const a = headerDates[0];
    const b = headerDates[6];
    const mo = (d) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (a.getMonth() === b.getMonth()) {
      return `${a.getDate()} – ${b.getDate()} ${mo(a)}`;
    }
    return `${a.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${b.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [headerDates]);

  /** cellKey -> { sessions: [...] } pour empiler plusieurs séances */
  const cells = useMemo(() => {
    const map = new Map();
    const ws = new Date(weekStart);
    ws.setHours(0, 0, 0, 0);

    for (const s of tutorSessions) {
      const dt = parseFrDate(s.date);
      if (!dt || dt < ws || dt > weekEnd) continue;
      const dayIndex = (dt.getDay() + 6) % 7;
      const startH = startHourFromTime(s.time);
      if (startH == null) continue;
      const hourIndex = startH - 9;
      if (hourIndex < 0 || hourIndex >= HOURS.length) continue;
      const key = `${dayIndex}-${hourIndex}`;
      const label = `${s.module}\n${s.student}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ ...s, label });
    }
    return map;
  }, [tutorSessions, weekStart, weekEnd]);

  const goWeek = (delta) => {
    setWeekStart((prev) => {
      const n = new Date(prev);
      n.setDate(n.getDate() + delta * 7);
      return n;
    });
  };

  const goTodayWeek = () => {
    setWeekStart(mondayOf(new Date()));
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mon planning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Les séances apparaissent ici lorsque vous <strong className="font-medium text-gray-700 dark:text-gray-300">acceptez une demande</strong> d’étudiant. Pour proposer des créneaux réservables, utilisez{' '}
            <Link to="/tutor/offres" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              Mes offres
            </Link>
            .
          </p>
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {['Semaine', 'Mois'].map((v) => {
            const key = v.toLowerCase();
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(key)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  view === key ? 'bg-white text-primary-600 shadow dark:bg-gray-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => goWeek(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Semaine précédente"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[10rem] font-semibold capitalize text-gray-800 dark:text-gray-100">{headerLabel}</span>
        <button
          type="button"
          onClick={() => goWeek(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Semaine suivante"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={goTodayWeek}
          className="rounded-lg border border-primary-200 px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950/40"
        >
          Aujourd&apos;hui
        </button>
      </div>

      {view === 'mois' ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800/40 dark:text-gray-400">
          Vue mois à venir. Utilisez la vue <strong className="font-medium text-gray-700 dark:text-gray-200">Semaine</strong> pour voir vos séances confirmées.
        </p>
      ) : (
        <div className="card overflow-hidden p-0 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid overflow-x-auto" style={{ minWidth: '600px' }}>
            <div className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700">
              <div className="p-3 text-xs font-medium text-gray-400" />
              {DAY_LABELS.map((d, i) => {
                const hd = headerDates[i];
                const isToday =
                  hd &&
                  new Date().toDateString() === hd.toDateString();
                return (
                  <div
                    key={d}
                    className={`border-l border-gray-100 p-3 text-center dark:border-gray-700 ${isToday ? 'bg-primary-50 dark:bg-primary-950/25' : ''}`}
                  >
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{d}</p>
                    <p className={`text-lg font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-800 dark:text-gray-100'}`}>{hd.getDate()}</p>
                  </div>
                );
              })}
            </div>
            {HOURS.map((h, hi) => (
              <div key={h} className="grid grid-cols-8 border-b border-gray-50 dark:border-gray-700/80">
                <div className="flex items-start border-r border-gray-100 px-3 py-2 text-xs text-gray-400 dark:border-gray-700">{h}</div>
                {DAY_LABELS.map((d, di) => {
                  const list = cells.get(`${di}-${hi}`) || [];
                  return (
                    <div
                      key={`${d}-${h}`}
                      className="relative min-h-[44px] border-l border-gray-50 p-0.5 dark:border-gray-700/80"
                    >
                      {list.map((s) => (
                        <div
                          key={s.id}
                          className={`mb-0.5 rounded-lg border p-1 text-[10px] font-medium leading-tight ${sessionColor(s.status)}`}
                          title={`${s.module} — ${s.student} (${s.time})`}
                        >
                          {s.label.split('\n').map((line, idx) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
        {[
          { color: 'bg-primary-200 dark:bg-primary-800', label: 'Confirmée' },
          { color: 'bg-orange-200 dark:bg-orange-800', label: 'En cours' },
          { color: 'bg-gray-200 dark:bg-gray-600', label: 'Terminée' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {tutorSessions.length === 0 && view === 'semaine' && (
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucune séance pour le moment. Elles s’ajoutent automatiquement lorsque vous acceptez une demande dans{' '}
          <Link to="/tutor/demandes" className="font-medium text-primary-600 underline dark:text-primary-400">
            Demandes reçues
          </Link>
          .
        </p>
      )}
    </DashboardLayout>
  );
}
