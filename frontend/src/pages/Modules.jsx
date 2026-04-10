import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Monitor } from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import StarRating from '../components/common/StarRating';
import Avatar from '../components/common/Avatar';
import ModuleIcon from '../components/common/ModuleIcon';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['', 'Informatique', 'Mathématiques', 'Gestion'];

/**
 * Liste publique des modules publiés (même logique de filtres que FindModule étudiant).
 */
export default function Modules() {
  const navigate = useNavigate();
  const { modules, tutors } = useApp();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ niveau: '', categorie: '', format: '' });

  const published = useMemo(() => modules.filter((m) => m.status === 'published' || m.status === 'pending'), [modules]);

  const filtered = useMemo(() => {
    return published.filter((m) => {
      if (filters.niveau && m.level !== filters.niveau) return false;
      if (filters.categorie && m.category !== filters.categorie) return false;
      if (filters.format === 'Online' && m.format !== 'Online') return false;
      if (filters.format === 'Présentiel' && m.format === 'Online') return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.tutor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [published, filters, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Modules</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Parcourez les matières proposées par la communauté.</p>
        </div>

        <div className="card mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un module, un tuteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <span className="btn-secondary text-sm py-2 px-4 pointer-events-none opacity-80">
              <Filter size={15} /> Filtres
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.niveau}
              onChange={(e) => setFilters({ ...filters, niveau: e.target.value })}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Niveau</option>
              {['L1', 'L2', 'L3', 'M1', 'M2'].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={filters.categorie}
              onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Catégorie</option>
              {CATEGORIES.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filters.format}
              onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Format</option>
              <option value="Online">En ligne</option>
              <option value="Présentiel">Présentiel</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          <span className="font-semibold">{filtered.length}</span> résultat(s)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mod) => {
            const tutor = tutors.find((t) => t.id === mod.tutorId);
            return (
              <div key={mod.id} className="card hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.color}`}>
                      <ModuleIcon title={mod.title} size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{mod.title}</h3>
                      <span className="badge-blue mt-1 inline-block">{mod.level}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${mod.format === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {mod.format === 'Online' ? <Monitor size={12} className="inline mr-1" /> : <MapPin size={12} className="inline mr-1" />}
                    {mod.format}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Avatar initials={tutor?.avatar || 'TU'} size="sm" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{mod.tutor}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <StarRating rating={mod.score} size={13} />
                  <span className="text-sm font-semibold dark:text-gray-200">{mod.score}</span>
                  <span className="text-xs text-gray-400">({mod.reviews} avis)</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{mod.schedule}</p>
                {mod.status === 'pending' && <span className="badge-orange text-[10px] mb-2 inline-block">Validation en cours</span>}
                <button type="button" onClick={() => navigate(`/modules/${mod.id}`)} className="btn-primary w-full text-sm py-2">
                  Voir le module
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
