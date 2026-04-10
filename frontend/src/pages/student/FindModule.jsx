import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Monitor, User, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StarRating from '../../components/common/StarRating';
import Avatar from '../../components/common/Avatar';
import { useApp } from '../../context/AppContext';
import { buildStudentNavSuggestions } from '../../utils/navbarSearchSuggestions';

/**
 * Recherche de modules (données live depuis AppContext).
 */
export default function FindModule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { modules, tutors } = useApp();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);
  const [filters, setFilters] = useState({ niveau: '', module: '', disponibilite: '', format: '' });
  const [sortBy, setSortBy] = useState('Mieux notés');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchBoxRef = useRef(null);

  const pageSuggestions = useMemo(() => buildStudentNavSuggestions(search, tutors, modules), [search, tutors, modules]);

  useEffect(() => {
    const close = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const published = useMemo(() => modules.filter((m) => m.status === 'published' || m.status === 'pending'), [modules]);

  const filtered = useMemo(() => {
    let list = published.filter((m) => {
      if (filters.niveau && m.level !== filters.niveau) return false;
      if (filters.module && m.title !== filters.module) return false;
      if (filters.format === 'Online' && m.format !== 'Online') return false;
      if (filters.format === 'Présentiel' && m.format === 'Online') return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.tutor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortBy === 'Mieux notés') list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return list;
  }, [published, filters, search, sortBy]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Trouver un Module</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Trouvez le tuteur parfait selon vos critères.</p>
      </div>

      <div className="card mb-5 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 z-10" ref={searchBoxRef}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un module, un tuteur…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSuggestOpen(true);
              }}
              onFocus={() => setSuggestOpen(true)}
              className="input-field pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {suggestOpen && pageSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {pageSuggestions.map((s) => (
                  <li key={s.type === 'tutor' ? `t-${s.id}` : `m-${s.id}`}>
                    <button
                      type="button"
                      className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/80"
                      onClick={() => {
                        setSuggestOpen(false);
                        if (s.type === 'tutor') navigate(`/tuteurs/${s.id}`);
                        else navigate(`/modules/${s.id}`);
                      }}
                    >
                      <span className="mt-0.5 text-gray-400">{s.type === 'tutor' ? <User size={14} /> : <BookOpen size={14} />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-sm text-gray-900 dark:text-white truncate">{s.primary}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">{s.secondary}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className="btn-secondary text-sm py-2 px-4">
            <Filter size={15} /> Filtres
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'niveau', opts: ['L1', 'L2', 'L3', 'M1', 'M2'], placeholder: 'Niveau' },
            { key: 'module', opts: ['Algorithme', 'Analyse 1', 'Base de Données', 'Python', 'Comptabilité'], placeholder: 'Module' },
            { key: 'disponibilite', opts: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'], placeholder: 'Disponibilité' },
            { key: 'format', opts: ['Online', 'Présentiel'], placeholder: 'Format' },
          ].map((f) => (
            <select
              key={f.key}
              value={filters[f.key]}
              onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{f.placeholder}</option>
              {f.opts.map((o) => (
                <option key={o} value={o}>
                  {o === 'Online' ? 'En ligne' : o}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold">{filtered.length}</span> résultats trouvés
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {['Mieux notés', "Plus récents", "Plus d'heures", 'Disponible maintenant'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod) => {
          const tutor = tutors.find((t) => t.id === mod.tutorId);
          return (
            <div key={mod.id} className="card hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{mod.title}</h3>
                  <span className="badge-blue mt-1 inline-block">{mod.level}</span>
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
              <button type="button" onClick={() => navigate(`/modules/${mod.id}`)} className="btn-primary w-full text-sm py-2">
                Demander
              </button>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
