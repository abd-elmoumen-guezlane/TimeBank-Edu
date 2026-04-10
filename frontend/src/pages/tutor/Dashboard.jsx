import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, BookOpen, ChevronRight, Check, X, TrendingUp, Hand, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

const chartData = [
  { month: 'Fév', tutorats: 3, heures: 5 },
  { month: 'Mar', tutorats: 5, heures: 8 },
  { month: 'Avr', tutorats: 4, heures: 7 },
  { month: 'Mai', tutorats: 7, heures: 12 },
  { month: 'Juin', tutorats: 6, heures: 10 },
];

function parseFrDate(s) {
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const y = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function findSessionForRequest(req, tutorId, sessions) {
  return sessions.find(
    (s) =>
      s.tutorId === tutorId &&
      s.studentId === req.fromId &&
      s.date === req.date &&
      s.module === req.module
  );
}

/**
 * Tableau de bord tuteur : demandes en attente, taux d’acceptation, prochaine séance.
 */
export default function TutorDashboard() {
  const { currentUser, requests, sessions, acceptRequest, rejectRequest } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [confirmTarget, setConfirmTarget] = useState(null);

  const myRequests = useMemo(() => requests.filter((r) => r.toId === currentUser?.id), [requests, currentUser?.id]);
  const pendingCount = myRequests.filter((r) => r.status === 'pending').length;
  const decided = myRequests.filter((r) => r.status === 'confirmed' || r.status === 'cancelled');
  const accepted = decided.filter((r) => r.status === 'confirmed').length;
  const acceptancePct = decided.length ? Math.round((accepted / decided.length) * 100) : null;

  /**
   * Prochaine séance : séances non terminées + demandes confirmées sans ligne séance (ex. données initiales).
   * Priorité aux dates ≥ aujourd’hui ; sinon la confirmée la plus récente dans le passé.
   */
  const nextSession = useMemo(() => {
    if (!currentUser?.id) return null;
    const today = startOfToday();
    const tutorId = currentUser.id;

    const fromSessions = sessions
      .filter((s) => s.tutorId === tutorId && s.status !== 'completed')
      .map((s) => ({ s, d: parseFrDate(s.date) }))
      .filter((x) => x.d);

    const fromConfirmedRequests = requests
      .filter((r) => r.toId === tutorId && r.status === 'confirmed')
      .filter((r) => !findSessionForRequest(r, tutorId, sessions))
      .map((r) => ({
        s: {
          module: r.module,
          student: r.from,
          date: r.date,
          time: r.time,
        },
        d: parseFrDate(r.date),
      }))
      .filter((x) => x.d);

    const all = [...fromSessions, ...fromConfirmedRequests];
    if (!all.length) return null;

    const future = all.filter((x) => x.d >= today).sort((a, b) => a.d - b.d);
    if (future.length) return future[0].s;

    const past = all.filter((x) => x.d < today).sort((a, b) => b.d - a.d);
    return past.length ? past[0].s : all.sort((a, b) => a.d - b.d)[0].s;
  }, [sessions, requests, currentUser?.id]);

  const recent = myRequests.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white inline-flex flex-wrap items-center gap-2">
            Bonjour {currentUser?.name?.split(' ')[0] || 'Ahmed'} !
            <Hand size={22} className="text-primary-600 flex-shrink-0" aria-hidden />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Voici un résumé de ton activité.</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white text-xs font-bold px-3 py-1">
            {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 dark:from-primary-900/20 dark:to-primary-900/10 dark:border-primary-800">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-primary-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Heures gagnées</span>
          </div>
          <div className="text-2xl font-bold text-primary-700 dark:text-primary-400">{currentUser?.balance || 8}h</div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-900/10 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Score</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{currentUser?.score || 4.8}</div>
          <div className="flex mt-1">
            <StarRating rating={currentUser?.score || 4.8} size={10} />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-900/10 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Tutorats donnés</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{currentUser?.hoursGiven || 24}</div>
        </div>
      </div>

      <div className="card mb-5 border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20">
        <div className="mb-2 flex items-center gap-2">
          <Calendar size={18} className="text-primary-600 dark:text-primary-400" aria-hidden />
          <h2 className="font-semibold text-gray-900 dark:text-white">Prochaine séance</h2>
        </div>
        {nextSession ? (
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {nextSession.module} avec {nextSession.student} — {nextSession.date} {nextSession.time}
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Il n’existe pas de séance à venir pour le moment. Les séances confirmées apparaîtront ici une fois planifiées.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Demandes Récentes</h2>
            <button type="button" onClick={() => navigate('/tutor/demandes')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Taux d&apos;acceptation :{' '}
            <strong className="text-gray-800 dark:text-gray-200">{acceptancePct !== null ? `${acceptancePct}%` : '—'}</strong>
            {decided.length > 0 && <span className="text-gray-400"> ({accepted}/{decided.length} traitées)</span>}
          </p>
          <div className="space-y-3">
            {recent.map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <Avatar initials={req.from.split(' ').map((w) => w[0]).join('')} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{req.from}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {req.module} • {req.duration}h
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Note étudiant</span>
                    <StarRating rating={req.score ?? 0} size={10} />
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{req.score ?? '—'}</span>
                  </div>
                </div>
                {req.status === 'pending' ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setConfirmTarget({ type: 'accept', req })}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700"
                      title="Accepter"
                      aria-label={`Accepter la demande de ${req.from}`}
                    >
                      <Check size={13} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget({ type: 'reject', req })}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                      title="Refuser"
                      aria-label={`Refuser la demande de ${req.from}`}
                    >
                      <X size={13} aria-hidden />
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-xs ${
                      req.status === 'confirmed' ? 'badge-green' : req.status === 'cancelled' ? 'badge-red' : 'badge-blue'
                    }`}
                  >
                    {req.status === 'confirmed' ? 'Confirmée' : req.status === 'cancelled' ? 'Refusée' : req.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Mon Planning</h2>
            <button type="button" onClick={() => navigate('/tutor/planning')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {sessions
              .filter((s) => s.tutorId === currentUser?.id)
              .slice(0, 3)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-600">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{s.date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.time}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{s.module}</p>
                  </div>
                  <span className={s.status === 'confirmed' ? 'badge-orange' : 'badge-green'}>{s.status === 'confirmed' ? 'Réservé' : s.status}</span>
                </div>
              ))}
            {sessions.filter((s) => s.tutorId === currentUser?.id).length === 0 && <p className="text-xs text-gray-400">Aucune séance listée.</p>}
          </div>
        </div>
      </div>

      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Statistiques</h2>
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <TrendingUp size={14} /> Activité tutorale
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="tutorats" name="Tutorats" stroke="#0d9488" fill="#ccfbf1" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <ConfirmDialog
        isOpen={confirmTarget != null}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => {
          if (!confirmTarget) return;
          const { type, req } = confirmTarget;
          const ok = type === 'accept' ? acceptRequest(req.id) : rejectRequest(req.id);
          setConfirmTarget(null);
          if (ok) {
            if (type === 'accept') {
              showToast('Demande acceptée — la séance est ajoutée à votre planning.', 'success');
            } else {
              showToast('Demande refusée — les heures ont été recréditées à l’étudiant.', 'info');
            }
          } else {
            showToast('Action impossible : cette demande n’est plus en attente.', 'error');
          }
        }}
        title={confirmTarget?.type === 'reject' ? 'Refuser cette demande ?' : 'Accepter cette demande ?'}
        message={
          confirmTarget
            ? confirmTarget.type === 'reject'
              ? `Les ${confirmTarget.req.duration}h seront recréditées à ${confirmTarget.req.from}.`
              : `Confirmer avec ${confirmTarget.req.from} — ${confirmTarget.req.module}, le ${confirmTarget.req.date} (${confirmTarget.req.time}).`
            : ''
        }
        confirmLabel={confirmTarget?.type === 'reject' ? 'Refuser' : 'Accepter'}
        danger={confirmTarget?.type === 'reject'}
      />
    </DashboardLayout>
  );
}
