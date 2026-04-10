import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, Users, FileText, Send, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import { useApp } from '../../context/AppContext';

const seedMessages = [
  { sender: 'Ahmed', mine: false, text: 'Bonjour ! On va commencer par la fusion des algorithmes de tri.', time: '10:00' },
  { sender: 'Moi', mine: true, text: "Parfait ! J'ai quelques questions sur le quicksort.", time: '10:01' },
  { sender: 'Ahmed', mine: false, text: 'Bien sûr, posez votre question !', time: '10:02' },
];

/**
 * Salle de session : terminer appelle completeSession et redirige vers l’évaluation.
 */
export default function Session() {
  const { id } = useParams();
  const sessionId = Number(id);
  const navigate = useNavigate();
  const { sessions, completeSession, currentUser, tutors } = useApp();

  const session = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  const tutorProfile = useMemo(() => (session ? tutors.find((t) => t.id === session.tutorId) : null), [session, tutors]);

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [message, setMessage] = useState('');
  const [msgs, setMsgs] = useState(seedMessages);
  const [ended, setEnded] = useState(false);

  const tutorInitials = session?.tutor
    ? session.tutor
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'TU';
  const studentInitials = session?.student
    ? session.student
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : currentUser?.avatar || 'ME';

  const sendMsg = () => {
    if (!message.trim()) return;
    setMsgs((prev) => [
      ...prev,
      {
        sender: 'Moi',
        mine: true,
        text: message,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
  };

  const finishSession = () => {
    if (session) completeSession(session.id);
    setEnded(true);
  };

  const goEvaluation = () => {
    navigate(session ? `/evaluation/${session.id}` : '/evaluation/1');
  };

  const goReportProblem = () => {
    if (!session || !currentUser) return;
    const reporterRole =
      currentUser.role === 'tutor' && currentUser.id === session.tutorId ? 'tutor' : 'student';
    navigate('/report-absence', {
      state: { sessionId: session.id, reporterRole },
    });
  };

  if (!session) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16 text-gray-500 dark:text-gray-400">
          <p>Séance introuvable.</p>
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={() => navigate(currentUser?.role === 'tutor' ? '/tutor/dashboard' : '/student/tutorats')}
          >
            {currentUser?.role === 'tutor' ? 'Retour au tableau de bord' : 'Retour aux tutorats'}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isTutorView = currentUser?.role === 'tutor' && session && currentUser.id === session.tutorId;
  const isStudentView = currentUser?.role === 'student' && session && currentUser.id === session.studentId;

  if (ended) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session terminée</h2>
          {isTutorView ? (
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              L&apos;étudiant pourra évaluer la séance depuis son espace. Une fois son avis enregistré, vos heures seront créditées sur votre balance.
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-8">Évaluez la séance pour créditer le tuteur.</p>
          )}

          <div className="card mb-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Avatar initials={studentInitials} size="md" />
                <p className="font-semibold text-sm mt-2 dark:text-white">
                  {isStudentView ? 'Vous' : session?.student ?? 'Étudiant(e)'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Étudiant(e)</p>
                <p className="text-xs text-primary-600 font-medium mt-1">Durée : {session?.duration ?? 2} h</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Module : {session?.module ?? '—'}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Avatar initials={tutorInitials} size="md" color="blue" />
                <p className="font-semibold text-sm mt-2 dark:text-white">
                  {isTutorView ? 'Vous' : session?.tutor ?? 'Tuteur'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tuteur</p>
                <p className="text-xs text-primary-600 font-medium mt-1">Durée : {session?.duration ?? 2} h</p>
              </div>
            </div>
          </div>

          {isTutorView ? (
            <div className="flex flex-col gap-3">
              <button type="button" className="btn-primary py-3" onClick={() => navigate('/tutor/dashboard')}>
                Retour au tableau de bord
              </button>
              <button
                type="button"
                onClick={goReportProblem}
                className="btn-secondary py-3 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Signaler un problème
              </button>
            </div>
          ) : isStudentView ? (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={goEvaluation} className="btn-primary py-3">
                <CheckCircle2 size={16} /> Aller à l&apos;évaluation
              </button>
              <button
                type="button"
                onClick={goReportProblem}
                className="btn-secondary py-3 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Signaler un problème
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button type="button" className="btn-primary py-3" onClick={() => navigate('/')}>
                Retour à l&apos;accueil
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white">Session en cours</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session?.module ?? 'Module'} • {session?.tutor ?? ''}
          </p>
          {tutorProfile && (
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating rating={tutorProfile.score ?? 0} size={11} />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{tutorProfile.score}</span>
              <span className="text-xs text-gray-400">({tutorProfile.reviews ?? 0} avis)</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-red-500 font-medium">En direct</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex-1 bg-gray-900 rounded-2xl relative overflow-hidden min-h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Avatar initials={tutorInitials} size="xl" color="blue" />
                <p className="text-white font-medium mt-2">{session?.tutor ?? 'Tuteur'}</p>
                <p className="text-gray-400 text-sm">En ligne</p>
              </div>
            </div>
            <div className="absolute bottom-3 right-3 w-24 h-16 bg-gray-700 rounded-xl flex items-center justify-center">
              <Avatar initials={studentInitials} size="sm" />
            </div>
            <div className="absolute top-3 left-3 bg-black/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Clock size={13} className="text-white" />
              <span className="text-white text-xs font-mono">00:45:32</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-center gap-3 border border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setMicOn(!micOn)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700' : 'bg-red-500 text-white'}`}>
              {micOn ? <Mic size={18} className="text-gray-600 dark:text-gray-300" /> : <MicOff size={18} />}
            </button>
            <button type="button" onClick={() => setVideoOn(!videoOn)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${videoOn ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700' : 'bg-red-500 text-white'}`}>
              {videoOn ? <Video size={18} className="text-gray-600 dark:text-gray-300" /> : <VideoOff size={18} />}
            </button>
            <button type="button" onClick={finishSession} className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all">
              <PhoneOff size={18} className="text-white" />
            </button>
            <button type="button" className="w-11 h-11 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-full flex items-center justify-center">
              <Users size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Ressources partagées</h4>
            <div className="flex gap-2">
              {['tris.h1.pdf', 'diagrammes.png'].map((f) => (
                <div key={f} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                  <FileText size={12} /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card flex flex-col p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <MessageCircle size={16} className="text-primary-600" />
            <h3 className="font-semibold text-sm dark:text-white">Chat</h3>
          </div>

          <div className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1">Objectifs :</p>
            {['Comprendre le sujet', 'Exercices pratiques', 'Questions / réponses'].map((o, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400">
                <CheckCircle2 size={11} /> {o}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-64 lg:max-h-none">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${m.mine ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.mine ? 'text-primary-200' : 'text-gray-400'} text-right`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              placeholder="Écrire un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
              className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
            <button type="button" onClick={sendMsg} className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center hover:bg-primary-700 flex-shrink-0">
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
