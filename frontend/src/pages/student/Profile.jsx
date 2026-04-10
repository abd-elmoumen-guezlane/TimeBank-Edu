import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  BookOpen,
  Calendar,
  Plus,
  X,
  GraduationCap,
  Star,
  Clock,
  Settings,
  PencilLine,
  Phone,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import ProfilePhotoSection from '../../components/common/ProfilePhotoSection';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

const allModules = ['Algorithme', 'Python', 'Base de Données', 'Structure de Données', 'IA', 'Analyse 1', 'Algèbre'];
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];
const FILIERES = ['Informatique', 'Mathématiques', 'Gestion', 'Physique', 'Autre'];

const recentActivity = [
  { Icon: BookOpen, text: 'Séance avec Ahmed Moussa', sub: 'Algorithme — L2', date: '15/05/2024' },
  { Icon: BookOpen, text: 'Séance avec Lina Farah', sub: 'Analyse 1 — L1', date: '08/05/2024' },
  { Icon: Star, text: 'Évaluation donnée', sub: 'Ahmed Moussa', date: '05/05/2024' },
];

function splitName(full) {
  const p = (full || '').trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return { nom: '', prenom: '' };
  if (p.length === 1) return { nom: '', prenom: p[0] };
  return { prenom: p[0], nom: p.slice(1).join(' ') };
}

function defaultMastered(u) {
  return u?.masteredModules || ['Algorithme', 'Python', 'Base de Données', 'Structure de Données', 'IA'];
}

