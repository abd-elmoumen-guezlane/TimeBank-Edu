import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ClipboardList, CheckCircle2, MessageCircle, Clock, Star, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { filterNotificationsForUser } from '../../utils/notificationVisibility';

const unreadCount = (list) => list?.filter((n) => !n.read).length ?? 0;

const tabs = ['Toutes', 'Non lues', 'Messages'];

const notifIcons = {
  request: ClipboardList,
  confirmed: CheckCircle2,
  message: MessageCircle,
  reminder: Clock,
  evaluation: Star,
  convocation: ShieldAlert,
};
const notifColors = {
  request: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300',
  message: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
  reminder: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200',
  evaluation: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
  convocation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

export default function Notifications() {
  const { notifications, markNotifRead, markAllNotifRead, t, currentUser } = useApp();
  const visible = useMemo(() => filterNotificationsForUser(notifications, currentUser), [notifications, currentUser]);
  const unread = unreadCount(visible);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('nav.notifications')}</h1>
        <button
          type="button"
          onClick={() => markAllNotifRead()}
          disabled={unread === 0}
          title={t('nav.markAllRead')}
          aria-label={t('nav.markAllRead')}
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Check size={18} strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'Toutes' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-w-2xl">
        {visible.map((n) => (
          <div
            key={n.id}
            className={`card w-full text-left flex items-start gap-3 transition-all dark:border-gray-700 dark:bg-gray-800 ${!n.read ? 'border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800' : ''}`}
          >
            <button
              type="button"
              onClick={() => {
                if (!n.locked) markNotifRead(n.id);
              }}
              className={`flex flex-1 min-w-0 items-start gap-3 text-left ${n.locked ? 'cursor-default' : 'cursor-pointer hover:opacity-90'}`}
            >
              <div
                className={`w-10 h-10 ${notifColors[n.type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                {(() => {
                  const Icon = notifIcons[n.type] || Bell;
                  return <Icon size={18} strokeWidth={2} aria-hidden />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {n.text}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                {n.locked ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-medium">
                    En suspens jusqu’à traitement administratif de votre justification.
                  </p>
                ) : null}
              </div>
              {!n.read && !n.locked && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" aria-hidden />}
            </button>
            {n.locked && currentUser?.role === 'student' ? (
              <Link
                to="/student/discipline"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 whitespace-nowrap self-center shrink-0 hover:underline"
              >
                Répondre
              </Link>
            ) : null}
          </div>
        ))}
      </div>

    </DashboardLayout>
  );
}
