import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Check, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import { useApp } from '../../context/AppContext';

const tabs = ['Toutes', 'En attente', 'Confirmées', 'Terminées', 'Annulées'];

/**
 * Demandes envoyées par l’étudiant connecté (état synchronisé avec AppContext).
 */
export default function MyRequests() {
  const navigate = useNavigate();
  const { currentUser, requests, tutors } = useApp();
  const [activeTab, setActiveTab] = useState('Toutes');
  const [view, setView] = useState('sent');

  const mine = useMemo(() => {
    if (view !== 'sent') return [];
    return requests.filter((r) => r.fromId === currentUser?.id);
  }, [requests, currentUser?.id, view]);

  const filtered = useMemo(() => {
    return mine.filter((r) => {
      if (activeTab === 'En attente') return r.status === 'pending';
      if (activeTab === 'Confirmées') return r.status === 'confirmed';
      if (activeTab === 'Terminées') return r.status === 'completed';
      if (activeTab === 'Annulées') return r.status === 'cancelled';
      return true;
    });
  }, [mine, activeTab]);

  const statusBadge = (status) => {
    if (status === 'pending') return <span className="badge-orange">En attente</span>;
    if (status === 'confirmed') return <span className="badge-green">Confirmée</span>;
    if (status === 'completed') return <span className="badge-blue">Terminée</span>;
    if (status === 'cancelled') return <span className="badge-red">Annulée</span>;
    return null;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Mes Réservations</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez vos demandes et réservations de tutorat.</p>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-5 max-w-xs">
        {['sent', 'received'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all ${view === v ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-500'}`}
          >
            {v === 'sent' ? 'Demandes Envoyées' : 'Demandes Reçues'}
          </button>
        ))}
      </div>

      {view === 'received' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Les étudiants ne reçoivent pas de demandes dans cette démo.</p>
      )}

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
        {view === 'sent' &&
          filtered.map((req) => {
            const tutorT = tutors.find((t) => t.id === req.toId);
            return (
            <div key={req.id} className="card flex flex-col sm:flex-row sm:items-center gap-4 dark:bg-gray-800 dark:border-gray-700">
              <Avatar initials={(req.toName || 'TU').split(' ').map((w) => w[0]).join('')} size="md" color="blue" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">Vers {req.toName || 'Tuteur'}</span>
                  {statusBadge(req.status)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{req.module}</p>
                {tutorT && (
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={tutorT.score ?? 0} size={11} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{tutorT.score}</span>
                    <span className="text-xs text-gray-400">({tutorT.reviews ?? 0} avis)</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {req.date} • {req.time} • {req.duration}h
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {req.status === 'confirmed' && (
                  <button type="button" className="flex items-center gap-1 bg-primary-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                    <Check size={13} /> Démarrer
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Écrire à ${req.toName || 'le tuteur'}`}
                  onClick={() => navigate('/student/chat', { state: { openWithId: req.toId } })}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <MessageCircle size={14} className="text-gray-500" />
                </button>
              </div>
            </div>
          );
          })}
        {view === 'sent' && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucune demande dans cette catégorie</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">Les annulations peuvent recréditer votre solde (côté tuteur refus).</p>
    </DashboardLayout>
  );
}
