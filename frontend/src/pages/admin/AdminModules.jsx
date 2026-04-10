import { useState, useMemo } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StarRating from '../../components/common/StarRating';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useApp } from '../../context/AppContext';

const STATUS_TABS = ['Tous', 'Publiés', 'En attente'];

/**
 * Administration des modules : approbation, rejet avec confirmation.
 */
export default function AdminModules() {
  const { modules, approveModule, rejectModule } = useApp();
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('Tous');
  const [rejectId, setRejectId] = useState(null);

  const filtered = useMemo(() => {
    return modules.filter((m) => {
      if (statusTab === 'Publiés' && m.status !== 'published') return false;
      if (statusTab === 'En attente' && m.status !== 'pending') return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.tutor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [modules, search, statusTab]);

  const stats = useMemo(() => {
    const pub = modules.filter((m) => m.status === 'published').length;
    const pend = modules.filter((m) => m.status === 'pending').length;
    const cats = new Set(modules.map((m) => m.category)).size;
    return { pub, pend, cats };
  }, [modules]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des Modules</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Consultez et gérez les modules proposés sur la plateforme.</p>
        </div>
        <button type="button" className="btn-primary text-sm py-2 px-4">
          <Plus size={15} /> Ajouter
        </button>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setStatusTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${statusTab === t ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card mb-5 flex gap-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button type="button" className="btn-secondary text-sm py-2 px-4">
          <Filter size={14} /> Filtrer
        </button>
      </div>

      <div className="card p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600">
              <tr>
                {['Module', 'Tuteur', 'Note', 'Catégorie', 'Niveau', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{m.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.tutor}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <StarRating rating={m.score ?? 0} size={11} />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{m.score ?? '—'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{m.reviews ?? 0} avis</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.category}</td>
                  <td className="px-4 py-3">
                    <span className="badge-blue">{m.level}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        m.status === 'published'
                          ? 'badge-green'
                          : m.status === 'pending'
                            ? 'badge-orange'
                            : m.status === 'rejected'
                              ? 'badge-red'
                              : 'badge-gray'
                      }
                    >
                      {m.status === 'published' ? 'Publié' : m.status === 'pending' ? 'En attente' : m.status === 'rejected' ? 'Rejeté' : m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {m.status === 'pending' && (
                        <>
                          <button type="button" onClick={() => approveModule(m.id)} className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700">
                            Approuver
                          </button>
                          <button type="button" onClick={() => setRejectId(m.id)} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200">
                            Rejeter
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 grid grid-cols-4 gap-4 text-center text-xs">
          {[
            { val: String(stats.pub), label: 'Modules publiés', color: 'text-green-600 dark:text-green-400' },
            { val: String(stats.pend), label: 'En attente', color: 'text-orange-500' },
            { val: String(stats.cats), label: 'Catégories', color: 'text-blue-600 dark:text-blue-400' },
            { val: '98%', label: "Taux d'acceptation", color: 'text-primary-600' },
          ].map((s) => (
            <div key={s.label}>
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-gray-400 dark:text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={rejectId != null}
        onCancel={() => setRejectId(null)}
        onConfirm={() => {
          if (rejectId != null) rejectModule(rejectId);
          setRejectId(null);
        }}
        title="Rejeter ce module ?"
        message="Le tuteur sera notifié (démo : notification globale uniquement)."
        confirmLabel="Rejeter"
        danger
      />
    </DashboardLayout>
  );
}
