import { useMemo, useState } from 'react';
import { ShieldAlert, Send } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

export default function StudentDiscipline() {
  const { convocations, currentUser, submitConvocationJustification } = useApp();
  const { showToast } = useToast();
  const [textById, setTextById] = useState({});

  const mine = useMemo(
    () => convocations.filter((c) => c.studentId === currentUser?.id),
    [convocations, currentUser?.id],
  );
  const toAnswer = useMemo(() => mine.filter((c) => c.status === 'awaiting_student'), [mine]);
  const waitingAdmin = useMemo(() => mine.filter((c) => c.status === 'awaiting_admin'), [mine]);
  const closed = useMemo(() => mine.filter((c) => c.status === 'closed'), [mine]);

  const submit = (convocationId) => {
    const t = (textById[convocationId] || '').trim();
    if (!t) {
      showToast('Rédigez une justification avant d’envoyer.', 'error');
      return;
    }
    const ok = submitConvocationJustification(convocationId, t);
    if (ok) {
      showToast('Justification envoyée. L’administration doit la valider pour lever l’alerte.', 'success');
      setTextById((prev) => ({ ...prev, [convocationId]: '' }));
    } else showToast('Envoi impossible.', 'error');
  };

  const reasonLabel = (r) =>
    r === 'absence_threshold' ? 'Absences répétées (3e)' : r === 'disciplinary' ? 'Discipline' : 'Autre';

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0" size={22} aria-hidden />
          Discipline & absences
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xl">
          Lorsque l’administration vous convoque, déposez votre justification ici. Tant que l’admin n’a pas validé ou refusé,
          les notifications liées restent actives.
        </p>
      </div>

      {toAnswer.length === 0 && waitingAdmin.length === 0 && closed.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-8">Aucune convocation en cours.</p>
      ) : null}

      {toAnswer.length > 0 ? (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            Réponse attendue
          </h2>
          <div className="space-y-4">
            {toAnswer.map((c) => (
              <div key={c.id} className="card border-amber-200 dark:border-amber-900/50 dark:bg-gray-800">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-semibold mb-1">
                  {reasonLabel(c.reason)} — convocation #{c.id}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Merci de fournir une justification ou des explications pour clôturer ce dossier.
                </p>
                <textarea
                  rows={4}
                  value={textById[c.id] ?? ''}
                  onChange={(e) => setTextById((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="input-field resize-none text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white mb-3"
                  placeholder="Votre justification…"
                />
                <button type="button" onClick={() => submit(c.id)} className="btn-primary text-sm py-2 inline-flex items-center gap-2">
                  <Send size={16} aria-hidden />
                  Envoyer la justification
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {waitingAdmin.length > 0 ? (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            En attente de l’administration
          </h2>
          <ul className="space-y-2">
            {waitingAdmin.map((c) => (
              <li key={c.id} className="card dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">#{c.id}</strong> — {reasonLabel(c.reason)} : votre texte a été
                transmis. L’alerte reste active jusqu’à décision.
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {closed.length > 0 ? (
        <section>
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Historique récent</h2>
          <ul className="space-y-2">
            {closed.slice(-5).reverse().map((c) => (
              <li key={c.id} className="card dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
                #{c.id} — {c.adminDecision === 'accepted' ? 'Accepté' : 'Refusé'}
                {c.adminNote ? ` — ${c.adminNote}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DashboardLayout>
  );
}
