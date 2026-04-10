import { useMemo, useState } from 'react';
import { ClipboardList, UserMinus, AlertOctagon, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

const catLabel = (c) => (c === 'absence' ? 'Absence' : c === 'disciplinary' ? 'Discipline' : 'Autre');

export default function AdminSignalements() {
  const {
    incidents,
    convocations,
    students,
    registerAdminAbsenceFromIncident,
    conveneStudentFromIncident,
    adminResolveJustification,
  } = useApp();
  const { showToast } = useToast();
  const [adminNote, setAdminNote] = useState({});

  const openIncidents = useMemo(() => incidents.filter((i) => i.status === 'open'), [incidents]);
  const pendingJustifications = useMemo(
    () => convocations.filter((c) => c.status === 'awaiting_admin'),
    [convocations],
  );

  const strikesByStudent = useMemo(() => {
    const m = {};
    students.forEach((s) => {
      m[s.id] = s.registeredAbsences ?? 0;
    });
    return m;
  }, [students]);

  const onRegisterAbsence = (id) => {
    const ok = registerAdminAbsenceFromIncident(id);
    if (ok) showToast('Absence enregistrée. Notifications envoyées selon le barème (1–2 / 3).', 'success');
    else showToast('Action impossible (signalement introuvable ou déjà traité).', 'error');
  };

  const onConvene = (id) => {
    const ok = conveneStudentFromIncident(id);
    if (ok) showToast('Convocation créée. L’étudiant a reçu une notification verrouillée.', 'success');
    else showToast('Utilisez « Enregistrer l’absence » pour les signalements de type absence.', 'error');
  };

  const onResolve = (convocationId, accepted) => {
    const note = adminNote[convocationId]?.trim() || '';
    const ok = adminResolveJustification(convocationId, accepted, note || undefined);
    if (ok) {
      showToast(accepted ? 'Justification acceptée — alerte levée.' : 'Justification refusée.', 'success');
      setAdminNote((prev) => ({ ...prev, [convocationId]: '' }));
    } else showToast('Traitement impossible.', 'error');
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Signalements & absences</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
          Traitez les signalements des enseignants : pour une <strong>absence</strong>, enregistrez l’absence (1–2 → simple
          notification ; 3 → convocation). Pour la <strong>discipline</strong> ou un <strong>autre</strong> problème concernant
          l’élève, convoquez directement. Les notifications restent actives jusqu’à traitement de la justification.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
          <ClipboardList size={16} aria-hidden />
          Signalements ouverts ({openIncidents.length})
        </h2>
        {openIncidents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-6">Aucun signalement en attente.</p>
        ) : (
          <div className="space-y-3">
            {openIncidents.map((inc) => (
              <div
                key={inc.id}
                className="card dark:bg-gray-800 dark:border-gray-700 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="badge-blue text-[10px]">{catLabel(inc.category)}</span>
                    <span className="text-xs text-gray-400">#{inc.id}</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{inc.studentName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Signalé par {inc.tutorName} — {inc.issueLabel}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{inc.sessionSummary}</p>
                  {inc.description ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">&quot;{inc.description}&quot;</p>
                  ) : null}
                  <p className="text-xs text-gray-400 mt-2">
                    Absences déjà enregistrées (admin) pour cet étudiant :{' '}
                    <strong>{strikesByStudent[inc.studentId] ?? 0}</strong>
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {inc.category === 'absence' ? (
                    <button type="button" onClick={() => onRegisterAbsence(inc.id)} className="btn-primary text-sm py-2 whitespace-nowrap">
                      <UserMinus size={14} className="inline mr-1" aria-hidden />
                      Enregistrer l&apos;absence
                    </button>
                  ) : (
                    <button type="button" onClick={() => onConvene(inc.id)} className="btn-primary text-sm py-2 whitespace-nowrap">
                      <AlertOctagon size={14} className="inline mr-1" aria-hidden />
                      Convoquer l&apos;étudiant
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
          Justifications à traiter ({pendingJustifications.length})
        </h2>
        {pendingJustifications.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-6">Aucune justification en attente de validation.</p>
        ) : (
          <div className="space-y-4">
            {pendingJustifications.map((c) => (
              <div key={c.id} className="card dark:bg-gray-800 dark:border-gray-700 space-y-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{c.studentName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Convocation #{c.id} —{' '}
                      {c.reason === 'absence_threshold'
                        ? 'Seuil d’absences (3)'
                        : c.reason === 'disciplinary'
                          ? 'Discipline'
                          : 'Autre'}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Texte de l’étudiant</p>
                  {c.studentJustification}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Note admin (optionnelle, visible si refus)
                  </label>
                  <textarea
                    rows={2}
                    value={adminNote[c.id] ?? ''}
                    onChange={(e) => setAdminNote((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    className="input-field resize-none text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    placeholder="Motif du refus, précisions…"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onResolve(c.id, true)}
                    className="btn-primary text-sm py-2 inline-flex items-center gap-1"
                  >
                    <Check size={16} aria-hidden />
                    Valider (lever l’alerte)
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolve(c.id, false)}
                    className="btn-secondary text-sm py-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center gap-1"
                  >
                    <X size={16} aria-hidden />
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
