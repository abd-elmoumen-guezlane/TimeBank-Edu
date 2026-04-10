import { useState } from 'react';
import { Shield, Bell, Eye, Settings, Save, Lock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LOCALES } from '../../i18n/messages';

const tabs = [
  { id: 'preferences', labelKey: 'settings.tabs.preferences', icon: Settings },
  { id: 'securite', labelKey: 'settings.tabs.security', icon: Shield },
  { id: 'notifications', labelKey: 'settings.tabs.notifications', icon: Bell },
  { id: 'confidentialite', labelKey: 'settings.tabs.privacy', icon: Eye },
];

const LANG_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];

export default function AccountSettings() {
  const { darkMode, setDarkMode, locale, setLocale, t } = useApp();
  const [activeTab, setActiveTab] = useState('preferences');
  const [savedMsg, setSavedMsg] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [notifPrefs, setNotifPrefs] = useState({
    emailRequests: true,
    emailReminders: true,
    pushMessages: true,
    digestWeekly: false,
  });
  const [privacyPrefs, setPrivacyPrefs] = useState({
    profilePublic: true,
    showStats: true,
    analytics: true,
  });

  const showSaved = () => {
    setSavedMsg(t('settings.saved'));
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.next || passwordForm.next.length < 8) {
      setSavedMsg(t('settings.security.errShort'));
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setSavedMsg(t('settings.security.errMatch'));
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }
    setPasswordForm({ current: '', next: '', confirm: '' });
    setSavedMsg(t('settings.security.success'));
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('settings.subtitle')}</p>
        {savedMsg && <p className="text-sm text-primary-600 mt-2 dark:text-primary-400">{savedMsg}</p>}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
          >
            <Icon size={14} /> {t(labelKey)}
          </button>
        ))}
      </div>

      {activeTab === 'preferences' && (
        <div className="max-w-lg card space-y-4 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('settings.preferences.title')}</h3>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{t('settings.preferences.darkMode')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.preferences.darkModeHint')}</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
              aria-pressed={darkMode}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl gap-3">
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{t('settings.preferences.language')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.preferences.languageHint')}</p>
            </div>
            <select
              value={locale}
              onChange={(e) => {
                const v = e.target.value;
                if (SUPPORTED_LOCALES.includes(v)) setLocale(v);
              }}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-2 py-1.5 text-sm dark:text-white shrink-0"
            >
              {LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeTab === 'securite' && (
        <form onSubmit={handleSavePassword} className="max-w-lg card space-y-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={18} className="text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('settings.security.title')}</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.security.demo')}</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('settings.security.current')}</label>
            <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="input-field dark:bg-gray-900 dark:border-gray-600 dark:text-white" autoComplete="current-password" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('settings.security.new')}</label>
            <input type="password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} className="input-field dark:bg-gray-900 dark:border-gray-600 dark:text-white" autoComplete="new-password" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('settings.security.confirm')}</label>
            <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input-field dark:bg-gray-900 dark:border-gray-600 dark:text-white" autoComplete="new-password" />
          </div>
          <button type="submit" className="btn-primary py-2.5 inline-flex items-center gap-2">
            <Save size={15} /> {t('settings.security.submit')}
          </button>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-lg card space-y-3 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('settings.notifications.title')}</h3>
          {[
            { key: 'emailRequests', labelKey: 'settings.notifications.emailRequests', subKey: 'settings.notifications.emailRequestsSub' },
            { key: 'emailReminders', labelKey: 'settings.notifications.reminders', subKey: 'settings.notifications.remindersSub' },
            { key: 'pushMessages', labelKey: 'settings.notifications.push', subKey: 'settings.notifications.pushSub' },
            { key: 'digestWeekly', labelKey: 'settings.notifications.digest', subKey: 'settings.notifications.digestSub' },
          ].map(({ key, labelKey, subKey }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
              <div>
                <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{t(labelKey)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t(subKey)}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${notifPrefs[key] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${notifPrefs[key] ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => showSaved()} className="btn-primary py-2.5 w-full sm:w-auto">
            {t('settings.notifications.save')}
          </button>
        </div>
      )}

      {activeTab === 'confidentialite' && (
        <div className="max-w-lg card space-y-3 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('settings.privacy.title')}</h3>
          {[
            { key: 'profilePublic', labelKey: 'settings.privacy.profile', subKey: 'settings.privacy.profileSub' },
            { key: 'showStats', labelKey: 'settings.privacy.stats', subKey: 'settings.privacy.statsSub' },
            { key: 'analytics', labelKey: 'settings.privacy.analytics', subKey: 'settings.privacy.analyticsSub' },
          ].map(({ key, labelKey, subKey }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
              <div>
                <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{t(labelKey)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t(subKey)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyPrefs((p) => ({ ...p, [key]: !p[key] }))}
                className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${privacyPrefs[key] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${privacyPrefs[key] ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => showSaved()} className="btn-primary py-2.5 w-full sm:w-auto">
            {t('settings.privacy.save')}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
