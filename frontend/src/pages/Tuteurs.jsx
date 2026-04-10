import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star } from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Avatar from '../components/common/Avatar';
import StarRating from '../components/common/StarRating';
import { useApp } from '../context/AppContext';

const FILIERES = ['', 'Informatique', 'Mathématiques', 'Gestion'];

/**
 * Liste publique des tuteurs avec filtres (filière, disponibilité, note min).
 */
export default function Tuteurs() {
  const navigate = useNavigate();
  const { tutors } = useApp();
  const [search, setSearch] = useState('');
  const [filiere, setFiliere] = useState('');
  const [disponibleOnly, setDisponibleOnly] = useState(false);
  const [minScore, setMinScore] = useState('');

  const filtered = useMemo(() => {
    const min = minScore === '' ? 0 : Number(minScore);
    return tutors.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.filiere.toLowerCase().includes(search.toLowerCase())) return false;
      if (filiere && t.filiere !== filiere) return false;
      if (disponibleOnly && !t.disponible) return false;
      if (minScore !== '' && (t.score ?? 0) < min) return false;
      return true;
    });
  }, [tutors, search, filiere, disponibleOnly, minScore]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Tuteurs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Découvrez les membres qui proposent du tutorat.</p>
        </div>

        <div className="card mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou filière..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <select
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes les filières</option>
              {FILIERES.filter(Boolean).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 px-2">
              <input type="checkbox" checked={disponibleOnly} onChange={(e) => setDisponibleOnly(e.target.checked)} className="rounded border-gray-300" />
              Disponibles uniquement
            </label>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Star size={16} className="text-yellow-500" />
              <span>Note min</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-sm"
              >
                <option value="">—</option>
                {['4', '4.5', '4.7', '4.8'].map((s) => (
                  <option key={s} value={s}>
                    {s}+
                  </option>
                ))}
              </select>
            </div>
            <span className="btn-secondary text-sm py-2 px-4 pointer-events-none opacity-80">
              <Filter size={15} /> Filtres
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          <span className="font-semibold">{filtered.length}</span> tuteur(s)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/tuteurs/${t.id}`)}
              className="card text-left hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar initials={t.avatar} size="md" />
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t.level} • {t.filiere}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <StarRating rating={t.score} size={12} />
                <span className="text-sm font-semibold dark:text-gray-200">{t.score}</span>
                <span className="text-xs text-gray-400">({t.reviews} avis)</span>
              </div>
              <span className={t.disponible ? 'badge-green' : 'badge-gray'}>{t.disponible ? 'Disponible' : 'Indisponible'}</span>
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
