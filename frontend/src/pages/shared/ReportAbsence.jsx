import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';

const steps = ['Séance', 'Détails', 'Confirmation'];

const STUDENT_ISSUES = [
  { id: 'no_show', label: 'Absence non justifiée', desc: "Le tuteur ne s'est pas présenté et n'a pas prévenu." },
  { id: 'late', label: 'Retard important', desc: 'Le tuteur est arrivé avec plus de 30 minutes de retard.' },
  { id: 'behavior', label: 'Comportement inapproprié', desc: 'Le tuteur a eu un comportement inapproprié.' },
  { id: 'other', label: 'Autre problème', desc: 'Décrivez brièvement le problème.' },
];

const TUTOR_ISSUES = [
  { id: 'student_no_show', label: 'Étudiant absent', desc: "L'étudiant ne s'est pas connecté ou ne s'est pas présenté." },
  { id: 'technical', label: 'Problème technique', desc: 'Connexion, audio, vidéo ou outil de la plateforme.' },
  { id: 'behavior', label: 'Comportement inapproprié', desc: "Comportement de l'étudiant inadapté pendant la séance." },
  { id: 'other', label: 'Autre problème', desc: 'Décrivez brièvement le problème.' },
];

const statusLabel = (status) => {
  if (status === 'completed') return 'Terminée';
  if (status === 'in_progress') return 'En cours';
  if (status === 'confirmed') return 'Confirmée';
  return status || '—';
};

export default function ReportAbsence() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessions, currentUser, addNotification, addIncidentFromTutorReport } = useApp();

  const navState = location.state;
  const sessionIdFromNav = navState?.sessionId != null ? Number(navState.sessionId) : null;

  const sessionRow = useMemo(() => {
    if (sessionIdFromNav != null && !Number.isNaN(sessionIdFromNav)) {
      return sessions.find((s) => s.id === sessionIdFromNav) ?? null;
    }
    if (!currentUser) return null;
    if (currentUser.role === 'student') {
      return [...sessions].reverse().find((s) => s.studentId === currentUser.id) ?? sessions.find((s) => s.studentId === currentUser.id) ?? null;
    }
    if (currentUser.role === 'tutor') {
      return [...sessions].reverse().find((s) => s.tutorId === currentUser.id) ?? sessions.find((s) => s.tutorId === currentUser.id) ?? null;
    }
    return null;
  }, [sessionIdFromNav, sessions, currentUser]);

  const reporterRole = navState?.reporterRole === 'tutor' || navState?.reporterRole === 'student'
    ? navState.reporterRole
    : currentUser?.role === 'tutor'
      ? 'tutor'
      : 'student';

  const issueTypes = reporterRole === 'tutor' ? TUTOR_ISSUES : STUDENT_ISSUES;

  const [step, setStep] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState(STUDENT_ISSUES[0].id);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const resolvedIssueId = issueTypes.find((i) => i.id === selectedIssue)?.id ?? issueTypes[0].id;

  const dashboardPath =
    currentUser?.role === 'tutor' ? '/tutor/dashboard' : currentUser?.role === 'student' ? '/student/tutorats' : '/';

  const handleSubmit = () => {
    if (!sessionRow) return;
    const label = issueTypes.find((i) => i.id === resolvedIssueId)?.label ?? resolvedIssueId;
    const summary = `${sessionRow.module} • ${sessionRow.date} • ${sessionRow.time}`;
    if (reporterRole === 'tutor') {
      addIncidentFromTutorReport({
        studentId: sessionRow.studentId,
        tutorId: sessionRow.tutorId,
        sessionId: sessionRow.id,
        sessionSummary: summary,
        tutorIssueId: resolvedIssueId,
        issueLabel: label,
        description,
        reporterRole: 'tutor',
      });
    } else {
      const who = currentUser?.name || 'Étudiant';
      addNotification({
        type: 'message',
        text: `Signalement (${who}, étudiant) : ${label} — ${sessionRow.module} (#${sessionRow.id}).`,
        recipientRole: 'admin',
      });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Signalement envoyé !</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Votre signalement a été transmis à l&apos;administration. Vous serez notifié de la suite.
          </p>
          <button type="button" onClick={() => navigate(dashboardPath)} className="btn-primary px-8 py-2.5">
            Retour au tableau de bord
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!sessionRow) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Aucune séance à associer à ce signalement. Utilisez le bouton « Signaler un problème » depuis l&apos;écran de fin de
            séance, ou vérifiez que vous avez au moins une séance dans votre espace.
          </p>
          <button type="button" className="btn-primary" onClick={() => navigate(dashboardPath)}>
            Retour
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const sessionSummaryLine = `${sessionRow.module} • ${sessionRow.date} • ${sessionRow.time}`;

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Signaler un problème</h1>
      </div>

      <div className="flex items-center gap-2 mb-8 max-w-md">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i + 1 <= step ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
            >
              {i + 1 < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs ${i + 1 === step ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-lg space-y-4">
        {step === 1 && (
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Séance concernée</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  {reporterRole === 'tutor' ? sessionRow.student : sessionRow.tutor}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sessionSummaryLine}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {reporterRole === 'tutor' ? 'Avec vous en tant que tuteur' : 'Avec ce tuteur'}
                </p>
              </div>
              <span className="badge-blue shrink-0">{statusLabel(sessionRow.status)}</span>
            </div>
            <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-4 py-2.5">
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card space-y-3 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Type de problème</h3>
            {issueTypes.map((issue) => (
              <label
                key={issue.id}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all dark:border-gray-700 ${
                  resolvedIssueId === issue.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/25'
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="issue"
                  value={issue.id}
                  checked={resolvedIssueId === issue.id}
                  onChange={() => setSelectedIssue(issue.id)}
                  className="mt-1 accent-primary-600"
                />
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{issue.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{issue.desc}</p>
                </div>
              </label>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (optionnel)</label>
              <textarea
                rows={3}
                placeholder="Ajoutez des détails pour aider l'administrateur…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                className="input-field resize-none dark:bg-gray-900/50 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-2.5">
                Retour
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 py-2.5">
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card space-y-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Votre signalement sera examiné par l&apos;administration. Vous serez notifié de la suite.
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm">
              <p className="font-medium text-gray-800 dark:text-gray-100">Récapitulatif :</p>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{sessionSummaryLine}</p>
              <p className="text-gray-600 dark:text-gray-300">
                {reporterRole === 'tutor' ? `Étudiant : ${sessionRow.student}` : `Tuteur : ${sessionRow.tutor}`}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Type : {issueTypes.find((i) => i.id === resolvedIssueId)?.label}</p>
              {description ? <p className="text-gray-500 dark:text-gray-400 mt-1 italic">&quot;{description}&quot;</p> : null}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-2.5">
                Retour
              </button>
              <button type="button" onClick={handleSubmit} className="btn-primary flex-1 py-2.5">
                Envoyer le signalement
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
