import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, MapPin, Calendar } from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import StarRating from '../components/common/StarRating';
import Avatar from '../components/common/Avatar';
import ModuleIcon from '../components/common/ModuleIcon';
import { useApp } from '../context/AppContext';

/**
 * Fiche publique d’un module : détail + accès réservation ou fiche tuteur.
 */
export default function ModuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modules, tutors, currentUser } = useApp();
  const mod = modules.find((m) => m.id === Number(id));

  if (!mod) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicNavbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Module introuvable.</p>
          <Link to="/modules" className="text-primary-600 font-medium">
            Retour à la liste
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tutor = tutors.find((t) => t.id === mod.tutorId);

  const goBooking = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/booking/new', {
      state: {
        moduleId: mod.id,
        tutorId: mod.tutorId,
        tutorName: mod.tutor,
        moduleLabel: `${mod.title} - ${mod.level}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-6">
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${mod.color}`}>
              <ModuleIcon title={mod.title} size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{mod.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {mod.category} • {mod.level}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={mod.score} size={14} />
                <span className="font-semibold text-gray-800 dark:text-gray-200">{mod.score}</span>
                <span className="text-xs text-gray-400">({mod.reviews} avis)</span>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full ${mod.format === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {mod.format === 'Online' ? <Monitor size={14} className="inline mr-1" /> : <MapPin size={14} className="inline mr-1" />}
              {mod.format}
            </span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
            <Avatar initials={tutor?.avatar || 'TU'} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tuteur</p>
              <p className="font-semibold text-gray-900 dark:text-white">{mod.tutor}</p>
              {tutor && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <StarRating rating={tutor.score ?? 0} size={12} />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{tutor.score}</span>
                  <span className="text-xs text-gray-400">({tutor.reviews ?? 0} avis)</span>
                </div>
              )}
              <button type="button" onClick={() => navigate(`/tuteurs/${mod.tutorId}`)} className="text-xs text-primary-600 hover:underline mt-1 block">
                Voir le profil
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <Calendar size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Planning indicatif</p>
              <p>{mod.schedule}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                La réservation se fait sur les créneaux publiés par l’enseignant (choix d’un seul horaire).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={goBooking} className="btn-primary">
              Voir les créneaux et demander
            </button>
            <Link to="/modules" className="btn-secondary">
              Autres modules
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