export default function Profile() {
  const { currentUser, updateProfile } = useApp();
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [masteredModules, setMasteredModules] = useState(() => defaultMastered(currentUser));
  const [draft, setDraft] = useState({
    prenom: '',
    nom: '',
    email: '',
    phone: '',
    level: 'L2',
    filiere: 'Informatique',
    bio: '',
  });
  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setMasteredModules(defaultMastered(currentUser));
    const { nom, prenom } = splitName(currentUser.name);
    setDraft({
      nom: nom || '',
      prenom: prenom || currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      level: currentUser.level || 'L2',
      filiere: currentUser.filiere || 'Informatique',
      bio: currentUser.bio || '',
    });
  }, [currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.phone, currentUser?.level, currentUser?.filiere, currentUser?.bio, currentUser?.masteredModules]);

  const syncDraftFromUser = useCallback(() => {
    if (!currentUser) return;
    const { nom, prenom } = splitName(currentUser.name);
    setDraft({
      nom: nom || '',
      prenom: prenom || currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      level: currentUser.level || 'L2',
      filiere: currentUser.filiere || 'Informatique',
      bio: currentUser.bio || '',
    });
    setMasteredModules(defaultMastered(currentUser));
  }, [currentUser]);

  const snapshot = useMemo(
    () =>
      JSON.stringify({
        ...draft,
        masteredModules: [...masteredModules].sort(),
      }),
    [draft, masteredModules]
  );

  const isDirty = baseline !== null && snapshot !== baseline;

  const openEdit = () => {
    const mods = defaultMastered(currentUser);
    const { nom, prenom } = splitName(currentUser?.name);
    const nextDraft = {
      nom: nom || '',
      prenom: prenom || currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      level: currentUser?.level || 'L2',
      filiere: currentUser?.filiere || 'Informatique',
      bio: currentUser?.bio || '',
    };
    setDraft(nextDraft);
    setMasteredModules(mods);
    setBaseline(JSON.stringify({ ...nextDraft, masteredModules: [...mods].sort() }));
    setShowModulePicker(false);
    setEditOpen(true);
  };

  const requestCloseEdit = () => {
    if (isDirty) {
      const ok = window.confirm('Des modifications non enregistrées seront perdues. Fermer quand même ?');
      if (!ok) return;
    }
    setEditOpen(false);
    setBaseline(null);
    syncDraftFromUser();
  };

  const saveProfile = () => {
    const name = [draft.prenom, draft.nom].filter(Boolean).join(' ').trim();
    if (!name) {
      showToast('Indiquez au moins votre prénom ou votre nom.', 'error');
      return;
    }
    updateProfile({
      name,
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      level: draft.level,
      filiere: draft.filiere.trim() || 'Informatique',
      bio: draft.bio.trim(),
      masteredModules: [...masteredModules],
    });
    showToast('Profil mis à jour.', 'success');
    setEditOpen(false);
    setBaseline(null);
  };

  const addMastered = (m) => {
    if (!masteredModules.includes(m)) setMasteredModules((prev) => [...prev, m]);
    setShowModulePicker(false);
  };

  const displayBio =
    currentUser?.bio?.trim() || "Passionné(e) par l'apprentissage — complétez votre bio pour que les tuteurs vous connaissent mieux.";

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-teal-900 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-teal-400/20 blur-2xl" />

          <div className="relative px-5 pt-8 pb-28 sm:px-8 sm:pt-10 sm:pb-32">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8">
              <div className="relative shrink-0">
                <div className="rounded-full bg-white/15 p-1.5 ring-2 ring-white/40 backdrop-blur-sm shadow-lg">
                  <Avatar
                    initials={currentUser?.avatar || '?'}
                    src={currentUser?.avatarPhoto}
                    size="xl"
                    alt={currentUser?.name || ''}
                  />
                </div>
                <span
                  className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400 shadow-sm"
                  title="Profil actif"
                  aria-hidden
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium text-white/95 backdrop-blur-sm">
                  <Sparkles size={12} className="opacity-90" aria-hidden />
                  Étudiant
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{currentUser?.name || '—'}</h1>
                <p className="mt-1 text-sm text-white/85">
                  {currentUser?.level || 'L2'} <span className="text-white/50">·</span> {currentUser?.filiere || 'Informatique'}
                </p>
                <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80 sm:mx-0 mx-auto">{displayBio}</p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={openEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-md transition hover:bg-white/95"
                  >
                    <PencilLine size={18} strokeWidth={2} />
                    Modifier le profil
                  </button>
                  <Link
                    to="/student/settings"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <Settings size={18} />
                    Paramètres
                    <ChevronRight size={16} className="opacity-80" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-[1] -mt-20 px-1 sm:px-0">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Solde',
                value: `${currentUser?.balance ?? 0}h`,
                hint: 'Heures disponibles',
                icon: Clock,
                tone: 'from-amber-500/15 to-orange-500/10 text-amber-700 dark:text-amber-300',
              },
              {
                label: 'Score',
                value: String(currentUser?.score ?? '—'),
                hint:
                  currentUser?.reviews != null
                    ? `${currentUser.reviews} avis · moyenne`
                    : 'Moyenne communauté',
                icon: Star,
                tone: 'from-yellow-500/20 to-amber-500/10 text-yellow-700 dark:text-yellow-300',
                star: true,
              },
              {
                label: 'Tutorats',
                value: String(currentUser?.tutorialsReceived ?? 0),
                hint: 'Séances complétées',
                icon: BookOpen,
                tone: 'from-sky-500/15 to-blue-500/10 text-sky-700 dark:text-sky-300',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone}`}>
                  <s.icon size={22} className={s.star ? 'fill-current' : ''} strokeWidth={s.star ? 1.5 : 2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">{s.value}</p>
                  {s.label === 'Score' && currentUser?.score != null && Number(currentUser.score) > 0 && (
                    <div className="mt-1.5">
                      <StarRating rating={Number(currentUser.score)} size={14} />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">À propos</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{currentUser?.bio?.trim() || displayBio}</p>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Coordonnées</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" aria-hidden />
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white break-all">{currentUser?.email || '—'}</dd>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" aria-hidden />
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Téléphone</dt>
                    <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{currentUser?.phone || '—'}</dd>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl bg-gray-50 p-4 sm:col-span-2 dark:bg-gray-900/50">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" aria-hidden />
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Membre depuis</dt>
                    <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{currentUser?.joinedDate || '—'}</dd>
                  </div>
                </div>
              </dl>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Modules maîtrisés</h2>
                <button
                  type="button"
                  onClick={openEdit}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Modifier
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Array.isArray(currentUser?.masteredModules) ? currentUser.masteredModules : defaultMastered(currentUser)).map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activité récente</h2>
                <Link to="/student/historique" className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
                  Historique
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {recentActivity.map((a, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-gray-50 p-3 dark:border-gray-700/80">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      <a.Icon size={18} strokeWidth={2} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{a.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{a.sub}</p>
                    </div>
                    <time className="shrink-0 text-xs text-gray-400">{a.date}</time>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Modal wide title="Modifier le profil" isOpen={editOpen} onClose={requestCloseEdit}>
        <div className="max-h-[min(78vh,640px)] space-y-6 overflow-y-auto pr-1 text-gray-800 dark:text-gray-200">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Toutes les modifications sont enregistrées localement (démo). La photo reste sur cet appareil.
          </p>

          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-900/40">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Photo</p>
            <ProfilePhotoSection size="lg" variant="row" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Prénom</label>
              <input
                type="text"
                value={draft.prenom}
                onChange={(e) => setDraft((d) => ({ ...d, prenom: e.target.value }))}
                className="input-field dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Nom</label>
              <input
                type="text"
                value={draft.nom}
                onChange={(e) => setDraft((d) => ({ ...d, nom: e.target.value }))}
                className="input-field dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              className="input-field dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Téléphone</label>
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              className="input-field dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              autoComplete="tel"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Filière</label>
              <select
                value={draft.filiere}
                onChange={(e) => setDraft((d) => ({ ...d, filiere: e.target.value }))}
                className="input-field dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {FILIERES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Niveau</label>
              <select
                value={draft.level}
                onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value }))}
                className="input-field dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Bio</label>
            <textarea
              rows={4}
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
              maxLength={280}
              className="input-field resize-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Quelques mots sur vos intérêts et objectifs…"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{draft.bio.length}/280</p>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-600">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Modules maîtrisés</span>
              <button
                type="button"
                onClick={() => setShowModulePicker((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400"
              >
                <Plus size={14} /> Ajouter
              </button>
            </div>
            {showModulePicker && (
              <select
                className="input-field mt-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) addMastered(e.target.value);
                  e.target.value = '';
                }}
              >
                <option value="" disabled>
                  Choisir un module…
                </option>
                {allModules.filter((m) => !masteredModules.includes(m)).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {masteredModules.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                >
                  {m}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-primary-100 dark:hover:bg-primary-800/50"
                    onClick={() => setMasteredModules((prev) => prev.filter((x) => x !== m))}
                    aria-label={`Retirer ${m}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white pt-4 dark:border-gray-600 dark:bg-gray-800 sm:flex-row sm:justify-end">
            <button type="button" onClick={requestCloseEdit} className="btn-secondary py-2.5 text-sm dark:border-primary-500 dark:text-primary-400">
              Annuler
            </button>
            <button type="button" onClick={saveProfile} className="btn-primary py-2.5 text-sm">
              Enregistrer le profil
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
