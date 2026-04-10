import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MapPin, Monitor, Clock, Award, Check, Star } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import { useApp } from '../../context/AppContext';

function TutorDetailContent({ tutorId }) {
  const navigate = useNavigate();
  const { tutors, modules, courseOffers } = useApp();
  const tutor = tutors.find((t) => t.id === parseInt(tutorId, 10)) || tutors[0];
  const tutorModules = modules.filter((m) => m.tutorId === tutor?.id && (m.status === 'published' || m.status === 'pending'));

  const publishedSlotsByOffer = useMemo(() => {
    return courseOffers
      .filter((o) => o.tutorId === tutor?.id && o.published !== false && o.slots.length > 0)
      .map((o) => ({
        offerId: o.id,
        title: o.title,
        durationHours: o.durationHours ?? 2,
        slots: o.slots,
      }));
  }, [courseOffers, tutor?.id]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={18} /> Retour
        </button>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Share2 size={16} className="text-gray-500" />
          </button>
          <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Heart size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="flex items-start gap-4 mb-4">
              <Avatar initials={tutor.avatar} size="xl" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{tutor.name}</h1>
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><Check size={11} className="text-white" /></span>
                </div>
                <p className="text-gray-500 text-sm">Tuteur en {tutor.filiere}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={tutor.score} size={14} />
                  <span className="font-semibold text-gray-800">{tutor.score}</span>
                  <span className="text-gray-400 text-sm">({tutor.reviews} avis)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Monitor size={15} className="text-primary-500" />
                <span>Format: <strong>{tutor.format}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={15} className="text-primary-500" />
                <span>Disponibilités: <strong>Lun, Mer, Ven 18h-20h</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Award size={15} className="text-primary-500" />
                <span>Expérience: <strong>{tutor.experience}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Star size={15} className="text-primary-500" />
                <span>Réussite: <strong>{tutor.successRate}</strong></span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">À propos</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{tutor.bio}</p>
            </div>
            {tutorModules.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">Modules proposés</h3>
                <ul className="flex flex-wrap gap-2">
                  {tutorModules.map((m) => (
                    <li key={m.id} className="badge-blue text-xs">
                      {m.title} ({m.level})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Avis des étudiants</h3>
              <button className="text-xs text-primary-600 hover:underline">Voir tous</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Sara Benali', avatar: 'SB', score: 5, text: 'Excellent tuteur, très pédagogue et patient !', time: 'Il y a 2 semaines' },
                { name: 'Ali Karim', avatar: 'AK', score: 4, text: 'Très bonne explication, je recommande.', time: 'Il y a 1 mois' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Avatar initials={r.avatar} size="sm" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                      <StarRating rating={r.score} size={12} />
                    </div>
                    <p className="text-xs text-gray-600">{r.text}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{r.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-2">Créneaux publiés</h3>
            <p className="text-xs text-gray-500 mb-4">Horaires fixés par l’enseignant. À la réservation, vous en choisissez un seul.</p>
            <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">
              {publishedSlotsByOffer.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune offre avec créneaux pour le moment.</p>
              ) : (
                publishedSlotsByOffer.map((block) => (
                  <div key={block.offerId}>
                    <p className="text-xs font-semibold text-gray-600 mb-1">{block.title}</p>
                    <p className="text-[10px] text-gray-400 mb-2">{block.durationHours}h / séance</p>
                    <div className="space-y-2">
                      {block.slots.map((s) => (
                        <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm border border-primary-200 bg-primary-50">
                          <span className="text-gray-700">
                            {s.date} · {s.time}
                          </span>
                          <span className="badge-green text-[10px]">Proposé</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-primary-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-primary-700 font-medium">Réserver</p>
              <p className="text-xs text-primary-500 mt-1">Choisissez un créneau parmi ceux publiés ; l’enseignant acceptera ou refusera.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate('/booking/new', {
                  state: { tutorId: tutor.id, tutorName: tutor.name },
                })
              }
              className="btn-primary w-full py-3"
            >
              Choisir un créneau et demander
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TutorDetail() {
  const { id } = useParams();
  const { currentUser } = useApp();

  if (currentUser) {
    return <DashboardLayout><TutorDetailContent tutorId={id || '3'} /></DashboardLayout>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <TutorDetailContent tutorId={id || '3'} />
      </div>
    </div>
  );
}
