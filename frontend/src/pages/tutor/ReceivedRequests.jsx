import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle, Search, AlertTriangle, Video } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

const tabs = ['Toutes', 'En attente', 'Confirmées', 'Terminées', 'Annulées'];

/** Format module lié à la demande (offre → module, sinon correspondance titre/niveau). */
function getModuleFormatForRequest(req, modules, courseOffers) {
  if (req.offerId != null) {
    const off = courseOffers.find((o) => o.id === Number(req.offerId));
    if (off) {
      const mod = modules.find((m) => m.id === off.moduleId);
      if (mod?.format) return mod.format;
    }
  }
  const label = (req.module || '').trim().toLowerCase().replace(/\s+/g, ' ');
  for (const m of modules) {
    const title = (m.title || '').toLowerCase();
    const level = (m.level || '').toLowerCase();
    if (!title) continue;
    if (label.includes(title) && (label.includes(level) || !level)) return m.format;
  }
  return null;
}

function isOnlineModuleFormat(format) {
  return format === 'Online' || format === 'En ligne';
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
 * Demandes adressées au tuteur connecté : accepter / refuser avec mise à jour contexte.
 */
export default function ReceivedRequests() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser, requests, acceptRequest, rejectRequest, modules, courseOffers, sessions } = useApp();
  const [activeTab, setActiveTab] = useState('Toutes');
  const [search, setSearch] = useState('');
  /** { type: 'accept' | 'reject', req } — dialogue de confirmation avant décision */
  const [confirmTarget, setConfirmTarget] = useState(null);

  const mine = useMemo(() => requests.filter((r) => r.toId === currentUser?.id), [requests, currentUser?.id]);

  const filtered = useMemo(() => {
    return mine.filter((r) => {
      if (activeTab === 'En attente') return r.status === 'pending';
      if (activeTab === 'Confirmées') return r.status === 'confirmed';
      if (activeTab === 'Terminées') return r.status === 'completed';
      if (activeTab === 'Annulées') return r.status === 'cancelled';
      if (search && !r.from.toLowerCase().includes(search.toLowerCase()) && !r.module.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [mine, activeTab, search]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Demandes Reçues</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez les demandes de tutorat de vos étudiants.</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-48 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-1 mb-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 border border-gray-200 dark:border-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((req) => {
          const modFormat = getModuleFormatForRequest(req, modules, courseOffers);
          const isOnline = isOnlineModuleFormat(modFormat);
          const linkedSession =
            req.status === 'confirmed' && currentUser?.id
              ? findSessionForRequest(req, currentUser.id, sessions)
              : null;

          return (
          <div key={req.id} className="card relative flex flex-col gap-4 sm:flex-row sm:items-center dark:bg-gray-800 dark:border-gray-700">
            {isOnline && (
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                  <Video size={11} className="shrink-0" aria-hidden />
                  En ligne
                </span>
              </div>
            )}
            <Avatar initials={req.from.split(' ').map((w) => w[0]).join('')} size="md" />
            <div className="flex-1 min-w-0 pr-16 sm:pr-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-sm dark:text-white">{req.from}</span>
                <div className="flex items-center gap-1 flex-wrap" title="Note communauté de l'étudiant">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Profil</span>
                  <StarRating rating={req.score} size={11} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{req.score}</span>
                </div>
              </div>
              <p className="text-sm text-primary-600 font-medium">{req.module}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {req.date} • {req.time} • {req.duration}h
              </p>
              {req.message && <p className="text-xs text-gray-400 mt-1 italic">&quot;{req.message}&quot;</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {req.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmTarget({ type: 'accept', req })}
                    className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700"
                  >
                    <Check size={13} aria-hidden /> Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmTarget({ type: 'reject', req })}
                    className="flex items-center gap-1.5 rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  >
                    <X size={13} aria-hidden /> Refuser
                  </button>
                </>
              ) : req.status === 'confirmed' ? (
                <>
                  <span className="badge-green">Confirmée</span>
                  {isOnline && (
                    <button
                      type="button"
                      onClick={() => {
                        if (linkedSession) {
                          navigate(`/session/${linkedSession.id}`);
                        } else {
                          showToast('Séance introuvable — ouvrez le planning ou réessayez après synchronisation.', 'info');
                          navigate('/tutor/planning');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50"
                    >
                      <Video size={14} aria-hidden />
                      Ouvrir la salle
                    </button>
                  )}
                </>
              ) : req.status === 'cancelled' ? (
                <span className="badge-red">Refusée</span>
              ) : (
                <span className="badge-blue">{req.status}</span>
              )}
              <button
                type="button"
                aria-label={`Écrire à ${req.from}`}
                onClick={() => navigate('/tutor/chat', { state: { openWithId: req.fromId } })}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <MessageCircle size={15} className="text-gray-500" />
              </button>
            </div>
          </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>Aucune demande dans cette catégorie</p>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-300 text-center mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg px-4 py-3 flex items-center justify-center gap-2" role="note">
        <AlertTriangle size={14} className="text-yellow-600 flex-shrink-0" aria-hidden />
        <span>Répondez dans les 24h pour une meilleure expérience.</span>
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
              ? `Les ${confirmTarget.req.duration}h seront recréditées à ${confirmTarget.req.from}. Vous pourrez confirmer une autre séance plus tard.`
              : `Confirmer la séance avec ${confirmTarget.req.from} — ${confirmTarget.req.module}, le ${confirmTarget.req.date} (${confirmTarget.req.time}). Elle sera ajoutée à votre planning.`
            : ''
        }
        confirmLabel={confirmTarget?.type === 'reject' ? 'Refuser' : 'Accepter'}
        danger={confirmTarget?.type === 'reject'}
      />
    </DashboardLayout>
  );
}
