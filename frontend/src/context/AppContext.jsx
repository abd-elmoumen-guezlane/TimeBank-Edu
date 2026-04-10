import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getStoredAvatarPhoto, setStoredAvatarPhoto } from '../utils/profilePhoto';
import { pickMessage, SUPPORTED_LOCALES } from '../i18n/messages';
import { notificationVisibleForUser } from '../utils/notificationVisibility';

const AppContext = createContext(null);

const LOCALE_STORAGE_KEY = 'timebank_locale';
const DARK_STORAGE_KEY = 'timebank_dark';

function readStoredLocale() {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (v && SUPPORTED_LOCALES.includes(v)) return v;
  } catch {
    /* ignore */
  }
  return 'fr';
}

function readStoredDark() {
  try {
    return localStorage.getItem(DARK_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Copie superficielle d’un tableau d’objets (état mutable). */
const clone = (arr) => arr.map((x) => ({ ...x }));

export const mockStudents = [
  { id: 1, name: 'Sara Benali', email: 'sara.benali@univ.dz', role: 'student', level: 'L2', filiere: 'Informatique', balance: 3, score: 4.7, tutorialsReceived: 12, avatar: 'SB', bio: "Passionnée par les algorithmes et l'IA.", joinedDate: 'Mars 2024', masteredModules: ['Algorithme', 'Python', 'Base de Données', 'Structure de Données', 'IA'], phone: '+213 555 12 34 56', registeredAbsences: 0 },
  { id: 2, name: 'Ali Karim', email: 'ali.karim@univ.dz', role: 'student', level: 'L1', filiere: 'Gestion', balance: 5, score: 4.2, tutorialsReceived: 8, avatar: 'AK', joinedDate: 'Jan 2024', registeredAbsences: 0 },
];

export const mockTutors = [
  { id: 3, name: 'Ahmed Moussa', email: 'ahmed.moussa@univ.dz', role: 'tutor', level: 'L2', filiere: 'Informatique', balance: 8, score: 4.8, hoursGiven: 24, reviews: 23, avatar: 'AM', disponible: true, bio: "Passionné par l'enseignement et l'algorithmique.", experience: '3 ans de tutorat', successRate: '95%', modules: ['Algorithme', 'Python'], teachingModules: ['Algorithme', 'Python'], joinedDate: 'Janvier 2024', format: 'Online', availabilities: ['Lun 18h', 'Mer 14h', 'Ven 16h'] },
  { id: 4, name: 'Lina Farah', email: 'lina.farah@univ.dz', role: 'tutor', level: 'L1', filiere: 'Mathématiques', balance: 6, score: 4.6, hoursGiven: 15, reviews: 15, avatar: 'LF', disponible: true, bio: 'Enseignante passionnée en mathématiques.', experience: '2 ans', successRate: '90%', modules: ['Analyse 1', 'Algèbre'], format: 'Présentiel', availabilities: ['Mar 10h', 'Jeu 14h'] },
  { id: 5, name: 'Yassine K.', email: 'yassine.k@univ.dz', role: 'tutor', level: 'L1', filiere: 'Comptabilité', balance: 10, score: 4.9, hoursGiven: 31, reviews: 31, avatar: 'YK', disponible: true, bio: 'Expert en comptabilité et gestion.', experience: '4 ans', successRate: '97%', modules: ['Comptabilité', 'Python'], format: 'Online', availabilities: ['Lun 16h', 'Mer 10h'] },
  { id: 6, name: 'Fatima Zahra', email: 'fatima.zahra@univ.dz', role: 'tutor', level: 'L3', filiere: 'Informatique', balance: 5, score: 4.5, hoursGiven: 18, reviews: 18, avatar: 'FZ', disponible: true, bio: 'Spécialiste en base de données.', experience: '2 ans', successRate: '92%', modules: ['Base de Données', 'SQL'], format: 'Online', availabilities: ['Mar 14h', 'Jeu 14h'] },
];

export const mockModules = [
  { id: 1, title: 'Algorithme', level: 'L2', tutor: 'Ahmed Moussa', tutorId: 3, category: 'Informatique', score: 4.8, reviews: 23, format: 'Online', schedule: 'Lun, Mer, Ven 18h-20h', status: 'published', icon: '</>', color: 'bg-blue-100 text-blue-600' },
  { id: 2, title: 'Analyse 1', level: 'L1', tutor: 'Lina Farah', tutorId: 4, category: 'Mathématiques', score: 4.6, reviews: 15, format: 'Présentiel', schedule: 'Mar, Jeu 10h-12h', status: 'published', icon: '∫', color: 'bg-purple-100 text-purple-600' },
  { id: 3, title: 'Base de Données', level: 'L3', tutor: 'Fatima Zahra', tutorId: 6, category: 'Informatique', score: 4.5, reviews: 18, format: 'Présentiel', schedule: 'Mar, Jeu 14h-16h', status: 'published', icon: '⬡', color: 'bg-cyan-100 text-cyan-600' },
  { id: 4, title: 'Comptabilité', level: 'L1', tutor: 'Yassine K.', tutorId: 5, category: 'Gestion', score: 4.9, reviews: 31, format: 'Online', schedule: 'Lun 16h-18h', status: 'published', icon: '$', color: 'bg-green-100 text-green-600' },
  { id: 5, title: 'Python', level: 'L2', tutor: 'Ahmed Moussa', tutorId: 3, category: 'Informatique', score: 4.7, reviews: 20, format: 'Online', schedule: 'Mar, Jeu 18h-20h', status: 'published', icon: 'py', color: 'bg-yellow-100 text-yellow-600' },
  { id: 6, title: 'Structures de Données', level: 'L2', tutor: 'Lina Farah', tutorId: 4, category: 'Informatique', score: 4.4, reviews: 12, format: 'Présentiel', schedule: 'Mer 14h-16h', status: 'pending', icon: '⟨⟩', color: 'bg-red-100 text-red-600' },
];

export const mockSessions = [
  { id: 1, tutor: 'Ahmed Moussa', tutorId: 3, student: 'Sara Benali', studentId: 1, module: 'Algorithme L2', date: '15/05/2024', time: '10h-12h', duration: 2, status: 'completed', type: 'given' },
  { id: 2, tutor: 'Lina Farah', tutorId: 4, student: 'Sara Benali', studentId: 1, module: 'Analyse 1 L1', date: '08/05/2024', time: '14h-15h', duration: 1, status: 'in_progress', type: 'given' },
  { id: 3, tutor: 'Fatima Zahra', tutorId: 6, student: 'Sara Benali', studentId: 1, module: 'Base de Données L3', date: '20/05/2024', time: '16h-19h', duration: 3, status: 'confirmed', type: 'given' },
];

export const mockRequests = [
  { id: 1, from: 'Sara Benali', fromId: 1, toId: 3, toName: 'Ahmed Moussa', module: 'Algorithme L2', date: '15/05/2024', time: '10h-12h', duration: 2, status: 'pending', score: 4.7, message: 'Je suis intéressé par ce créneau.' },
  { id: 2, from: 'Ali Karim', fromId: 2, toId: 3, toName: 'Ahmed Moussa', module: 'Base de Données L3', date: '16/05/2024', time: '14h-15h', duration: 1, status: 'pending', score: 4.2, message: '' },
  { id: 3, from: 'Lina Farah', fromId: 4, toId: 3, toName: 'Ahmed Moussa', module: 'Analyse 1 L1', date: '20/05/2024', time: '16h-19h', duration: 3, status: 'confirmed', score: 4.6, message: '' },
];

export const mockNotifications = [
  { id: 1, type: 'request', text: 'Ali Karim a demandé une session de Base de Données.', time: 'Il y a 2 min', read: false },
  { id: 2, type: 'confirmed', text: 'Votre session avec Lina Farah a été confirmée.', time: 'Il y a 30 min', read: false },
  { id: 3, type: 'message', text: 'Ahmed Moussa vous a envoyé un message.', time: 'Il y a 1h', read: true },
  { id: 4, type: 'reminder', text: 'Rappel de session : Votre session débute dans 1 heure.', time: 'Il y a 2h', read: true },
  { id: 5, type: 'evaluation', text: 'Sara Benali a évalué votre tutorat.', time: 'Il y a 1 jour', read: true },
];

export const mockMessages = [
  { id: 1, sender: 'Ahmed Moussa', senderId: 3, text: "Bonjour! J'ai une question sur les arbres binaires.", time: '10:30', mine: false },
  { id: 2, sender: 'Sara Benali', senderId: 1, text: 'Bonjour Sara! Bien sûr, posez votre question.', time: '10:31', mine: true },
  { id: 3, sender: 'Ahmed Moussa', senderId: 3, text: 'Pouvez-vous m\'expliquer la différence entre DFS et BFS ?', time: '10:32', mine: false },
  { id: 4, sender: 'Sara Benali', senderId: 1, text: 'Oui, je peux vous expliquer ça pendant notre séance.', time: '10:35', mine: true },
  { id: 5, sender: 'Ahmed Moussa', senderId: 3, text: 'Parfait, à demain à 10h!', time: '10:36', mine: false },
];

/** Offres publiées par les tuteurs : créneaux fixés par l’enseignant (l’étudiant en choisit un seul). */
export const mockCourseOffers = [
  {
    id: 1,
    tutorId: 3,
    moduleId: 1,
    title: 'Algorithme L2 — séances proposées',
    description: 'Révisions, complexité et exercices.',
    durationHours: 2,
    published: true,
    slots: [
      { id: 'o1-s1', date: '22/05/2024', time: '10h - 12h' },
      { id: 'o1-s2', date: '24/05/2024', time: '14h - 16h' },
      { id: 'o1-s3', date: '28/05/2024', time: '18h - 20h' },
    ],
  },
  {
    id: 2,
    tutorId: 3,
    moduleId: 5,
    title: 'Python L2',
    description: 'Bases et projets courts.',
    durationHours: 2,
    published: true,
    slots: [
      { id: 'o2-s1', date: '21/05/2024', time: '18h - 20h' },
      { id: 'o2-s2', date: '23/05/2024', time: '10h - 12h' },
    ],
  },
  {
    id: 3,
    tutorId: 4,
    moduleId: 2,
    title: 'Analyse 1 L1',
    description: 'Suivi et TD.',
    durationHours: 1,
    published: true,
    slots: [
      { id: 'o3-s1', date: '25/05/2024', time: '10h - 12h' },
      { id: 'o3-s2', date: '27/05/2024', time: '14h - 15h' },
    ],
  },
  {
    id: 4,
    tutorId: 6,
    moduleId: 3,
    title: 'Base de données L3',
    description: 'SQL et modélisation.',
    durationHours: 3,
    published: true,
    slots: [{ id: 'o4-s1', date: '26/05/2024', time: '14h - 17h' }],
  },
];

/** Signalements enseignants en attente de traitement admin. */
export const mockIncidents = [];

/** Convocations / justifications (absences 3×, discipline, etc.). */
export const mockConvocations = [];

function nextId(list) {
  return Math.max(0, ...list.map((x) => x.id)) + 1;
}

export function AppProvider({ children }) {
  const [students, setStudents] = useState(() => clone(mockStudents));
  const [tutors, setTutors] = useState(() => clone(mockTutors));
  const [modules, setModules] = useState(() => clone(mockModules));
  const modulesRef = useRef(modules);
  modulesRef.current = modules;
  const [sessions, setSessions] = useState(() => clone(mockSessions));
  const [requests, setRequests] = useState(() => clone(mockRequests));
  const [notifications, setNotifications] = useState(() => clone(mockNotifications));
  const [messages, setMessages] = useState(() => clone(mockMessages));
  const [courseOffers, setCourseOffers] = useState(() => clone(mockCourseOffers));
  const [incidents, setIncidents] = useState(() => clone(mockIncidents));
  const [convocations, setConvocations] = useState(() => clone(mockConvocations));

  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkModeState] = useState(readStoredDark);
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setDarkMode = useCallback((value) => {
    setDarkModeState(value);
    try {
      localStorage.setItem(DARK_STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((next) => {
    const v = SUPPORTED_LOCALES.includes(next) ? next : 'fr';
    setLocaleState(v);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key) => pickMessage(locale, key), [locale]);

  const studentsRef = useRef(students);
  const tutorsRef = useRef(tutors);
  const requestsRef = useRef(requests);
  const currentUserRef = useRef(currentUser);
  const incidentsRef = useRef(incidents);
  const convocationsRef = useRef(convocations);
  studentsRef.current = students;
  tutorsRef.current = tutors;
  requestsRef.current = requests;
  currentUserRef.current = currentUser;
  incidentsRef.current = incidents;
  convocationsRef.current = convocations;

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.lang = locale === 'ar' ? 'ar' : locale === 'en' ? 'en' : 'fr';
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const login = useCallback((email, role) => {
    if (role === 'student') {
      const list = studentsRef.current;
      const raw = list.find((s) => !s.suspended) || list[0];
      if (!raw) {
        setCurrentUser(null);
        return;
      }
      const stored = getStoredAvatarPhoto(raw.id);
      const u = stored ? { ...raw, avatarPhoto: stored } : { ...raw };
      setCurrentUser(u);
      if (stored) setStudents((prev) => prev.map((s) => (s.id === u.id ? { ...s, avatarPhoto: stored } : s)));
    } else if (role === 'tutor') {
      const list = tutorsRef.current;
      const raw = list.find((t) => !t.suspended) || list[0];
      if (!raw) {
        setCurrentUser(null);
        return;
      }
      const stored = getStoredAvatarPhoto(raw.id);
      const u = stored ? { ...raw, avatarPhoto: stored } : { ...raw };
      setCurrentUser(u);
      if (stored) setTutors((prev) => prev.map((t) => (t.id === u.id ? { ...t, avatarPhoto: stored } : t)));
    } else if (role === 'admin') {
      setCurrentUser({ id: 99, name: 'Admin', role: 'admin', avatar: 'AD' });
    }
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  const markNotifRead = useCallback((id) => {
    const u = currentUserRef.current;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        if (n.locked) return n;
        if (!notificationVisibleForUser(n, u)) return n;
        return { ...n, read: true };
      }),
    );
  }, []);

  const markAllNotifRead = useCallback(() => {
    const u = currentUserRef.current;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.locked) return n;
        if (!notificationVisibleForUser(n, u)) return n;
        return { ...n, read: true };
      }),
    );
  }, []);

  const updateProfile = useCallback((updates) => {
    const prev = currentUserRef.current;
    if (!prev) return;
    const next = { ...prev, ...updates };
    if (typeof updates.name === 'string' && updates.name.trim()) {
      const parts = updates.name.trim().split(/\s+/).filter(Boolean);
      next.avatar = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase() || prev.avatar;
    }
    if ('avatarPhoto' in updates) {
      const ph = updates.avatarPhoto;
      setStoredAvatarPhoto(prev.id, ph || null);
      if (ph) next.avatarPhoto = ph;
      else delete next.avatarPhoto;
    }
    const uid = prev.id;
    setCurrentUser(next);
    setStudents((sp) =>
      sp.map((s) =>
        s.id === uid
          ? {
              ...s,
              ...updates,
              avatar: next.avatar ?? s.avatar,
              name: next.name ?? s.name,
              email: next.email ?? s.email,
              phone: next.phone ?? s.phone,
              filiere: next.filiere ?? s.filiere,
              level: next.level ?? s.level,
              bio: next.bio ?? s.bio,
              avatarPhoto: 'avatarPhoto' in updates ? (updates.avatarPhoto || undefined) : s.avatarPhoto,
            }
          : s
      )
    );
    setTutors((tp) =>
      tp.map((t) =>
        t.id === uid
          ? {
              ...t,
              ...updates,
              avatar: next.avatar ?? t.avatar,
              name: next.name ?? t.name,
              email: next.email ?? t.email,
              phone: next.phone ?? t.phone,
              filiere: next.filiere ?? t.filiere,
              level: next.level ?? t.level,
              bio: next.bio ?? t.bio,
              joinedDate: next.joinedDate ?? t.joinedDate,
              teachingModules: next.teachingModules ?? t.teachingModules,
              modules: next.modules ?? t.modules,
              avatarPhoto: 'avatarPhoto' in updates ? (updates.avatarPhoto || undefined) : t.avatarPhoto,
            }
          : t
      )
    );
  }, []);

  /** Retire des heures du solde (étudiant ou tuteur). */
  const deductBalance = useCallback((userId, hours) => {
    const h = Number(hours);
    if (!Number.isFinite(h) || h <= 0) return;
    setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, balance: Math.max(0, (s.balance ?? 0) - h) } : s)));
    setTutors((prev) => prev.map((t) => (t.id === userId ? { ...t, balance: Math.max(0, (t.balance ?? 0) - h) } : t)));
    setCurrentUser((u) => (u?.id === userId ? { ...u, balance: Math.max(0, (u.balance ?? 0) - h) } : u));
  }, []);

  /**
   * Crédite des heures : pour un tuteur, incrémente aussi hoursGiven (récompense après séance).
   * Pour un étudiant, augmente seulement balance.
   */
  const creditBalance = useCallback((userId, hours) => {
    const h = Number(hours);
    if (!Number.isFinite(h) || h <= 0) return;
    setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, balance: (s.balance ?? 0) + h } : s)));
    setTutors((prev) =>
      prev.map((t) =>
        t.id === userId
          ? { ...t, balance: (t.balance ?? 0) + h, hoursGiven: (t.hoursGiven ?? 0) + h }
          : t
      )
    );
    setCurrentUser((u) => {
      if (u?.id !== userId) return u;
      if (u.role === 'tutor') return { ...u, balance: (u.balance ?? 0) + h, hoursGiven: (u.hoursGiven ?? 0) + h };
      return { ...u, balance: (u.balance ?? 0) + h };
    });
  }, []);

  /** Ajoute des heures sans modifier hoursGiven (remboursement, cadeau admin). */
  const addHoursToUser = useCallback((userId, hours) => {
    const h = Number(hours);
    if (!Number.isFinite(h) || h <= 0) return;
    setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, balance: (s.balance ?? 0) + h } : s)));
    setTutors((prev) => prev.map((t) => (t.id === userId ? { ...t, balance: (t.balance ?? 0) + h } : t)));
    setCurrentUser((u) => (u?.id === userId ? { ...u, balance: (u.balance ?? 0) + h } : u));
  }, []);

  const addNotification = useCallback((n) => {
    setNotifications((prev) => {
      const id = nextId(prev);
      return [{ id, read: false, time: n.time ?? "À l'instant", ...n }, ...prev];
    });
  }, []);

  /** Signalement déposé par un enseignant (flux ReportAbsence). */
  const addIncidentFromTutorReport = useCallback(
    (payload) => {
      const { studentId, tutorId, sessionId, sessionSummary, tutorIssueId, issueLabel, description, reporterRole } = payload;
      if (reporterRole !== 'tutor' || studentId == null) return null;

      let category = 'other';
      if (tutorIssueId === 'student_no_show') category = 'absence';
      else if (tutorIssueId === 'behavior') category = 'disciplinary';

      const student = studentsRef.current.find((s) => s.id === studentId);
      const tutor = tutorsRef.current.find((t) => t.id === tutorId);
      const prev = incidentsRef.current;
      const id = nextId(prev);
      const row = {
        id,
        studentId,
        studentName: student?.name ?? 'Étudiant',
        tutorId,
        tutorName: tutor?.name ?? 'Tuteur',
        sessionId,
        sessionSummary: sessionSummary ?? '',
        category,
        issueKey: tutorIssueId,
        issueLabel: issueLabel ?? '',
        description: description || '',
        status: 'open',
        createdAt: new Date().toLocaleString('fr-FR'),
      };
      const nextInc = [...prev, row];
      incidentsRef.current = nextInc;
      setIncidents(nextInc);

      const catLabel = category === 'absence' ? 'absence' : category === 'disciplinary' ? 'discipline' : 'autre';
      addNotification({
        type: 'message',
        text: `Nouveau signalement (${catLabel}) — ${row.studentName} : ${row.issueLabel}. À traiter dans Signalements & absences.`,
        recipientRole: 'admin',
      });
      return id;
    },
    [addNotification],
  );

  /** Admin : enregistre une absence (signalement type absence) — notif 1–2, convocation si 3. */
  const registerAdminAbsenceFromIncident = useCallback(
    (incidentId) => {
      const inc = incidentsRef.current.find((i) => i.id === incidentId);
      if (!inc || inc.status !== 'open' || inc.category !== 'absence') return false;

      const studentId = inc.studentId;
      const prevStrikes = studentsRef.current.find((s) => s.id === studentId)?.registeredAbsences ?? 0;
      const newStrikes = prevStrikes + 1;

      setStudents((prev) =>
        prev.map((x) => (x.id === studentId ? { ...x, registeredAbsences: newStrikes } : x)),
      );
      setCurrentUser((u) =>
        u?.id === studentId && u.role === 'student' ? { ...u, registeredAbsences: newStrikes } : u,
      );

      const closed = incidentsRef.current.map((i) => (i.id === incidentId ? { ...i, status: 'closed' } : i));
      incidentsRef.current = closed;
      setIncidents(closed);

      if (newStrikes < 3) {
        addNotification({
          type: 'reminder',
          text: `Une absence a été enregistrée à votre suite (${newStrikes}/3). À la 3e absence, vous serez convoqué pour justification.`,
          recipientUserId: studentId,
          locked: false,
        });
        return true;
      }

      const prevC = convocationsRef.current;
      const cid = nextId(prevC);
      const conv = {
        id: cid,
        studentId,
        studentName: inc.studentName,
        reason: 'absence_threshold',
        incidentId: inc.id,
        status: 'awaiting_student',
        studentJustification: null,
        adminDecision: null,
        adminNote: null,
        createdAt: new Date().toLocaleString('fr-FR'),
      };
      const nextC = [...prevC, conv];
      convocationsRef.current = nextC;
      setConvocations(nextC);

      addNotification({
        type: 'convocation',
        text: '3e absence enregistrée : vous êtes convoqué(e). Déposez votre justification dans Discipline & absences. Cette alerte reste active jusqu’à décision de l’administration.',
        recipientUserId: studentId,
        locked: true,
        convocationId: cid,
      });
      return true;
    },
    [addNotification],
  );

  /** Admin : convoque pour discipline / autre (hors enregistrement simple d’absence). */
  const conveneStudentFromIncident = useCallback(
    (incidentId) => {
      const inc = incidentsRef.current.find((i) => i.id === incidentId);
      if (!inc || inc.status !== 'open') return false;
      if (inc.category === 'absence') return false;

      const studentId = inc.studentId;
      const prevC = convocationsRef.current;
      const cid = nextId(prevC);
      const conv = {
        id: cid,
        studentId,
        studentName: inc.studentName,
        reason: inc.category === 'disciplinary' ? 'disciplinary' : 'other',
        incidentId: inc.id,
        status: 'awaiting_student',
        studentJustification: null,
        adminDecision: null,
        adminNote: null,
        createdAt: new Date().toLocaleString('fr-FR'),
      };
      const nextC = [...prevC, conv];
      convocationsRef.current = nextC;
      setConvocations(nextC);

      const closed = incidentsRef.current.map((i) => (i.id === incidentId ? { ...i, status: 'closed' } : i));
      incidentsRef.current = closed;
      setIncidents(closed);

      addNotification({
        type: 'convocation',
        text:
          inc.category === 'disciplinary'
            ? 'Convocation : un problème disciplinaire vous concerne. Déposez vos explications dans Discipline & absences. L’alerte reste active jusqu’à traitement administratif.'
            : 'Convocation suite à un signalement vous concernant. Déposez une réponse dans Discipline & absences. L’alerte reste active jusqu’à traitement administratif.',
        recipientUserId: studentId,
        locked: true,
        convocationId: cid,
      });
      return true;
    },
    [addNotification],
  );

  /** Étudiant : dépose la justification (levée d’alerte après validation admin uniquement). */
  const submitConvocationJustification = useCallback(
    (convocationId, text) => {
      const conv = convocationsRef.current.find((c) => c.id === convocationId);
      if (!conv || conv.status !== 'awaiting_student') return false;
      const justText = (text || '').trim();
      if (!justText) return false;

      const next = convocationsRef.current.map((c) =>
        c.id === convocationId
          ? { ...c, studentJustification: justText, status: 'awaiting_admin' }
          : c,
      );
      convocationsRef.current = next;
      setConvocations(next);

      addNotification({
        type: 'message',
        text: `${conv.studentName} a déposé une justification (convocation #${convocationId}). Traitez-la dans Signalements & absences.`,
        recipientRole: 'admin',
      });
      return true;
    },
    [addNotification],
  );

  /** Admin : accepte ou refuse la justification — lève les notifications verrouillées liées. */
  const adminResolveJustification = useCallback(
    (convocationId, accepted, adminNote) => {
      const conv = convocationsRef.current.find((c) => c.id === convocationId);
      if (!conv || conv.status !== 'awaiting_admin') return false;

      const decision = accepted ? 'accepted' : 'rejected';
      const nextC = convocationsRef.current.map((c) =>
        c.id === convocationId
          ? { ...c, status: 'closed', adminDecision: decision, adminNote: adminNote || null }
          : c,
      );
      convocationsRef.current = nextC;
      setConvocations(nextC);

      setNotifications((prev) =>
        prev.map((n) =>
          n.convocationId === convocationId && n.recipientUserId === conv.studentId
            ? { ...n, locked: false, read: true }
            : n,
        ),
      );

      if (accepted && conv.reason === 'absence_threshold') {
        setStudents((prev) =>
          prev.map((s) => (s.id === conv.studentId ? { ...s, registeredAbsences: 0 } : s)),
        );
        setCurrentUser((u) =>
          u?.id === conv.studentId && u.role === 'student' ? { ...u, registeredAbsences: 0 } : u,
        );
      }

      addNotification({
        type: 'confirmed',
        text: accepted
          ? 'Votre justification a été acceptée. L’alerte est levée.'
          : `Votre justification n’a pas été acceptée.${adminNote ? ` Motif : ${adminNote}` : ''}`,
        recipientUserId: conv.studentId,
        locked: false,
      });
      return true;
    },
    [addNotification],
  );

  const acceptRequest = useCallback(
    (requestId) => {
      const req = requestsRef.current.find((r) => r.id === requestId);
      if (!req || req.status !== 'pending') return false;
      const tutor = tutorsRef.current.find((t) => t.id === req.toId);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'confirmed' } : r)));
      setSessions((prev) => {
        const id = nextId(prev);
        return [
          ...prev,
          {
            id,
            tutor: tutor?.name || req.toName || 'Tuteur',
            tutorId: req.toId,
            student: req.from,
            studentId: req.fromId,
            module: req.module,
            date: req.date,
            time: req.time,
            duration: req.duration,
            status: 'confirmed',
            type: 'given',
          },
        ];
      });
      addNotification({
        type: 'confirmed',
        text: `${tutor?.name || 'Le tuteur'} a accepté la demande de ${req.from} (${req.module}).`,
      });
      return true;
    },
    [addNotification]
  );

  const rejectRequest = useCallback(
    (requestId) => {
      const req = requestsRef.current.find((r) => r.id === requestId);
      if (!req || req.status !== 'pending') return false;
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r)));
      addHoursToUser(req.fromId, req.duration);
      if (req.offerId && req.slotSnapshot) {
        setCourseOffers((prev) =>
          prev.map((o) => {
            if (o.id !== req.offerId) return o;
            if (o.slots.some((s) => s.id === req.slotSnapshot.id)) return o;
            return { ...o, slots: [...o.slots, req.slotSnapshot] };
          })
        );
      }
      addNotification({
        type: 'message',
        text: `Votre demande (${req.module}) a été refusée — ${req.duration}h ont été recréditées.`,
      });
      return true;
    },
    [addHoursToUser, addNotification]
  );

  const completeSession = useCallback((sessionId) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: 'completed' } : s)));
  }, []);

  const updateTutorScore = useCallback((tutorId, newRating) => {
    const r = Number(newRating);
    if (!Number.isFinite(r) || r < 1 || r > 5) return;
    const apply = (t) => {
      const reviews = t.reviews ?? 0;
      const old = t.score ?? 0;
      const newScore = reviews > 0 ? (old * reviews + r) / (reviews + 1) : r;
      return { ...t, score: Math.round(newScore * 10) / 10, reviews: reviews + 1 };
    };
    setTutors((prev) => prev.map((t) => (t.id === tutorId ? apply(t) : t)));
    setCurrentUser((u) => (u?.id === tutorId && u.role === 'tutor' ? apply(u) : u));
  }, []);

  const addRequest = useCallback((partial) => {
    setRequests((prev) => {
      const id = nextId(prev);
      return [...prev, { status: 'pending', score: partial.score ?? 5, message: '', ...partial, id }];
    });
  }, []);

  const addModule = useCallback((mod) => {
    const prev = modulesRef.current;
    const id = nextId(prev);
    const next = [...prev, { status: 'pending', reviews: 0, score: 0, ...mod, id }];
    modulesRef.current = next;
    setModules(next);
    return id;
  }, []);

  const addCourseOffer = useCallback((partial) => {
    setCourseOffers((prev) => {
      const id = nextId(prev);
      const { slots: rawSlots, ...rest } = partial;
      const slots = (rawSlots || []).map((s) => ({
        id: s.id || `slot-${id}-${Math.random().toString(36).slice(2, 9)}`,
        date: s.date,
        time: s.time,
      }));
      return [
        ...prev,
        {
          published: true,
          description: '',
          slots,
          ...rest,
          id,
        },
      ];
    });
  }, []);

  const updateCourseOffer = useCallback((offerId, patch) => {
    setCourseOffers((prev) =>
      prev.map((o) => {
        if (o.id !== offerId) return o;
        const next = { ...o, ...patch };
        if (patch.slots) {
          next.slots = patch.slots.map((s) => ({
            id: s.id || `slot-${offerId}-${Math.random().toString(36).slice(2, 9)}`,
            date: s.date,
            time: s.time,
          }));
        }
        return next;
      })
    );
  }, []);

  const deleteCourseOffer = useCallback((offerId) => {
    setCourseOffers((prev) => prev.filter((o) => o.id !== offerId));
  }, []);

  /** Bascule la visibilité d’une offre (étudiants : filtre sur published === true). */
  const toggleCourseOfferPublished = useCallback((offerId) => {
    setCourseOffers((prev) =>
      prev.map((o) => {
        if (o.id !== offerId) return o;
        const visible = o.published !== false;
        return { ...o, published: !visible };
      })
    );
  }, []);

  /** Retire un créneau de l’offre lorsque l’étudiant envoie une demande (réinjecté si refus). */
  const reserveOfferSlot = useCallback((offerId, slotId) => {
    setCourseOffers((prev) =>
      prev.map((o) => {
        if (o.id !== offerId) return o;
        return { ...o, slots: o.slots.filter((s) => s.id !== slotId) };
      })
    );
  }, []);

  const approveModule = useCallback((moduleId) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId && m.status === 'pending' ? { ...m, status: 'published' } : m)));
  }, []);

  const rejectModule = useCallback((moduleId) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, status: 'rejected' } : m)));
  }, []);

  /** Supprime un module et les offres de cours liées (démo locale). */
  const deleteModule = useCallback((moduleId) => {
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    setCourseOffers((prev) => prev.filter((o) => o.moduleId !== moduleId));
  }, []);

  const updateModule = useCallback((moduleId, patch) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)));
  }, []);

  const suspendUser = useCallback((userId, reason) => {
    setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, suspended: true, suspendReason: reason } : s)));
    setTutors((prev) => prev.map((t) => (t.id === userId ? { ...t, suspended: true, suspendReason: reason } : t)));
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout,
    darkMode,
    setDarkMode,
    locale,
    setLocale,
    t,
    students,
    tutors,
    modules,
    courseOffers,
    sessions,
    requests,
    notifications,
    messages,
    setMessages,
    markNotifRead,
    markAllNotifRead,
    updateProfile,
    deductBalance,
    creditBalance,
    addHoursToUser,
    acceptRequest,
    rejectRequest,
    completeSession,
    updateTutorScore,
    addRequest,
    addNotification,
    addModule,
    addCourseOffer,
    updateCourseOffer,
    deleteCourseOffer,
    toggleCourseOfferPublished,
    reserveOfferSlot,
    approveModule,
    rejectModule,
    deleteModule,
    updateModule,
    suspendUser,
    incidents,
    convocations,
    addIncidentFromTutorReport,
    registerAdminAbsenceFromIncident,
    conveneStudentFromIncident,
    submitConvocationJustification,
    adminResolveJustification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
