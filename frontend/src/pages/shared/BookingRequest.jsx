import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Clock,
  Calendar,
  User,
  BookOpen,
  AlertTriangle,
  Star,
  Send,
  ChevronDown,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StarRating from '../../components/common/StarRating';
import Avatar from '../../components/common/Avatar';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';

/**
 * Demande de séance : l’étudiant choisit un seul créneau parmi ceux publiés par l’enseignant.
 * Pas de saisie libre de date / créneau.
 */
export default function BookingRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, tutors, modules, courseOffers, deductBalance, addRequest, addNotification, reserveOfferSlot } = useApp();
  const { showToast } = useToast();

  const initial = location.state || {};
  const moduleIdFromState = initial.moduleId != null ? Number(initial.moduleId) : null;
  const tutorIdFromState = initial.tutorId != null ? Number(initial.tutorId) : null;
  const preOfferId = initial.offerId != null ? Number(initial.offerId) : null;

  const resolvedTutorId = useMemo(() => {
    if (tutorIdFromState) return tutorIdFromState;
    if (moduleIdFromState) {
      const m = modules.find((x) => x.id === moduleIdFromState);
      return m?.tutorId ?? null;
    }
    return null;
  }, [tutorIdFromState, moduleIdFromState, modules]);

  const publishedOffers = useMemo(() => {
    return courseOffers.filter((o) => o.published !== false && o.slots.length > 0);
  }, [courseOffers]);

  const candidateOffers = useMemo(() => {
    let list = publishedOffers;
    if (preOfferId) list = list.filter((o) => o.id === preOfferId);
    else if (moduleIdFromState) list = list.filter((o) => o.moduleId === moduleIdFromState);
    else if (resolvedTutorId) list = list.filter((o) => o.tutorId === resolvedTutorId);
    return list;
  }, [publishedOffers, preOfferId, moduleIdFromState, resolvedTutorId]);

  const [selectedOfferId, setSelectedOfferId] = useState(() => candidateOffers[0]?.id ?? '');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const first = candidateOffers[0]?.id ?? '';
    setSelectedOfferId((prev) => {
      if (preOfferId && candidateOffers.some((o) => o.id === preOfferId)) return preOfferId;
      if (candidateOffers.some((o) => o.id === prev)) return prev;
      return first;
    });
  }, [candidateOffers, preOfferId]);

  const selectedOffer = useMemo(
    () => candidateOffers.find((o) => o.id === Number(selectedOfferId)),
    [candidateOffers, selectedOfferId]
  );

  useEffect(() => {
    if (!selectedOffer?.slots?.length) {
      setSelectedSlotId('');
      return;
    }
    setSelectedSlotId((prev) => {
      if (selectedOffer.slots.some((s) => s.id === prev)) return prev;
      return selectedOffer.slots[0].id;
    });
  }, [selectedOffer]);

  const selectedTutor = useMemo(() => tutors.find((t) => t.id === selectedOffer?.tutorId), [tutors, selectedOffer]);
  const selectedModule = useMemo(() => modules.find((m) => m.id === selectedOffer?.moduleId), [modules, selectedOffer]);
  const selectedSlot = useMemo(
    () => selectedOffer?.slots?.find((s) => s.id === selectedSlotId),
    [selectedOffer, selectedSlotId]
  );

  const moduleLabel =
    initial.moduleLabel ||
    (selectedModule ? `${selectedModule.title} - ${selectedModule.level}` : selectedOffer?.title || 'Module');

  const hours = selectedOffer?.durationHours ?? 2;
  const balance = currentUser?.balance ?? 0;
  const insufficientBalance = balance < hours;
  const balanceAfter = Math.max(0, balance - hours);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'student') {
      showToast('Seuls les étudiants peuvent envoyer une demande.', 'error');
      return;
    }
    if (candidateOffers.length === 0) {
      showToast('Aucune offre avec créneaux disponible pour ce module ou ce tuteur.', 'error');
      return;
    }
    if (!selectedOffer || !selectedSlot) {
      showToast('Choisissez une offre et un créneau proposé par l’enseignant.', 'error');
      return;
    }
    if (balance < hours) {
      showToast(`Solde insuffisant : ${hours}h requises, vous avez ${balance}h.`, 'error');
      return;
    }

    const slotSnapshot = { id: selectedSlot.id, date: selectedSlot.date, time: selectedSlot.time };

    reserveOfferSlot(selectedOffer.id, selectedSlot.id);

    deductBalance(currentUser.id, hours);
    addRequest({
      from: currentUser.name,
      fromId: currentUser.id,
      toId: selectedOffer.tutorId,
      toName: selectedTutor?.name || 'Tuteur',
      module: moduleLabel,
      date: selectedSlot.date,
      time: selectedSlot.time,
      duration: hours,
      score: currentUser.score ?? 5,
      message: message.trim(),
      offerId: selectedOffer.id,
      slotSnapshot,
    });
    addNotification({
      type: 'request',
      text: `${currentUser.name} demande ${moduleLabel} le ${selectedSlot.date} (${selectedSlot.time}).`,
    });
    showToast(`Demande envoyée avec succès — ${hours}h déduites. En attente de la réponse du tuteur.`, 'success');
    navigate('/student/demandes');
  };

  if (!resolvedTutorId && !moduleIdFromState && !preOfferId) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-white dark:bg-gray-900 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-teal-400" aria-hidden />
            <div className="px-8 py-12 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 ring-1 ring-primary-100/80 dark:ring-primary-800/50">
                <CalendarClock size={28} strokeWidth={1.75} aria-hidden />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Réserver une séance</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                Ouvrez un module ou une fiche tuteur depuis le catalogue pour choisir une offre et un créneau publié.
              </p>
              <button type="button" className="btn-primary mt-8 px-8" onClick={() => navigate('/student/modules')}>
                Parcourir les modules
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm group-hover:border-primary-200 dark:group-hover:border-primary-800 transition-colors">
            <ArrowLeft size={16} aria-hidden />
          </span>
          Retour
        </button>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-br from-white via-gray-50/50 to-primary-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-primary-950/25 px-6 py-8 sm:px-10 sm:py-10 mb-8 shadow-sm">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-400/10 dark:bg-primary-500/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-primary-200/80 dark:border-primary-800/60 bg-primary-50/90 dark:bg-primary-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                Réservation
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Demande de séance
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Choisissez un créneau parmi ceux publiés par l’enseignant. Les horaires personnalisés ne sont pas disponibles sur cette page.
              </p>
            </div>
            {selectedTutor && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/60 px-4 py-3 backdrop-blur-sm">
                <Avatar initials={selectedTutor.avatar || 'T'} src={selectedTutor.avatarPhoto} size="md" alt="" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Enseignant</p>
                  <p className="truncate font-semibold text-gray-900 dark:text-white">{selectedTutor.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <StarRating rating={selectedTutor.score ?? 0} size={12} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedTutor.score ?? '—'} · {selectedTutor.reviews ?? 0} avis
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {candidateOffers.length === 0 ? (
          <div className="max-w-2xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 sm:p-10 shadow-sm">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={22} aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aucun créneau disponible</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  L’enseignant n’a pas encore publié d’offre avec des créneaux pour ce module. Revenez plus tard ou échangez via la messagerie.
                </p>
                <button type="button" className="btn-secondary mt-6 text-sm py-2.5" onClick={() => navigate(-1)}>
                  Retour
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-start">
            <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-7">
              <div className="rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 bg-gray-50/80 dark:bg-gray-800/40">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Votre profil</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Informations transmises avec la demande</p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar initials={currentUser?.avatar || 'U'} src={currentUser?.avatarPhoto} size="lg" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{currentUser?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{currentUser?.email}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {currentUser?.filiere} · {currentUser?.level}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Offre et créneau</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sélection unique parmi les propositions publiées</p>
                </div>
                <div className="p-6 space-y-6">
                  {candidateOffers.length > 1 && (
                    <div>
                      <label htmlFor="booking-offer" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Offre
                      </label>
                      <div className="relative">
                        <select
                          id="booking-offer"
                          value={selectedOfferId}
                          onChange={(e) => setSelectedOfferId(Number(e.target.value))}
                          className="input-field appearance-none cursor-pointer pr-10 dark:bg-gray-800/90 dark:border-gray-600 dark:text-white"
                        >
                          {candidateOffers.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.title} ({o.durationHours}h)
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={18}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                          aria-hidden
                        />
                      </div>
                    </div>
                  )}

                  {selectedTutor && candidateOffers.length <= 1 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm">
                      <User size={16} className="text-gray-400 shrink-0" aria-hidden />
                      <span className="text-gray-500 dark:text-gray-400">Enseignant</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedTutor.name}</span>
                      <StarRating rating={selectedTutor.score ?? 0} size={14} />
                      <span className="text-xs text-gray-400">({selectedTutor.reviews ?? 0} avis)</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                      Créneau
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Un seul choix possible — aligné sur le planning de l’enseignant.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Créneaux disponibles">
                      {selectedOffer?.slots.map((s) => {
                        const active = selectedSlotId === s.id;
                        return (
                          <label
                            key={s.id}
                            className={`relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 ${
                              active
                                ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-950/40 shadow-sm'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name="slot"
                              value={s.id}
                              checked={active}
                              onChange={() => setSelectedSlotId(s.id)}
                              className="mt-1 h-4 w-4 shrink-0 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className={active ? 'text-primary-600' : 'text-gray-400'} aria-hidden />
                                <span className={`text-sm font-semibold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                  {s.date}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 pl-[1.5rem]">{s.time}</p>
                            </div>
                            {active && (
                              <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0" aria-hidden />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking-message" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Message <span className="font-normal text-gray-500">(optionnel)</span>
                    </label>
                    <textarea
                      id="booking-message"
                      rows={4}
                      placeholder="Objectifs, chapitres à revoir, contraintes éventuelles…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={200}
                      className="input-field resize-none dark:bg-gray-800/90 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1.5 tabular-nums">
                      {message.length}/200
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary-200/80 dark:border-primary-800/50 bg-primary-50/60 dark:bg-primary-950/30 px-4 py-3.5 flex gap-3">
                <Shield size={18} className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" aria-hidden />
                <p className="text-xs sm:text-sm text-primary-800 dark:text-primary-200/90 leading-relaxed">
                  Les heures sont déduites à l’envoi. En cas de refus par l’enseignant, votre solde est recrédité et le créneau redevient disponible.
                </p>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 text-base rounded-xl shadow-md shadow-primary-900/10" disabled={insufficientBalance}>
                <Send size={18} aria-hidden />
                Envoyer la demande
              </button>
              {insufficientBalance && (
                <p className="text-center text-xs text-red-600 dark:text-red-400">
                  Solde insuffisant : {hours}h requises, vous avez {balance}h.
                </p>
              )}
            </form>

            <aside className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
              <div className="rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-4 bg-gradient-to-r from-gray-50 to-primary-50/30 dark:from-gray-800/50 dark:to-primary-950/20">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Récapitulatif</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Vérifiez avant envoi</p>
                </div>
                <div className="p-5 space-y-1">
                  {[
                    { icon: User, label: 'Enseignant', val: selectedTutor?.name || '—' },
                    { icon: BookOpen, label: 'Module', val: moduleLabel },
                    {
                      icon: Calendar,
                      label: 'Créneau',
                      val: selectedSlot ? `${selectedSlot.date} · ${selectedSlot.time}` : '—',
                    },
                    { icon: Clock, label: 'Durée', val: `${hours} h` },
                  ].map(({ icon: Icon, label, val }) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800/80 last:border-0"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <Icon size={16} strokeWidth={2} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5 break-words">{val}</p>
                      </div>
                    </div>
                  ))}
                  {selectedTutor && (
                    <div className="flex items-center gap-3 pt-3 mt-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                        <Star size={16} className="fill-amber-400 text-amber-600 dark:text-amber-300" aria-hidden />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Note</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <StarRating rating={selectedTutor.score ?? 0} size={14} />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedTutor.score ?? '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  insufficientBalance
                    ? 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/25'
                    : 'border-amber-200/90 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex gap-3">
                  <AlertTriangle
                    size={20}
                    className={`shrink-0 mt-0.5 ${insufficientBalance ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${insufficientBalance ? 'text-red-800 dark:text-red-300' : 'text-amber-900 dark:text-amber-200'}`}>
                      Solde TimeBank
                    </p>
                    <p className="text-xs mt-1.5 leading-relaxed text-amber-800/90 dark:text-amber-200/80">
                      {hours} h seront déduites à l’envoi de la demande.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/80 dark:bg-gray-900/50 border border-amber-100/80 dark:border-amber-900/30 px-3 py-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Actuel</p>
                        <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{balance}h</p>
                      </div>
                      <div className="rounded-xl bg-white/80 dark:bg-gray-900/50 border border-amber-100/80 dark:border-amber-900/30 px-3 py-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Après envoi</p>
                        <p className={`text-lg font-bold tabular-nums ${insufficientBalance ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {insufficientBalance ? '—' : `${balanceAfter}h`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
