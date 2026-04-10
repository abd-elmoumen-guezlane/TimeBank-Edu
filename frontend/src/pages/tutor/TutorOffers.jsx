import { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  PencilLine,
  Calendar,
  Clock,
  BookOpen,
  Megaphone,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

const TIME_PRESETS = ['09h - 11h', '10h - 12h', '14h - 16h', '16h - 18h', '18h - 20h'];
const MODULE_PRESETS_LIST = ['Algorithme', 'Analyse 1', 'Algèbre', 'Base de Données', 'Python', 'Java', 'Comptabilité', 'Physique', 'Chimie'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const MODULE_FORMATS = ['En ligne', 'Présentiel', 'Les deux'];

function isoDateToFr(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const emptyForm = () => ({
  moduleTitle: '',
  moduleLevel: '',
  moduleFormat: 'En ligne',
  linkedModuleId: '',
  title: '',
  description: '',
  durationHours: 2,
  published: true,
  slots: [],
  newDateIso: '',
  newTime: TIME_PRESETS[1],
});

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    primary: 'from-primary-500/10 to-teal-500/5 text-primary-700 dark:text-primary-300 border-primary-200/60 dark:border-primary-800/50',
    slate: 'from-slate-500/10 to-gray-500/5 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/50',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-800 dark:text-amber-200 border-amber-200/60 dark:border-amber-800/50',
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${tones[tone] || tones.slate}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm">
          <Icon size={20} strokeWidth={2} className="opacity-90" aria-hidden />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Publications d’offres : le tuteur définit les créneaux ; l’étudiant n’en ajoute pas.
 */
export default function TutorOffers() {
  const {
    currentUser,
    modules,
    courseOffers,
    addCourseOffer,
    updateCourseOffer,
    deleteCourseOffer,
    toggleCourseOfferPublished,
    addModule,
    updateModule,
  } = useApp();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const moduleTitleOptions = useMemo(() => {
    const s = new Set(MODULE_PRESETS_LIST);
    if (form.moduleTitle) s.add(form.moduleTitle);
    return [...s];
  }, [form.moduleTitle]);

  const myOffers = useMemo(() => courseOffers.filter((o) => o.tutorId === currentUser?.id), [courseOffers, currentUser?.id]);

  const totalSlots = useMemo(() => myOffers.reduce((acc, o) => acc + o.slots.length, 0), [myOffers]);
  const visibleCount = useMemo(() => myOffers.filter((o) => o.published !== false).length, [myOffers]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const startEdit = (o) => {
    const mod = modules.find((m) => m.id === o.moduleId);
    setEditingId(o.id);
    setForm({
      moduleTitle: mod?.title || '',
      moduleLevel: mod?.level || '',
      moduleFormat: mod?.format === 'Présentiel' ? 'Présentiel' : 'En ligne',
      linkedModuleId: String(o.moduleId),
      title: o.title,
      description: o.description || '',
      durationHours: o.durationHours ?? 2,
      published: o.published !== false,
      slots: o.slots.map((s) => ({ ...s })),
      newDateIso: '',
      newTime: TIME_PRESETS[1],
    });
  };

  const addSlotRow = () => {
    const d = isoDateToFr(form.newDateIso);
    if (!d) {
      showToast('Choisissez une date dans le calendrier.', 'error');
      return;
    }
    setForm((f) => ({
      ...f,
      slots: [...f.slots, { id: `tmp-${Date.now()}`, date: d, time: f.newTime }],
      newDateIso: '',
    }));
  };

  const removeSlotRow = (slotId) => {
    setForm((f) => ({ ...f, slots: f.slots.filter((s) => s.id !== slotId) }));
  };

  const saveOffer = (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'tutor') return;
    const titleM = form.moduleTitle.trim();
    const levelM = form.moduleLevel.trim();
    if (!titleM || !levelM) {
      showToast('Indiquez la matière et le niveau du module.', 'error');
      return;
    }
    if (!form.title.trim()) {
      showToast('Donnez un titre à l’offre.', 'error');
      return;
    }
    if (form.slots.length === 0) {
      showToast('Ajoutez au moins un créneau disponible.', 'error');
      return;
    }
    const fmt = form.moduleFormat === 'Présentiel' ? 'Présentiel' : 'Online';
    const scheduleSummary =
      form.slots.length > 0
        ? `Créneaux : ${form.slots.map((s) => `${s.date} ${s.time}`).join(' · ')}`
        : 'À convenir';

    let moduleId;
    if (editingId) {
      moduleId = Number(form.linkedModuleId);
      if (!moduleId) {
        showToast('Offre invalide (module lié manquant).', 'error');
        return;
      }
      const existingMod = modules.find((m) => m.id === moduleId);
      updateModule(moduleId, {
        title: titleM,
        level: levelM,
        format: fmt,
        category: currentUser?.filiere || existingMod?.category || 'Général',
        schedule: scheduleSummary,
      });
    } else {
      const same = modules.find(
        (m) =>
          m.tutorId === currentUser.id &&
          m.title === titleM &&
          m.level === levelM
      );
      if (same) {
        moduleId = same.id;
        updateModule(moduleId, {
          title: titleM,
          level: levelM,
          format: fmt,
          category: currentUser?.filiere || same.category || 'Général',
          schedule: scheduleSummary,
        });
      } else {
        const newId = addModule({
          title: titleM,
          level: levelM,
          tutor: currentUser.name || 'Tuteur',
          tutorId: currentUser.id,
          category: currentUser?.filiere || 'Général',
          format: fmt,
          schedule: scheduleSummary,
          icon: '⟨⟩',
          color: 'bg-primary-100 text-primary-700',
        });
        if (!newId) {
          showToast('Impossible de créer le module.', 'error');
          return;
        }
        moduleId = newId;
      }
    }

    const payload = {
      tutorId: currentUser.id,
      moduleId,
      title: form.title.trim(),
      description: form.description.trim(),
      durationHours: Number(form.durationHours) || 2,
      published: form.published,
      slots: form.slots.map(({ date, time, id }) => ({ id: String(id).startsWith('tmp-') ? undefined : id, date, time })),
    };
    if (editingId) {
      updateCourseOffer(editingId, payload);
      showToast('Offre et module mis à jour.', 'success');
    } else {
      addCourseOffer(payload);
      showToast('Offre publiée (module soumis ou mis à jour).', 'success');
    }
    resetForm();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* En-tête (style d’origine) */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-primary-50 via-white to-slate-50 px-6 py-8 shadow-sm dark:border-gray-700 dark:from-primary-950/30 dark:via-gray-900 dark:to-gray-900 sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-500/10" aria-hidden />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-white/70 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm dark:border-primary-800/50 dark:bg-gray-800/80 dark:text-primary-300">
                <Sparkles size={14} aria-hidden />
                Réservations étudiants
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">Mes offres de cours</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Publiez des créneaux précis. Les étudiants <strong className="font-semibold text-gray-800 dark:text-gray-200">choisissent un seul horaire</strong> parmi ceux que vous proposez — sans ajouter de date libre.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Megaphone} label="Offres" value={myOffers.length} tone="primary" />
          <StatCard icon={Calendar} label="Créneaux proposés" value={totalSlots} tone="slate" />
          <StatCard icon={Eye} label="Visibles aux étudiants" value={visibleCount} tone="amber" />
        </div>

        <div className="grid items-start gap-8 xl:grid-cols-12">
          {/* Liste — à gauche sur xl, sous le formulaire sur mobile */}
          <section className="order-2 xl:order-1 xl:col-span-7">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vos offres actives</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aperçu des publications et créneaux restants.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {myOffers.length} offre{myOffers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {myOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 text-center dark:border-gray-600 dark:bg-gray-800/30">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                  <Layers size={32} strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Aucune offre pour l’instant</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                  Complétez le formulaire pour publier votre première série de créneaux.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {myOffers.map((o) => {
                  const mod = modules.find((m) => m.id === o.moduleId);
                  return (
                    <li
                      key={o.id}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex border-l-4 border-primary-500">
                        <div className="min-w-0 flex-1 p-5 sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{o.title}</h3>
                              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                  <BookOpen size={12} aria-hidden />
                                  {mod ? `${mod.title} — ${mod.level}` : `Module #${o.moduleId}`}
                                </span>
                                <span className="hidden sm:inline" aria-hidden>
                                  ·
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock size={12} aria-hidden />
                                  {o.durationHours} h / séance
                                </span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const wasVisible = o.published !== false;
                                toggleCourseOfferPublished(o.id);
                                if (editingId === o.id) {
                                  setForm((f) => ({ ...f, published: !wasVisible }));
                                }
                                showToast(
                                  wasVisible
                                    ? 'Offre masquée — les étudiants ne la voient plus.'
                                    : 'Offre visible — les étudiants peuvent réserver un créneau.',
                                  'success'
                                );
                              }}
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                o.published !== false
                                  ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80 hover:bg-emerald-200/80 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-800/50'
                                  : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600'
                              }`}
                              title={o.published !== false ? 'Cliquer pour masquer l’offre' : 'Cliquer pour rendre l’offre visible'}
                            >
                              {o.published !== false ? (
                                <>
                                  <Eye size={12} aria-hidden />
                                  Visible
                                </>
                              ) : (
                                <>
                                  <EyeOff size={12} aria-hidden />
                                  Masquée
                                </>
                              )}
                            </button>
                          </div>
                          {o.description ? (
                            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{o.description}</p>
                          ) : null}
                          <div className="mt-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                              Créneaux ({o.slots.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {o.slots.map((s) => (
                                <span
                                  key={s.id}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                                >
                                  <Calendar size={12} className="opacity-60" aria-hidden />
                                  {s.date}
                                  <span className="text-gray-400 dark:text-gray-500">·</span>
                                  {s.time}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                            <button
                              type="button"
                              onClick={() => startEdit(o)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-primary-700 dark:hover:bg-primary-950/40"
                            >
                              <PencilLine size={14} aria-hidden />
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Supprimer définitivement cette offre ?')) {
                                  deleteCourseOffer(o.id);
                                  if (editingId === o.id) resetForm();
                                  showToast('Offre supprimée.', 'success');
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                            >
                              <Trash2 size={14} aria-hidden />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Formulaire — en premier sur mobile, à droite sur xl */}
          <aside className="order-1 xl:order-2 xl:col-span-5 xl:sticky xl:top-24">
            <form
              onSubmit={saveOffer}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/80">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? (
                    <>
                      <PencilLine size={20} className="text-primary-600" aria-hidden />
                      Modifier l’offre
                    </>
                  ) : (
                    <>
                      <Plus size={20} className="text-primary-600" aria-hidden />
                      Nouvelle offre
                    </>
                  )}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Matière et format du module, puis détail de l’offre et créneaux précis (pas de jours fixes — les dates sont dans les créneaux).
                </p>
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">1. Module</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Matière</label>
                      <select
                        value={form.moduleTitle}
                        onChange={(e) => setForm((f) => ({ ...f, moduleTitle: e.target.value }))}
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="">Sélectionner…</option>
                        {moduleTitleOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Niveau</label>
                      <select
                        value={form.moduleLevel}
                        onChange={(e) => setForm((f) => ({ ...f, moduleLevel: e.target.value }))}
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="">Choisir…</option>
                        {NIVEAUX.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Format du cours</label>
                    <select
                      value={form.moduleFormat}
                      onChange={(e) => setForm((f) => ({ ...f, moduleFormat: e.target.value }))}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white max-w-xs"
                    >
                      {MODULE_FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Le planning est défini par les <strong className="font-medium text-gray-700 dark:text-gray-300">créneaux</strong> ci-dessous (section 3), pas par des jours récurrents.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">2. Contenu de l’offre</p>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre de l’offre</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="ex. Algorithme L2 — révisions ciblées"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="font-normal text-gray-400">(optionnel)</span></label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="input-field resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Objectifs, prérequis, format…"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Durée par séance</label>
                    <select
                      value={form.durationHours}
                      onChange={(e) => setForm((f) => ({ ...f, durationHours: Number(e.target.value) }))}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white max-w-xs"
                    >
                      <option value={1}>1 heure</option>
                      <option value={2}>2 heures</option>
                      <option value={3}>3 heures</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">3. Créneaux (dates & horaires)</p>
                  <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4 dark:border-primary-900/40 dark:bg-primary-950/20">
                    <div className="mb-3 flex items-start gap-2">
                      <Calendar size={18} className="mt-0.5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Calendrier des disponibilités</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Ajoutez chaque date et horaire ; ils apparaîtront tels quels pour les étudiants.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="min-w-[160px] flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="offer-slot-date">
                          Date
                        </label>
                        <input
                          id="offer-slot-date"
                          type="date"
                          value={form.newDateIso}
                          onChange={(e) => setForm((f) => ({ ...f, newDateIso: e.target.value }))}
                          className="input-field w-full min-h-[42px] text-sm [color-scheme:light] dark:bg-gray-800 dark:[color-scheme:dark]"
                        />
                      </div>
                      <div className="min-w-[150px]">
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Horaire</label>
                        <select
                          value={form.newTime}
                          onChange={(e) => setForm((f) => ({ ...f, newTime: e.target.value }))}
                          className="input-field text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          {TIME_PRESETS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="button" onClick={addSlotRow} className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium">
                        <Plus size={16} aria-hidden />
                        Ajouter
                      </button>
                    </div>
                    {form.slots.length > 0 ? (
                      <ul className="mt-4 space-y-2 border-t border-primary-100/80 pt-4 dark:border-primary-900/40">
                        {form.slots.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200/80 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800/90"
                          >
                            <span className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">
                              <Clock size={15} className="text-primary-500" aria-hidden />
                              {s.date} · {s.time}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSlotRow(s.id)}
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                              aria-label="Retirer le créneau"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 border-t border-primary-100/80 pt-4 text-center text-xs text-gray-500 dark:border-primary-900/40 dark:text-gray-400">
                        Aucun créneau — utilisez le calendrier ci-dessus.
                      </p>
                    )}
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700/30">
                  <input
                    type="checkbox"
                    checked={form.published !== false}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Visible sur la plateforme</span>
                    <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">Les étudiants peuvent voir cette offre et réserver un créneau.</span>
                  </span>
                </label>

                <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 dark:border-gray-700 sm:flex-row">
                  <button type="submit" className="btn-primary inline-flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold">
                    {editingId ? (
                      <>
                        <PencilLine size={18} aria-hidden />
                        Enregistrer les modifications
                      </>
                    ) : (
                      <>
                        <Megaphone size={18} aria-hidden />
                        Publier l’offre
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="btn-secondary px-6 py-3 text-sm font-medium">
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
