import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import { useApp } from '../../context/AppContext';

/**
 * Tutorats de l’étudiant connecté (sessions synchronisées avec le contexte).
 */
export default function MyTutorials() {
  const navigate = useNavigate();
  const { sessions, currentUser, tutors } = useApp();

  const mine = useMemo(() => sessions.filter((s) => s.studentId === currentUser?.id), [sessions, currentUser?.id]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mes Tutorats</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Toutes vos séances de tutorat passées et à venir.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mine.map((s) => {
          const tutorRow = tutors.find((t) => t.id === s.tutorId);
          return (
          <div key={s.id} className="card hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                initials={s.tutor
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.tutor}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.module}</p>
                {tutorRow && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <StarRating rating={tutorRow.score ?? 0} size={11} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{tutorRow.score}</span>
                    <span className="text-xs text-gray-400">({tutorRow.reviews ?? 0} avis)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <Calendar size={13} />
              <span>
                {s.date} • {s.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <Clock size={13} />
              <span>{s.duration}h de tutorat</span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={
                  s.status === 'completed'
                    ? 'badge-green'
                    : s.status === 'in_progress'
                      ? 'badge-orange'
                      : s.status === 'confirmed'
                        ? 'badge-blue'
                        : 'badge-gray'
                }
              >
                {s.status === 'completed'
                  ? 'Complétée'
                  : s.status === 'in_progress'
                    ? 'En cours'
                    : s.status === 'confirmed'
                      ? 'Confirmée'
                      : s.status}
              </span>
              {(s.status === 'in_progress' || s.status === 'confirmed') && (
                <button
                  type="button"
                  onClick={() => navigate(`/session/${s.id}`)}
                  className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary-700"
                >
                  <PlayCircle size={13} /> Rejoindre
                </button>
              )}
              {s.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => navigate(`/evaluation/${s.id}`)}
                  className="text-xs text-primary-600 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  Évaluer
                </button>
              )}
            </div>
          </div>
        );
        })}
        {mine.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-8">Aucune séance pour le moment.</p>}
      </div>
    </DashboardLayout>
  );
}
