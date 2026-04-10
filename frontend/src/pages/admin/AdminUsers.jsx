import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import { useApp } from '../../context/AppContext';

/**
 * Liste admin étudiants + tuteurs : suspension (motif) et attribution d’heures.
 */
export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const { students, tutors, suspendUser, addHoursToUser } = useApp();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [hoursTarget, setHoursTarget] = useState(null);
  const [hoursInput, setHoursInput] = useState('2');

  const rows = useMemo(() => {
    const s = students.map((u) => ({
      id: u.id,
      name: u.name,
      role: 'Étudiant',
      roleKey: 'student',
      status: u.suspended ? 'Suspendu' : 'Actif',
      date: u.joinedDate || '—',
      avatar: u.avatar,
      balance: u.balance ?? 0,
      score: u.score,
    }));
    const t = tutors.map((u) => ({
      id: u.id,
      name: u.name,
      role: 'Tuteur',
      roleKey: 'tutor',
      status: u.suspended ? 'Suspendu' : 'Actif',
      date: u.joinedDate || '—',
      avatar: u.avatar,
      balance: u.balance ?? 0,
      score: u.score,
      reviews: u.reviews,
    }));
    return [...s, ...t].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, tutors]);

  const filtered = useMemo(() => rows.filter((u) => u.name.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  const suspendedCount = rows.filter((u) => u.status === 'Suspendu').length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez les comptes des étudiants et tuteurs.</p>
        </div>
        <button type="button" className="btn-primary text-sm py-2 px-4">
          <Plus size={15} /> Ajouter
        </button>
      </div>

      <div className="card mb-5 flex flex-col sm:flex-row gap-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
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
                {['Utilisateur', 'Rôle', 'Statut', 'Note', 'Solde', "Date d'inscription", 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map((u) => (
                <tr key={`${u.roleKey}-${u.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={u.avatar} size="sm" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.role === 'Tuteur' ? 'badge-blue' : 'badge-green'}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.status === 'Actif' ? 'badge-green' : 'badge-red'}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.score != null ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <StarRating rating={u.score} size={11} />
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{u.score}</span>
                        </div>
                        {u.reviews != null && <span className="text-[10px] text-gray-400">{u.reviews} avis</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.balance}h</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {u.status === 'Actif' && (
                        <button type="button" onClick={() => setSuspendTarget(u)} className="text-xs border border-orange-200 text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20">
                          Suspendre
                        </button>
                      )}
                      <button type="button" onClick={() => setHoursTarget(u)} className="text-xs border border-primary-200 text-primary-700 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20">
                        Attribuer des heures
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 grid grid-cols-4 gap-4 text-center text-xs">
          {[
            { val: String(rows.length), label: 'Utilisateurs', color: 'text-gray-800 dark:text-gray-200' },
            { val: String(students.length), label: 'Étudiants', color: 'text-primary-600' },
            { val: String(tutors.length), label: 'Tuteurs', color: 'text-blue-600' },
            { val: String(suspendedCount), label: 'Suspendus', color: 'text-red-500' },
          ].map((s) => (
            <div key={s.label}>
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-gray-400 dark:text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!suspendTarget} onClose={() => setSuspendTarget(null)} title="Suspendre l'utilisateur">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Motif (visible en interne dans la démo) :</p>
        <textarea
          className="input-field resize-none mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={3}
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="Ex. non-respect des règles"
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary py-2 text-sm" onClick={() => setSuspendTarget(null)}>
            Annuler
          </button>
          <button
            type="button"
            className="btn-danger py-2 text-sm"
            onClick={() => {
              if (suspendTarget) suspendUser(suspendTarget.id, suspendReason || 'Sans motif');
              setSuspendTarget(null);
              setSuspendReason('');
            }}
          >
            Confirmer la suspension
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!hoursTarget} onClose={() => setHoursTarget(null)} title="Attribuer des heures">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Utilisateur : <strong>{hoursTarget?.name}</strong>
        </p>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nombre d&apos;heures</label>
        <input
          type="number"
          min={1}
          max={50}
          value={hoursInput}
          onChange={(e) => setHoursInput(e.target.value)}
          className="input-field mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary py-2 text-sm" onClick={() => setHoursTarget(null)}>
            Annuler
          </button>
          <button
            type="button"
            className="btn-primary py-2 text-sm"
            onClick={() => {
              const h = Number(hoursInput);
              if (hoursTarget && h > 0) addHoursToUser(hoursTarget.id, h);
              setHoursTarget(null);
              setHoursInput('2');
            }}
          >
            Valider
          </button>
        </div>
      </Modal>

    </DashboardLayout>
  );
}
