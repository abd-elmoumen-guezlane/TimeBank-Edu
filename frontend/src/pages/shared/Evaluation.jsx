import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, BookOpen, Star, Mail } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

/**
 * Après une séance : met à jour la note du tuteur, crédite ses heures, notifie.
 */
export default function Evaluation() {
  const { id } = useParams();
  const sessionId = Number(id);
  const navigate = useNavigate();
  const { sessions, tutors, creditBalance, updateTutorScore, addNotification, currentUser } = useApp();
  const { showToast } = useToast();

  const session = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  const tutor = useMemo(() => (session ? tutors.find((t) => t.id === session.tutorId) : null), [session, tutors]);

  const isSessionStudent =
    Boolean(session) &&
    currentUser?.role === 'student' &&
    session.studentId != null &&
    currentUser.id === session.studentId;

  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!session || !tutor || !isSessionStudent) {
      showToast('Session introuvable ou accès non autorisé.', 'error');
      navigate(currentUser?.role === 'tutor' ? '/tutor/dashboard' : '/student/tutorats');
      return;
    }
    const hours = session.duration ?? 1;
    creditBalance(tutor.id, hours);
    updateTutorScore(tutor.id, rating);
    addNotification({
      type: 'evaluation',
      text: `${session.student} vous a donné ${rating}/5 pour ${session.module}.`,
    });
    showToast('Merci ! Le tuteur a reçu ses heures.', 'success');
    navigate('/student/tutorats');
  };

  const displayTutor = tutor || { name: 'Tuteur', filiere: '—', avatar: 'TU', score: 4.8, reviews: 0 };

  if (!session) {
    const back = currentUser?.role === 'tutor' ? '/tutor/dashboard' : '/student/tutorats';
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16 text-gray-500 dark:text-gray-400">
          <p>Séance introuvable.</p>
          <button type="button" className="btn-primary mt-4" onClick={() => navigate(back)}>
            Retour
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (session && !isSessionStudent) {
    const back =
      currentUser?.role === 'tutor' ? '/tutor/dashboard' : currentUser?.role === 'student' ? '/student/tutorats' : '/';
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-12">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Évaluation réservée à l&apos;étudiant</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {currentUser?.role === 'tutor'
              ? 'Après une séance, seul l’étudiant peut vous noter sur la plateforme et valider le crédit de vos heures. Vous recevrez une notification lorsqu’il aura déposé son avis.'
              : "Seul l'étudiant qui a suivi cette séance peut déposer une évaluation."}
          </p>
          <button type="button" className="btn-primary" onClick={() => navigate(back)}>
            Retour
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Évaluer ce tutorat</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Votre avis aide la communauté et finalise le transfert d&apos;heures.</p>
        </div>

        <div className="card mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-5">
            <Avatar initials={displayTutor.avatar || 'TU'} size="lg" color="blue" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{displayTutor.name}</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tuteur — {displayTutor.filiere}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/40 rounded flex items-center justify-center text-blue-600">
                  <BookOpen size={12} strokeWidth={2} aria-hidden />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{session?.module ?? 'Module'}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{displayTutor.score ?? '—'}</span>
                <Star size={18} className="fill-yellow-400 text-yellow-400" aria-hidden />
              </div>
              <p className="text-xs text-gray-400">({displayTutor.reviews ?? 0} avis)</p>
              <p className="text-xs text-gray-400 mt-1">
                {session?.duration ?? 2} h • {session?.date ?? '—'}
              </p>
            </div>
          </div>

          <div className="text-center mb-5">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Votre note</h4>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-110 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={`Note ${i} sur 5`}
                >
                  <Star
                    size={40}
                    className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-600'}
                    fill={i <= rating ? 'currentColor' : 'none'}
                    strokeWidth={i <= rating ? 0 : 1.5}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {rating === 1 ? 'Très mauvais' : rating === 2 ? 'Mauvais' : rating === 3 ? 'Correct' : rating === 4 ? 'Bien' : 'Excellent !'}
            </p>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commentaire (optionnel)</label>
            <textarea
              rows={4}
              placeholder={`Partagez votre expérience avec ${displayTutor.name}.`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={300}
              className="input-field resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/300</p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-5">
            <Shield size={16} className="text-primary-600 flex-shrink-0" />
            <p className="text-xs text-primary-700 dark:text-primary-300">L&apos;évaluation crédite le tuteur de {session?.duration ?? 2}h sur sa balance.</p>
          </div>

          <button type="button" onClick={handleSubmit} className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
            <Mail size={18} aria-hidden />
            Valider l&apos;évaluation
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
