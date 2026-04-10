import { useNavigate } from 'react-router-dom';
import { Clock, Star, BookOpen, Search, Plus, ChevronRight, CheckCircle2, PlayCircle, Calendar, Hand, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import { useApp } from '../../context/AppContext';

const BALANCE_CAP = 10;

const statusConfig = {
  completed: { label: 'Complétée', cls: 'badge-green' },
  in_progress: { label: 'En cours', cls: 'badge-orange' },
  confirmed: { label: 'Confirmée', cls: 'badge-blue' },
  pending: { label: 'En attente', cls: 'badge-gray' },
};

/**
 * Tableau de bord étudiant : solde avec jauge, alerte solde nul, tuteurs recommandés.
 */
export default function StudentDashboard() {
  const { currentUser, sessions, tutors } = useApp();
  const navigate = useNavigate();

  const mySessions = sessions.filter((s) => s.studentId === currentUser?.id);
  const balance = currentUser?.balance ?? 0;
  const progressPct = Math.min(100, Math.round((balance / BALANCE_CAP) * 100));
  const recommended = [...tutors].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white inline-flex flex-wrap items-center gap-2">
            Bonjour {currentUser?.name?.split(' ')[0] || 'étudiant'} !
            <Hand size={22} className="text-primary-600 flex-shrink-0" aria-hidden />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Prêt(e) à apprendre aujourd&apos;hui ?</p>
        </div>
      </div>

      {balance === 0 && (
        <div className="card mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex flex-col sm:flex-row sm:items-center gap-4">
          <AlertCircle className="text-red-600 flex-shrink-0" size={28} />
          <div className="flex-1">
            <p className="font-semibold text-red-800 dark:text-red-300">Solde épuisé</p>
            <p className="text-sm text-red-700 dark:text-red-400">Gagnez des heures en enseignant ou contactez l&apos;administration.</p>
          </div>
          <button type="button" onClick={() => navigate('/student/modules')} className="btn-primary text-sm py-2 whitespace-nowrap">
            Voir les modules
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 dark:from-primary-900/20 dark:to-primary-900/10 dark:border-primary-800 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-primary-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Balance</span>
          </div>
          <div className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">
            {balance}h / {BALANCE_CAP}h
          </div>
          <div className="h-2 bg-white/60 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          {balance > 0 ? (
            <button type="button" onClick={() => navigate('/student/modules')} className="text-xs text-primary-600 font-medium flex items-center gap-0.5 hover:underline">
              <Search size={12} /> Trouver un tuteur
            </button>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">Rechargez votre solde pour réserver.</p>
          )}
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-900/10 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="text-blue-500 fill-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Score</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{currentUser?.score || 4.7}</div>
          <div className="flex mt-1">
            <StarRating rating={currentUser?.score || 4.7} size={10} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-900/10 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-purple-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Niveau</span>
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{currentUser?.level || 'L2'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{currentUser?.filiere || 'Informatique'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button type="button" onClick={() => navigate('/student/modules')} className="btn-primary py-3 text-sm">
          <Search size={16} /> Trouver un Module
        </button>
        <button type="button" onClick={() => navigate('/student/demandes')} className="btn-secondary py-3 text-sm">
          <Plus size={16} /> Mes demandes
        </button>
      </div>

      <div className="card mb-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tuteurs recommandés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recommended.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/tuteurs/${t.id}`)}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left transition-colors"
            >
              <Avatar initials={t.avatar} size="md" color="blue" />
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{t.name}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  <StarRating rating={t.score} size={10} />
                  <span className="text-xs text-gray-500">{t.score}</span>
                  <span className="text-xs text-gray-400">({t.reviews ?? 0} avis)</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Mes Activités Récentes</h2>
          <button type="button" onClick={() => navigate('/student/historique')} className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
            Voir tout <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {mySessions.map((s) => {
            const cfg = statusConfig[s.status] || statusConfig.pending;
            const tProf = tutors.find((t) => t.id === s.tutorId);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => (s.status === 'in_progress' || s.status === 'confirmed' ? navigate(`/session/${s.id}`) : undefined)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  {s.status === 'completed' ? (
                    <CheckCircle2 size={18} className="text-primary-600" />
                  ) : s.status === 'in_progress' ? (
                    <PlayCircle size={18} className="text-orange-500" />
                  ) : (
                    <Calendar size={18} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{s.module}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avec {s.tutor}</p>
                  {tProf && (
                    <div className="flex items-center gap-1 mt-1">
                      <StarRating rating={tProf.score ?? 0} size={9} />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{tProf.score}</span>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.duration}h</p>
                  <span className={`${cfg.cls} mt-0.5 inline-block`}>{cfg.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card mt-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Prochaines Séances</h2>
        </div>
        <div className="space-y-3">
          {mySessions
            .filter((s) => s.status === 'confirmed')
            .slice(0, 4)
            .map((s) => {
              const tp = tutors.find((t) => t.id === s.tutorId);
              return (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.module}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Avec {s.tutor} • {s.date} {s.time}
                  </p>
                  {tp && (
                    <div className="flex items-center gap-1 mt-1">
                      <StarRating rating={tp.score ?? 0} size={9} />
                      <span className="text-[10px] text-gray-500">{tp.score}</span>
                    </div>
                  )}
                </div>
                <span className={s.status === 'confirmed' ? 'badge-blue' : 'badge-gray'}>{s.status === 'confirmed' ? 'Confirmée' : 'En attente'}</span>
              </div>
            );
            })}
          {mySessions.filter((s) => s.status === 'confirmed').length === 0 && <p className="text-sm text-gray-400">Aucune séance confirmée pour le moment.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
